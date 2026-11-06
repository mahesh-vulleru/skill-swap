import http from 'http';

const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

const request = (
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const postData = body ? JSON.stringify(body) : '';

    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = raw ? JSON.parse(raw) : {};
            resolve({ status: res.statusCode || 500, data });
          } catch {
            resolve({ status: res.statusCode || 500, data: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
};

const assert = (name: string, condition: boolean, details?: string) => {
  results.push({ name, passed: condition, details });
  console.log(`${condition ? '  ✅ PASS' : '  ❌ FAIL'}: ${name}${details ? ` (${details})` : ''}`);
};

const runWorkflowSuite = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING SKILLSWAP PHASE 3 WORKFLOW INTEGRATION SUITE');
  console.log('======================================================\n');

  try {
    const timestamp = Date.now();
    const userAEmail = `user_a_${timestamp}@example.com`;
    const userBEmail = `user_b_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@example.com`;
    const password = 'Password@123';

    // 1. Setup Test Users
    console.log('--- 1. Setting Up Test Identities ---');
    const regA = await request('POST', '/auth/register', {
      name: 'Workflow User A',
      email: userAEmail,
      password,
    });
    const tokenA = regA.data?.token;
    const userAId = regA.data?.user?._id;
    assert('User A registered', regA.status === 201 && !!tokenA, `ID: ${userAId}`);

    const regB = await request('POST', '/auth/register', {
      name: 'Workflow User B',
      email: userBEmail,
      password,
    });
    const tokenB = regB.data?.token;
    const userBId = regB.data?.user?._id;
    assert('User B registered', regB.status === 201 && !!tokenB, `ID: ${userBId}`);

    // Admin login using existing seed or registered admin
    let adminToken = '';
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@skillswap.com',
      password: 'password123',
    });
    if (adminLogin.status === 200 && adminLogin.data?.token) {
      adminToken = adminLogin.data.token;
      assert('Admin login via seeded admin account', true);
    } else {
      const regAdmin = await request('POST', '/auth/register', {
        name: 'Workflow Admin',
        email: adminEmail,
        password,
      });
      adminToken = regAdmin.data?.token || '';
      assert('Admin account registered/fallback', !!adminToken);
    }

    // 2. Exchange Request Lifecycle
    console.log('\n--- 2. Exchange Request Lifecycle & Guardrails ---');
    
    // 2a. Self-exchange prevention
    const selfExchange = await request(
      'POST',
      '/exchanges',
      {
        receiverId: userAId,
        skillOffered: 'TypeScript',
        skillWanted: 'Python',
        message: 'Self exchange test',
      },
      tokenA
    );
    assert(
      'Prevent self-exchange requests',
      selfExchange.status === 400 && selfExchange.data?.message?.includes('yourself'),
      `Status: ${selfExchange.status}`
    );

    // 2b. Valid exchange request User A -> User B
    const validExchange = await request(
      'POST',
      '/exchanges',
      {
        receiverId: userBId,
        skillOffered: 'React & Next.js',
        skillWanted: 'Go & Microservices',
        message: 'Hey, let us swap knowledge!',
      },
      tokenA
    );
    const exchangeId = validExchange.data?.exchange?._id;
    assert(
      'User A creates exchange request to User B',
      validExchange.status === 201 && !!exchangeId,
      `ExchangeId: ${exchangeId}`
    );

    // 2c. Duplicate pending exchange prevention
    const dupExchange = await request(
      'POST',
      '/exchanges',
      {
        receiverId: userBId,
        skillOffered: 'React & Next.js',
        skillWanted: 'Go & Microservices',
        message: 'Second request duplicate',
      },
      tokenA
    );
    assert(
      'Prevent duplicate pending exchange request between same peers',
      dupExchange.status === 400 && (dupExchange.data?.message?.includes('already awaiting') || dupExchange.data?.message?.includes('already exists')),
      `Status: ${dupExchange.status}, Msg: ${dupExchange.data?.message}`
    );

    // 2d. Sender cannot accept own request (only receiver can accept)
    const unauthorizedAccept = await request(
      'PUT',
      `/exchanges/${exchangeId}/status`,
      { status: 'accepted' },
      tokenA
    );
    assert(
      'Prevent sender from accepting their own exchange request',
      unauthorizedAccept.status === 403,
      `Status: ${unauthorizedAccept.status}, Msg: ${unauthorizedAccept.data?.message}`
    );

    // 2e. Receiver (User B) accepts request
    const acceptedExchange = await request(
      'PUT',
      `/exchanges/${exchangeId}/status`,
      { status: 'accepted' },
      tokenB
    );
    assert(
      'Recipient (User B) accepts exchange request',
      acceptedExchange.status === 200 && acceptedExchange.data?.exchange?.status === 'accepted',
      `Status: ${acceptedExchange.status}, ExchangeStatus: ${acceptedExchange.data?.exchange?.status}`
    );

    // 3. Direct Messaging Integration
    console.log('\n--- 3. Direct Messaging Integration ---');
    const selfMsg = await request(
      'POST',
      '/messages',
      { receiverId: userAId, content: 'Self ping' },
      tokenA
    );
    assert(
      'Prevent sending messages to oneself',
      selfMsg.status === 400,
      `Status: ${selfMsg.status}`
    );

    const validMsg = await request(
      'POST',
      '/messages',
      { receiverId: userBId, content: 'Ready for our session!' },
      tokenA
    );
    assert(
      'User A sends direct message to User B',
      validMsg.status === 201 && validMsg.data?.message?.content === 'Ready for our session!',
      `MessageId: ${validMsg.data?.message?._id}`
    );

    // 4. Session Scheduling & Completion Lifecycle
    console.log('\n--- 4. Session Scheduling & Completion (+10 Credits) ---');
    
    // 4a. Prevent self-scheduling
    const selfSession = await request(
      'POST',
      '/sessions',
      {
        partnerId: userAId,
        skill: 'React',
        topic: 'Self study',
        date: '2026-11-20',
        time: '14:00',
        durationMinutes: 60,
      },
      tokenA
    );
    assert(
      'Prevent scheduling session with oneself',
      selfSession.status === 400,
      `Status: ${selfSession.status}`
    );

    // 4b. Schedule session: User A books User B as mentor
    const validSession = await request(
      'POST',
      '/sessions',
      {
        partnerId: userBId,
        skill: 'Go & Microservices',
        topic: 'Concurrency in Go Channels',
        date: '2026-11-25',
        time: '18:00',
        durationMinutes: 60,
        mode: 'Google Meet',
      },
      tokenA
    );
    const sessionId = validSession.data?.session?._id;
    assert(
      'User A schedules session with User B (User B is Mentor)',
      validSession.status === 201 && !!sessionId,
      `SessionId: ${sessionId}`
    );

    // 4c. Mark session completed by Mentor (User B)
    const completeSession = await request(
      'PUT',
      `/sessions/${sessionId}/status`,
      { status: 'completed' },
      tokenB
    );
    assert(
      'Mentor (User B) marks session completed (+10 credits awarded to mentor)',
      completeSession.status === 200 && completeSession.data?.session?.status === 'completed',
      `Status: ${completeSession.status}, SessionStatus: ${completeSession.data?.session?.status}, Msg: ${completeSession.data?.message}`
    );

    // 4d. Verify User B credits increased
    const profileB = await request('GET', `/users/${userBId}`);
    assert(
      'Verify User B received +10 credits for hosting session',
      profileB.data?.user?.credits >= 30, // Default 20 + 10 = 30
      `Credits: ${profileB.data?.user?.credits}`
    );

    // 5. Review & Bonus Credits (+2 Credits to Reviewer)
    console.log('\n--- 5. Review Submission & Reviewer Bonus (+2 Credits) ---');

    // 5a. Prevent self-review
    const selfReview = await request(
      'POST',
      '/reviews',
      {
        revieweeId: userAId,
        rating: 5,
        feedback: 'I am amazing',
        skillSwapped: 'TypeScript',
      },
      tokenA
    );
    assert(
      'Prevent self-review',
      selfReview.status === 400,
      `Status: ${selfReview.status}`
    );

    // 5b. User A submits review for User B for the completed session
    const validReview = await request(
      'POST',
      '/reviews',
      {
        revieweeId: userBId,
        rating: 5,
        feedback: 'Fantastic mentor on Go routines and channels!',
        skillSwapped: 'Go & Microservices',
        sessionId,
      },
      tokenA
    );
    assert(
      'User A submits review for User B (+2 reviewer credits)',
      validReview.status === 201 && validReview.data?.review?.rating === 5,
      `ReviewId: ${validReview.data?.review?._id}`
    );

    // 5c. Prevent duplicate review for same session
    const dupReview = await request(
      'POST',
      '/reviews',
      {
        revieweeId: userBId,
        rating: 4,
        feedback: 'Trying to review again',
        skillSwapped: 'Go',
        sessionId,
      },
      tokenA
    );
    assert(
      'Prevent duplicate review for same completed session',
      dupReview.status === 400 && dupReview.data?.message?.includes('already submitted'),
      `Status: ${dupReview.status}`
    );

    // 5d. Verify User A received +2 reviewer bonus credits
    const profileA = await request('GET', `/users/${userAId}`);
    assert(
      'Verify User A received +2 bonus credits for writing review',
      profileA.data?.user?.credits >= 22, // Default 20 + 2 = 22
      `Credits: ${profileA.data?.user?.credits}`
    );

    // 6. Admin Role-Based Access Control (RBAC)
    console.log('\n--- 6. Admin Role-Based Access Control ---');

    // 6a. Standard User A attempting admin routes
    const userAtUsers = await request('GET', '/admin/users', undefined, tokenA);
    assert(
      'Standard user forbidden from GET /api/admin/users (403)',
      userAtUsers.status === 403,
      `Status: ${userAtUsers.status}`
    );

    const userAtAnalytics = await request('GET', '/analytics/platform', undefined, tokenA);
    assert(
      'Standard user forbidden from GET /api/analytics/platform (403)',
      userAtAnalytics.status === 403,
      `Status: ${userAtAnalytics.status}`
    );

    // 6b. Admin accessing protected admin endpoints
    if (adminToken) {
      const adminUsers = await request('GET', '/admin/users', undefined, adminToken);
      assert(
        'Admin authorized for GET /api/admin/users (200)',
        adminUsers.status === 200 && Array.isArray(adminUsers.data?.users),
        `Found ${adminUsers.data?.users?.length} users`
      );

      const adminPlatform = await request('GET', '/analytics/platform', undefined, adminToken);
      assert(
        'Admin authorized for GET /api/analytics/platform (200)',
        adminPlatform.status === 200 && adminPlatform.data?.success === true,
        `Status: ${adminPlatform.status}`
      );
    }

  } catch (error: any) {
    console.error('Test execution error:', error);
    assert('Test suite unhandled error check', false, error.message);
  }

  // Summary
  console.log('\n======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`WORKFLOW TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runWorkflowSuite();
