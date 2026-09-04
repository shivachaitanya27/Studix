import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase4Verification() {
  console.log('🧪 ========================================================');
  console.log('🧪 STUDIX PHASE 4: ADMIN OPERATING SYSTEM, FORMAT WHITELIST & SECURITY');
  console.log('🧪 ========================================================');

  try {
    // 1. Authenticate Student and Admin
    console.log('\n--- 1. Authenticating Student & Administrator ---');
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@studix.edu',
      password: 'password123',
    });
    const studentToken = studentLogin.data.data.token;
    assert(studentToken, 'Student authenticated');

    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@studix.edu',
      password: 'password123',
    });
    const adminToken = adminLogin.data.data.token;
    assert(adminToken, 'Administrator authenticated');


    // 2. Strict Document Format Restrictions (Reject images, accept PDF/DOC/PPT only)
    console.log('\n--- 2. Testing Strict Document Format Enforcement ---');
    
    // Test 2a: Reject Image Upload with 400
    try {
      const imgForm = new FormData();
      imgForm.append('file', Buffer.from('fake image content'), {
        filename: 'campus_selfie.png',
        contentType: 'image/png',
      });
      imgForm.append('title', 'Selfie Upload Test');
      imgForm.append('resourceType', 'UNIT_NOTES');

      await axios.post(`${BASE_URL}/resources/upload`, imgForm, {
        headers: {
          ...imgForm.getHeaders(),
          Authorization: `Bearer ${studentToken}`,
        },
      });
      assert(false, 'Image upload should have been rejected');
    } catch (err) {
      assert(
        err.response?.status === 400,
        `Image upload rejected with 400 Bad Request (Status: ${err.response?.status})`
      );
      assert(
        err.response?.data?.message?.includes('Only PDF, Word'),
        `Exact format rejection message: "${err.response?.data?.message}"`
      );
    }

    // Test 2b: Accept PDF Upload
    const pdfForm = new FormData();
    pdfForm.append('file', Buffer.from('%PDF-1.5 Computer Architecture Unit 1 Instruction Sets and Pipeline Notes'), {
      filename: `CA_Unit1_Notes_${Date.now()}.pdf`,
      contentType: 'application/pdf',
    });
    pdfForm.append('title', `Computer Architecture Notes ${Date.now()}`);
    pdfForm.append('resourceType', 'UNIT_NOTES');

    const uploadRes = await axios.post(`${BASE_URL}/resources/upload`, pdfForm, {
      headers: {
        ...pdfForm.getHeaders(),
        Authorization: `Bearer ${studentToken}`,
      },
    });
    assert(uploadRes.status === 201, 'PDF upload accepted into academic archive');
    const uploadedResource = uploadRes.data.data.resource || uploadRes.data.data;


    // 3. RBAC Admin Role Guard
    console.log('\n--- 3. Testing RBAC Role Security (Student vs Admin Access) ---');
    
    // Student trying to access admin moderation queue
    try {
      await axios.get(`${BASE_URL}/admin/moderation/queue`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert(false, 'Student should not access admin moderation queue');
    } catch (err) {
      assert(
        err.response?.status === 403,
        `Student access correctly rejected with 403 Forbidden (Status: ${err.response?.status})`
      );
    }

    // Admin accessing moderation queue
    const queueRes = await axios.get(`${BASE_URL}/admin/moderation/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(queueRes.status === 200, 'Admin moderation queue accessed successfully');
    assert(Array.isArray(queueRes.data.data), 'Moderation queue is an array');

    // 4. Admin Review Actions (Approve and Reject)
    console.log('\n--- 4. Testing Admin Approval & Rejection Workflows ---');
    
    // Approve resource
    const approveRes = await axios.post(
      `${BASE_URL}/admin/moderation/${uploadedResource.id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(approveRes.status === 200, 'Admin approve resource succeeded');
    assert(approveRes.data.data.status === 'APPROVED', 'Resource status updated to APPROVED');

    // Reject resource with custom reason
    const rejectRes = await axios.post(
      `${BASE_URL}/admin/moderation/${uploadedResource.id}/reject`,
      { rejectionReason: 'Incomplete unit syllabus coverage. Please re-upload full notes.' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(rejectRes.status === 200, 'Admin reject resource succeeded');
    assert(rejectRes.data.data.status === 'REJECTED', 'Resource status updated to REJECTED');
    assert(
      rejectRes.data.data.rejection_reason.includes('Incomplete unit'),
      'Rejection reason recorded successfully'
    );

    // 5. AI Moderation Logs
    console.log('\n--- 5. Testing AI Rejection Audit Logs ---');
    const logsRes = await axios.get(`${BASE_URL}/admin/moderation/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(logsRes.status === 200, 'AI moderation logs fetched');
    assert(logsRes.data.data.length > 0, `Found ${logsRes.data.data.length} audit inspection log entries`);

    // 6. Platform Analytics & Upload Velocity
    console.log('\n--- 6. Testing Real-Time Platform Analytics ---');
    const analyticsRes = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200, 'Platform analytics retrieved');
    const analytics = analyticsRes.data.data;
    assert(analytics.totalResources !== undefined, `Total Resources: ${analytics.totalResources}`);
    assert(analytics.uploadVelocity !== undefined, `Upload Velocity: ${analytics.uploadVelocity}`);
    assert(analytics.flagRate !== undefined, `Flag Rate: ${analytics.flagRate}`);
    assert(Array.isArray(analytics.topColleges), `Top Colleges recorded: ${analytics.topColleges.length}`);

    // 7. Security Hardening Headers & Rate Limiting
    console.log('\n--- 7. Testing Helmet Security Headers & Rate Limiting ---');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200, 'Health endpoint responds 200');
    assert(
      healthRes.headers['x-content-type-options'] === 'nosniff',
      'Helmet X-Content-Type-Options nosniff header present'
    );
    assert(
      healthRes.headers['ratelimit-limit'] !== undefined,
      `Rate limit limit header present: ${healthRes.headers['ratelimit-limit']}`
    );
    assert(
      healthRes.headers['ratelimit-remaining'] !== undefined,
      `Rate limit remaining header present: ${healthRes.headers['ratelimit-remaining']}`
    );

    console.log('\n========================================================');
    console.log(`🎯 TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Phase 4 verification failure:', error.response?.data || error.message);
    process.exit(1);
  }
}

runPhase4Verification();
