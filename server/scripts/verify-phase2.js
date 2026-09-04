import axios from 'axios';
import FormData from 'form-data';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

async function testPhase2() {
  console.log('🧪 ========================================================');
  console.log('🧪 STUDIX PHASE 2 VERIFICATION: REPOSITORY & UPLOAD PIPELINE');
  console.log('🧪 ========================================================');

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      testFailed++;
    }
  }

  try {
    // 1. Authenticate user to get Bearer token
    console.log('\n--- 1. Authenticating Demo Student ---');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@studix.edu',
      password: 'password123',
    });
    assert(loginRes.status === 200, 'Student login succeeded');
    const token = loginRes.data.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Fetch shared repository
    console.log('\n--- 2. Testing Repository Query (GET /api/v1/resources) ---');
    const resList = await axios.get(`${API_BASE}/resources`);
    assert(resList.status === 200, 'GET /resources status 200');
    assert(Array.isArray(resList.data.data), 'Resources is array');
    assert(resList.data.data.length >= 6, `Found ${resList.data.data.length} pre-seeded resources`);
    console.log(`   Sample Resource: "${resList.data.data[0].title}" [${resList.data.data[0].resource_type}]`);

    // 3. Multi-filter: Filter by resourceType = SEMESTER_PAPER
    console.log('\n--- 3. Testing Resource Type Filtering ---');
    const papersRes = await axios.get(`${API_BASE}/resources`, {
      params: { resourceType: 'SEMESTER_PAPER' }
    });
    assert(papersRes.status === 200, 'Filter SEMESTER_PAPER status 200');
    assert(
      papersRes.data.data.every(r => r.resource_type === 'SEMESTER_PAPER'),
      'All returned items are SEMESTER_PAPER'
    );
    console.log(`   Returned ${papersRes.data.data.length} semester papers.`);

    // 4. Global Search query
    console.log('\n--- 4. Testing Global Multi-Filter Search ---');
    const searchRes = await axios.get(`${API_BASE}/resources`, {
      params: { search: 'Compiler' }
    });
    assert(searchRes.status === 200, 'Search status 200');
    assert(searchRes.data.data.length > 0, 'Found matching resources for "Compiler"');
    console.log(`   Found: "${searchRes.data.data[0].title}"`);

    // 5. Upload Valid Academic Document
    console.log('\n--- 5. Testing Document Ingestion Pipeline (POST /upload) ---');
    const uniqueContent = `JNTUH Department of Computer Science and Engineering\nSubject: Operating Systems (CS402PC)\nTopic: Process Synchronization & Semaphores\nDate: ${Date.now()}`;
    const form1 = new FormData();
    form1.append('file', Buffer.from(uniqueContent), {
      filename: `OS_Unit3_Notes_${Date.now()}.pdf`,
      contentType: 'application/pdf',
    });
    form1.append('title', 'Operating Systems - Process Synchronization Notes');
    form1.append('resourceType', 'UNIT_NOTES');
    form1.append('year', '2');
    form1.append('semester', '4');

    const uploadRes = await axios.post(`${API_BASE}/resources/upload`, form1, {
      headers: { ...authHeaders, ...form1.getHeaders() }
    });
    assert(uploadRes.status === 201, 'Upload status 201 Created');
    assert(uploadRes.data.success === true, 'Upload success is true');
    assert(uploadRes.data.data.resource.status === 'APPROVED', 'Resource status is APPROVED');
    assert(Boolean(uploadRes.data.data.resource.file_hash), 'SHA-256 file_hash computed and stored');
    const uploadedResource = uploadRes.data.data.resource;
    console.log(`   Saved with SHA-256 Hash: ${uploadedResource.file_hash}`);

    // 6. Test SHA-256 Duplicate File Detection (Must Reject with 409)
    console.log('\n--- 6. Testing Pre-Storage SHA-256 Duplicate Detection ---');
    const formDup = new FormData();
    formDup.append('file', Buffer.from(uniqueContent), {
      filename: 'Different_Name_Same_File.pdf',
      contentType: 'application/pdf',
    });
    formDup.append('title', 'A Copy of OS Notes');
    formDup.append('resourceType', 'UNIT_NOTES');

    let duplicateRejected = false;
    try {
      await axios.post(`${API_BASE}/resources/upload`, formDup, {
        headers: { ...authHeaders, ...formDup.getHeaders() }
      });
    } catch (dupErr) {
      if (dupErr.response && dupErr.response.status === 409) {
        duplicateRejected = true;
        console.log(`   Server responded with 409 Conflict: "${dupErr.response.data.message}"`);
      }
    }
    assert(duplicateRejected, 'Duplicate SHA-256 file rejected before storage with 409 Conflict');

    // 7. Test OpenRouter / Gemini AI Moderation Rejection
    console.log('\n--- 7. Testing AI Inspection Rejection for Non-Academic Photo/Selfie ---');
    const nonAcademicContent = 'Non academic personal selfie picture content simulation';
    const formSelfie = new FormData();
    formSelfie.append('file', Buffer.from(nonAcademicContent), {
      filename: 'my_vacation_selfie.jpg',
      contentType: 'image/jpeg',
    });
    formSelfie.append('title', 'Summer Break Selfie');
    formSelfie.append('resourceType', 'REFERENCE_MATERIAL');

    let selfieRejected = false;
    let rejectionMessage = '';
    try {
      await axios.post(`${API_BASE}/resources/upload`, formSelfie, {
        headers: { ...authHeaders, ...formSelfie.getHeaders() }
      });
    } catch (aiErr) {
      if (aiErr.response && aiErr.response.status === 422) {
        selfieRejected = true;
        rejectionMessage = aiErr.response.data.message;
        console.log(`   Server responded with 422 Unprocessable Entity: "${rejectionMessage}"`);
      }
    }
    assert(selfieRejected, 'Non-academic selfie rejected with 422 status');
    assert(
      rejectionMessage === 'This file is not a valid academic resource.',
      'Exact rejection message: "This file is not a valid academic resource."'
    );

    // 8. Test Bookmarking Feature
    console.log('\n--- 8. Testing Bookmarking Feature ---');
    const bookmarkRes = await axios.post(
      `${API_BASE}/resources/${uploadedResource.id}/bookmark`,
      {},
      { headers: authHeaders }
    );
    assert(bookmarkRes.status === 200, 'Bookmark toggle status 200');
    assert(bookmarkRes.data.data.isBookmarked === true, 'isBookmarked is true');

    // 9. Fetch User Bookmarks
    console.log('\n--- 9. Testing User Bookmarks Query ---');
    const myBookmarks = await axios.get(`${API_BASE}/resources/user/bookmarks`, {
      headers: authHeaders
    });
    assert(myBookmarks.status === 200, 'GET /resources/user/bookmarks status 200');
    assert(
      myBookmarks.data.data.some(b => b.id === uploadedResource.id),
      'Bookmarked resource is present in user bookmarks list'
    );
    console.log(`   Found ${myBookmarks.data.data.length} bookmarked resource(s).`);

    console.log('\n========================================================');
    console.log(`🎯 TOTAL RESULTS: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('========================================================\n');

    if (testFailed === 0) process.exit(0);
    else process.exit(1);
  } catch (err) {
    console.error('Phase 2 test execution failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase2();
