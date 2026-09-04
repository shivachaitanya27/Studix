import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

async function testPhase3() {
  console.log('🧪 ========================================================');
  console.log('🧪 STUDIX PHASE 3: OPENROUTER GEMINI RAG & EXAM AI SOLVER');
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
    // 1. Authenticate Demo Student Alex Rivera
    console.log('\n--- 1. Authenticating Student User ---');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@studix.edu',
      password: 'password123',
    });
    assert(loginRes.status === 200, 'Student login succeeded');
    const studentToken = loginRes.data.data.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // 2. Authenticate Admin User Prof. Jenkins
    console.log('\n--- 2. Authenticating Admin User ---');
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@studix.edu',
      password: 'password123',
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeded');
    const adminToken = adminLoginRes.data.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Repository-Aware RAG Search Query
    console.log('\n--- 3. Testing Repository-Aware RAG Search (POST /ai/repository-search) ---');
    const ragRes = await axios.post(
      `${API_BASE}/ai/repository-search`,
      {
        query: 'Explain Computer Networks OSI layer framing and TCP/IP',
        collegeId: 'c1000000-0000-0000-0000-000000000001',
        departmentId: 'd1000000-0000-0000-0000-000000000001',
      },
      { headers: studentHeaders }
    );
    assert(ragRes.status === 200, 'RAG search status 200');
    assert(Boolean(ragRes.data.data.answer), 'AI synthesized answer received');
    assert(Array.isArray(ragRes.data.data.citations), 'Citations array returned');
    assert(ragRes.data.data.citations.length > 0, 'Grounded in university repository papers');
    console.log(`   Citations found: ${ragRes.data.data.citations.map(c => c.title).join(', ')}`);
    console.log(`   Answer snippet: ${ragRes.data.data.answer.substring(0, 140)}...`);

    // 4. Multi-Turn Exam Paper Analysis (Turn 1: Questions & Preferences)
    console.log('\n--- 4. Testing Paper Analysis Turn 1 (Questions & Follow-Up Inquiries) ---');
    const paperAnalysisTurn1 = await axios.post(
      `${API_BASE}/ai/paper-analysis`,
      {
        resourceId: 'r1000000-0000-0000-0000-000000000001', // Computer Networks End Sem
      },
      { headers: studentHeaders }
    );
    assert(paperAnalysisTurn1.status === 200, 'Turn 1 analysis status 200');
    assert(paperAnalysisTurn1.data.data.stage === 'PREFERENCES_REQUIRED', 'Stage is PREFERENCES_REQUIRED');
    assert(
      Array.isArray(paperAnalysisTurn1.data.data.extractedQuestions),
      'Extracted questions list present'
    );
    assert(
      paperAnalysisTurn1.data.data.availablePreferences.marks.includes(10),
      'Follow-up marks options available (2/5/10/16)'
    );
    const chosenQuestion = paperAnalysisTurn1.data.data.extractedQuestions[0];
    console.log(`   Extracted Question 1: "${chosenQuestion}"`);

    // 5. Multi-Turn Exam Paper Solver (Turn 2: Solution Synthesis with Preferences)
    console.log('\n--- 5. Testing Paper Solver Turn 2 (Synthesize 10 Marks University Solution) ---');
    const paperSolverTurn2 = await axios.post(
      `${API_BASE}/ai/paper-analysis`,
      {
        resourceId: 'r1000000-0000-0000-0000-000000000001',
        questionSelection: chosenQuestion,
        marks: 10,
        format: 'university style',
        explanationStyle: 'step-by-step',
      },
      { headers: studentHeaders }
    );
    assert(paperSolverTurn2.status === 200, 'Turn 2 solver status 200');
    assert(paperSolverTurn2.data.data.stage === 'SOLUTION_READY', 'Stage is SOLUTION_READY');
    assert(paperSolverTurn2.data.data.marks === 10, 'Marks allocated: 10');
    assert(Boolean(paperSolverTurn2.data.data.solution), 'Step-by-step model solution generated');
    console.log(`   Solution snippet:\n   ${paperSolverTurn2.data.data.solution.substring(0, 160)}...`);

    // 6. Private AI Chat Sessions Creation
    console.log('\n--- 6. Testing Private AI Chat Session Creation (POST /ai/sessions) ---');
    const sessionRes = await axios.post(
      `${API_BASE}/ai/sessions`,
      {
        title: 'Compiler Design Exam Preparation Session',
        subjectId: 's1000000-0000-0000-0000-000000000018',
      },
      { headers: studentHeaders }
    );
    assert(sessionRes.status === 201, 'Session creation status 201');
    const session = sessionRes.data.data;
    assert(Boolean(session.id), 'Session UUID generated');
    console.log(`   Created Session: "${session.title}" (ID: ${session.id})`);

    // 7. Multi-Turn Messaging in Session
    console.log('\n--- 7. Testing Session Multi-Turn Messaging (POST /ai/sessions/:id/messages) ---');
    const msgRes = await axios.post(
      `${API_BASE}/ai/sessions/${session.id}/messages`,
      {
        message: 'How does bottom-up LR parsing work compared to top-down LL parsing?',
      },
      { headers: studentHeaders }
    );
    assert(msgRes.status === 200, 'Message send status 200');
    assert(Boolean(msgRes.data.data.assistantMessage), 'Assistant response received');
    assert(msgRes.data.data.userMessage.sender === 'user', 'User message recorded');
    assert(msgRes.data.data.assistantMessage.sender === 'assistant', 'Assistant message recorded');
    console.log(`   Assistant reply snippet: ${msgRes.data.data.assistantMessage.message.substring(0, 130)}...`);

    // 8. Session Message History
    console.log('\n--- 8. Testing Session History Retrieval (GET /ai/sessions/:id) ---');
    const historyRes = await axios.get(`${API_BASE}/ai/sessions/${session.id}`, {
      headers: studentHeaders,
    });
    assert(historyRes.status === 200, 'Get messages status 200');
    assert(Array.isArray(historyRes.data.data), 'Messages is array');
    assert(historyRes.data.data.length >= 2, 'History contains both turn messages');

    // 9. Strict RLS Private Session Access Control
    console.log('\n--- 9. Testing Strict RLS Ownership Security (Reject Unauthorized Access) ---');
    let rlsEnforced = false;
    try {
      // Admin user attempts to read Student's private chat session
      await axios.get(`${API_BASE}/ai/sessions/${session.id}`, {
        headers: adminHeaders,
      });
    } catch (rlsErr) {
      if (rlsErr.response && (rlsErr.response.status === 403 || rlsErr.response.status === 404)) {
        rlsEnforced = true;
        console.log(`   Access correctly denied with status ${rlsErr.response.status}: "${rlsErr.response.data.message}"`);
      }
    }
    assert(rlsEnforced, 'RLS policy strictly prevents other users from accessing private AI chat');

    console.log('\n========================================================');
    console.log(`🎯 TOTAL RESULTS: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('========================================================\n');

    if (testFailed === 0) process.exit(0);
    else process.exit(1);
  } catch (err) {
    console.error('Phase 3 verification failure:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase3();
