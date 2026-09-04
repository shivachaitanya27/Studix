import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

async function testPhase1() {
  console.log('🧪 ==========================================');
  console.log('🧪 STUDIX PHASE 1 COMPREHENSIVE VERIFICATION');
  console.log('🧪 ==========================================');

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
    // 1. Health check
    console.log('\n--- 1. Testing Health Endpoint ---');
    const healthRes = await axios.get(`${API_BASE}/health`);
    assert(healthRes.status === 200, 'Health endpoint status 200');
    assert(healthRes.data.status === 'online', 'Service status is online');

    // 2. Fetch Colleges
    console.log('\n--- 2. Testing Academic Colleges Endpoint ---');
    const collegesRes = await axios.get(`${API_BASE}/academic/colleges`);
    assert(collegesRes.status === 200, 'Colleges status 200');
    assert(Array.isArray(collegesRes.data.data), 'Colleges data is an array');
    assert(collegesRes.data.data.length >= 4, `Colleges count is ${collegesRes.data.data.length}`);
    const college = collegesRes.data.data[0];
    console.log(`   Sample College: ${college.name} (${college.code})`);

    // 3. Fetch Departments
    console.log('\n--- 3. Testing Academic Departments Endpoint ---');
    const deptsRes = await axios.get(`${API_BASE}/academic/departments/${college.id}`);
    assert(deptsRes.status === 200, 'Departments status 200');
    assert(Array.isArray(deptsRes.data.data), 'Departments data is an array');
    assert(deptsRes.data.data.length >= 2, `Departments count is ${deptsRes.data.data.length}`);
    const department = deptsRes.data.data.find(d => d.code === 'CSE') || deptsRes.data.data[0];
    console.log(`   Sample Department: ${department.name} (${department.code})`);

    // 4. User Registration (Signup)
    console.log('\n--- 4. Testing User Signup ---');
    const testEmail = `scholar_${Date.now()}@studix.edu`;
    const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
      email: testEmail,
      password: 'StrongPassword123!',
      fullName: 'Jordan Lee',
    });
    assert(signupRes.status === 201, 'Signup status 201');
    assert(signupRes.data.success === true, 'Signup success flag is true');
    assert(Boolean(signupRes.data.data.token), 'JWT Token returned');
    assert(signupRes.data.data.user.email === testEmail, 'User email matches');
    const token = signupRes.data.data.token;

    // 5. User Login
    console.log('\n--- 5. Testing User Login ---');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(loginRes.status === 200, 'Login status 200');
    assert(Boolean(loginRes.data.data.token), 'Login returns active session token');
    assert(loginRes.data.data.user.full_name === 'Jordan Lee', 'User full name matches');

    // 6. Forgot Password
    console.log('\n--- 6. Testing Forgot Password ---');
    const forgotRes = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email: testEmail,
    });
    assert(forgotRes.status === 200, 'Forgot password status 200');
    assert(Boolean(forgotRes.data.message), 'Reset email message dispatched');

    // 7. Get Current User Profile (Protected /auth/me)
    console.log('\n--- 7. Testing Protected /auth/me ---');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(meRes.status === 200, 'Protected profile status 200');
    assert(meRes.data.data.email === testEmail, 'Profile email verified');

    // 8. Onboarding Flow (Select College -> Department -> Year -> Semester)
    console.log('\n--- 8. Testing Academic Onboarding Flow ---');
    const onboardingRes = await axios.post(
      `${API_BASE}/academic/onboarding`,
      {
        collegeId: college.id,
        departmentId: department.id,
        academicYear: 3,
        semester: 5,
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    assert(onboardingRes.status === 200, 'Onboarding submission status 200');
    assert(onboardingRes.data.success === true, 'Onboarding success flag true');
    assert(onboardingRes.data.data.user.isOnboardingComplete === true, 'isOnboardingComplete is true');
    assert(onboardingRes.data.data.user.college.id === college.id, 'User college saved correctly');
    assert(onboardingRes.data.data.user.department.id === department.id, 'User department saved correctly');
    assert(onboardingRes.data.data.user.academic_year === 3, 'User academic_year saved as 3');
    assert(onboardingRes.data.data.user.semester === 5, 'User semester saved as 5');
    assert(Array.isArray(onboardingRes.data.data.subjects), 'Subjects array returned for active stream');
    console.log(`   Enrolled Subjects count for Y3 S5: ${onboardingRes.data.data.subjects.length}`);

    // 9. Query Enrolled Subjects
    console.log('\n--- 9. Testing Subjects Query Endpoint ---');
    const subjectsRes = await axios.get(`${API_BASE}/academic/subjects`, {
      params: {
        departmentId: department.id,
        year: 3,
        semester: 5,
      }
    });
    assert(subjectsRes.status === 200, 'Subjects query status 200');
    assert(subjectsRes.data.data.length > 0, `Returned ${subjectsRes.data.data.length} curriculum subjects`);
    subjectsRes.data.data.forEach((s) => {
      console.log(`   - [${s.code}] ${s.name}`);
    });

    console.log('\n==========================================');
    console.log(`🎯 TOTAL RESULTS: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('==========================================\n');

    if (testFailed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase1();
