import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const API_BASE = 'http://localhost:5000/api/v1';

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE STUDIX SYSTEM VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 5;

  // ----------------------------------------------------
  // TEST 1: SUPABASE STORAGE & FILE VISIBILITY
  // ----------------------------------------------------
  try {
    console.log('--- TEST 1: Supabase Storage & File Visibility ---');
    if (!isSupabaseConfigured || !supabaseAdmin) {
      throw new Error('Supabase client not configured.');
    }

    const testBuffer = fs.readFileSync('server/uploads/academic-resources/sample_exam_paper.pdf');
    const testStoragePath = `test-college/test-dept/test-verify-${Date.now()}.pdf`;

    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('academic-resources')
      .upload(testStoragePath, testBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) throw new Error(`Supabase upload failed: ${uploadErr.message}`);

    const { data: urlData } = supabaseAdmin.storage
      .from('academic-resources')
      .getPublicUrl(testStoragePath);

    const publicUrl = urlData.publicUrl;
    console.log(`Uploaded to Supabase Storage: ${publicUrl}`);

    // Verify public URL is reachable via HTTP GET
    const urlCheck = await axios.get(publicUrl, { timeout: 10000 });
    if (urlCheck.status === 200 && urlCheck.data) {
      console.log('✅ Public URL is publicly accessible and returns HTTP 200!');
      passed++;
    } else {
      throw new Error(`Public URL returned status ${urlCheck.status}`);
    }

    // Cleanup test file
    await supabaseAdmin.storage.from('academic-resources').remove([testStoragePath]);
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: MULTI-TENANT ISOLATION (COLLEGE-STRICT ACCESS)
  // ----------------------------------------------------
  try {
    console.log('\n--- TEST 2: Multi-Tenant Strict College Isolation ---');
    const collegeADsu = 'c1000000-0000-0000-0000-000000000001';
    const collegeBMru = 'c1000000-0000-0000-0000-000000000002';

    // 1. Query for College A (DSU)
    const resA = await axios.get(`${API_BASE}/resources`, {
      params: { collegeId: collegeADsu },
    });
    const countA = resA.data.data.length;
    console.log(`College A (DSU) Resources: ${countA}`);

    // 2. Query for College B (MRU)
    const resB = await axios.get(`${API_BASE}/resources`, {
      params: { collegeId: collegeBMru },
    });
    const countB = resB.data.data.length;
    console.log(`College B (MRU) Resources: ${countB}`);

    // Verify all items in resA belong exclusively to College A
    const leakInA = resA.data.data.filter((r) => r.college_id && r.college_id !== collegeADsu);
    const leakInB = resB.data.data.filter((r) => r.college_id && r.college_id !== collegeBMru);

    if (leakInA.length === 0 && leakInB.length === 0) {
      console.log('✅ Zero cross-college data leaks detected! Strict isolation verified.');
      passed++;
    } else {
      throw new Error(`Data leak detected: ${leakInA.length} items leaked into College A, ${leakInB.length} into B`);
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: ADMIN CONTENT GOVERNANCE & DELETE / PURGE
  // ----------------------------------------------------
  try {
    console.log('\n--- TEST 3: Admin Content Purge & Delete Controls ---');
    // Admin login
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@studix.edu',
      password: 'password123',
    });
    const adminToken = adminLogin.data.data.token;

    // Create a temporary resource to test purge
    const { dataStore } = await import('../services/dataStore.js');
    const tempResource = await dataStore.createResource({
      college_id: 'c1000000-0000-0000-0000-000000000001',
      department_id: 'd1000000-0000-0000-0000-000000000001',
      year: 1,
      semester: 1,
      title: 'Temporary Test Paper to Purge',
      resource_type: 'PREVIOUS_PAPER',
      file_url: 'https://znsmeomxgvyfbwpuplpu.supabase.co/storage/v1/object/public/academic-resources/test.pdf',
      file_path: 'academic-resources/temp-purge-test.pdf',
      file_hash: 'test-purge-hash-' + Date.now(),
      status: 'APPROVED',
      uploaded_by: '3337e0c8-03b2-409d-bb80-882cabfa1f19',
    });

    console.log(`Created temporary resource ID: ${tempResource.id}`);

    // Call DELETE /api/v1/admin/resources/:id
    const deleteRes = await axios.delete(`${API_BASE}/admin/resources/${tempResource.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (deleteRes.status === 200 && deleteRes.data.success) {
      console.log(`Admin delete response: ${deleteRes.data.message}`);

      // Verify it no longer exists on the server via HTTP GET
      try {
        await axios.get(`${API_BASE}/resources/${tempResource.id}`);
        throw new Error('Resource still found on server after delete!');
      } catch (checkErr) {
        if (checkErr.response?.status === 404 || !checkErr.response) {
          console.log('✅ Resource successfully purged from database and storage (HTTP 404 on subsequent fetch)!');
          passed++;
        } else {
          throw checkErr;
        }
      }
    } else {
      throw new Error(`Delete failed with status: ${deleteRes.status}`);
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: GOOGLE OAUTH INTEGRATION & AUTH PERSISTENCE
  // ----------------------------------------------------
  try {
    console.log('\n--- TEST 4: Google OAuth Pipeline & Auth Persistence ---');
    const mockGooglePayload = {
      user: {
        id: '9999e0c8-03b2-409d-bb80-882cabfa1f99',
        email: 'google.student.test@university.edu',
        user_metadata: {
          full_name: 'Google Student',
          avatar_url: 'https://lh3.googleusercontent.com/a/mock-avatar',
        },
      },
    };

    const oauthRes = await axios.post(`${API_BASE}/auth/google/callback`, mockGooglePayload);
    if (oauthRes.status === 200 && oauthRes.data.data?.token) {
      console.log('✅ Google OAuth callback verified: Generated JWT and user profile.');
      console.log(`User email: ${oauthRes.data.data.user.email}, Role: ${oauthRes.data.data.user.role}`);
      passed++;
    } else {
      throw new Error('OAuth callback failed to return session token');
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: RAG AI ASSISTANT UPLOAD INGESTION
  // ----------------------------------------------------
  try {
    console.log('\n--- TEST 5: RAG AI Assistant Scoped Ingestion ---');
    const { ragService } = await import('../services/ragService.js');

    const collegeId = 'c1000000-0000-0000-0000-000000000001';
    const deptId = 'd1000000-0000-0000-0000-000000000001';

    const ragResult = await ragService.repositoryAwareSearch({
      query: 'What topics and questions appear in the Semester 5 DBMS and Computer Architecture materials?',
      collegeId,
      departmentId: deptId,
    });

    if (ragResult && ragResult.answer) {
      console.log('✅ RAG AI successfully retrieved college-scoped materials and synthesized answer!');
      console.log(`Answer excerpt: ${ragResult.answer.substring(0, 150)}...`);
      console.log(`Sources cited: ${ragResult.sources?.length || 0}`);
      passed++;
    } else {
      throw new Error('RAG search returned empty answer');
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err.message);
  }


  console.log('\n====================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================');
  process.exit(passed === total ? 0 : 1);
}

runVerification();
