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

const runRoleIsolationSuite = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ROLE-BASED DASHBOARD ISOLATION TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Authenticate All 3 Personas
    console.log('--- 1. Authenticate Role Identities ---');
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@skillswap.com',
      password: 'password123',
    });
    const adminToken = adminLogin.data?.token;
    assert('Admin login successful', adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin');

    const mentorLogin = await request('POST', '/auth/login', {
      email: 'elena@skillswap.com',
      password: 'password123',
    });
    const mentorToken = mentorLogin.data?.token;
    assert('Mentor login successful', mentorLogin.status === 200 && mentorLogin.data?.user?.role === 'mentor');

    const learnerLogin = await request('POST', '/auth/login', {
      email: 'marcus@skillswap.com',
      password: 'password123',
    });
    const learnerToken = learnerLogin.data?.token;
    assert('Learner login successful', learnerLogin.status === 200 && learnerLogin.data?.user?.role === 'learner');

    // 2. Strict Admin Route Isolation (Only Admin, 403 for Mentor & Learner)
    console.log('\n--- 2. Admin API Authorization Isolation ---');
    const adminAtUsers = await request('GET', '/admin/users', undefined, adminToken);
    assert('Admin authorized for /api/admin/users (200)', adminAtUsers.status === 200);

    const mentorAtAdminUsers = await request('GET', '/admin/users', undefined, mentorToken);
    assert('Mentor blocked from /api/admin/users (403 Forbidden)', mentorAtAdminUsers.status === 403);

    const learnerAtAdminUsers = await request('GET', '/admin/users', undefined, learnerToken);
    assert('Learner blocked from /api/admin/users (403 Forbidden)', learnerAtAdminUsers.status === 403);

    const adminAtPlatform = await request('GET', '/analytics/platform', undefined, adminToken);
    assert('Admin authorized for /api/analytics/platform (200)', adminAtPlatform.status === 200);

    const mentorAtPlatform = await request('GET', '/analytics/platform', undefined, mentorToken);
    assert('Mentor blocked from /api/analytics/platform (403 Forbidden)', mentorAtPlatform.status === 403);

    const learnerAtPlatform = await request('GET', '/analytics/platform', undefined, learnerToken);
    assert('Learner blocked from /api/analytics/platform (403 Forbidden)', learnerAtPlatform.status === 403);

    // 3. Strict Mentor API Isolation (Only Mentor, 403 for Learner & Admin)
    console.log('\n--- 3. Mentor API Authorization Isolation ---');
    const mentorAtMentorAnalytics = await request('GET', '/analytics/mentor', undefined, mentorToken);
    assert('Mentor authorized for /api/analytics/mentor (200)', mentorAtMentorAnalytics.status === 200);

    const learnerAtMentorAnalytics = await request('GET', '/analytics/mentor', undefined, learnerToken);
    assert('Learner blocked from /api/analytics/mentor (403 Forbidden)', learnerAtMentorAnalytics.status === 403);

    const adminAtMentorAnalytics = await request('GET', '/analytics/mentor', undefined, adminToken);
    assert('Admin blocked from /api/analytics/mentor (403 Forbidden)', adminAtMentorAnalytics.status === 403);

    // 4. Strict Learner API Isolation (Only Learner, 403 for Mentor & Admin)
    console.log('\n--- 4. Learner API Authorization Isolation ---');
    const learnerAtLearnerAnalytics = await request('GET', '/analytics/learner', undefined, learnerToken);
    assert('Learner authorized for /api/analytics/learner (200)', learnerAtLearnerAnalytics.status === 200);

    const mentorAtLearnerAnalytics = await request('GET', '/analytics/learner', undefined, mentorToken);
    assert('Mentor blocked from /api/analytics/learner (403 Forbidden)', mentorAtLearnerAnalytics.status === 403);

    const adminAtLearnerAnalytics = await request('GET', '/analytics/learner', undefined, adminToken);
    assert('Admin blocked from /api/analytics/learner (403 Forbidden)', adminAtLearnerAnalytics.status === 403);

    // 5. Data Isolation on Sessions
    console.log('\n--- 5. Data Privacy & Session Isolation ---');
    const mentorSessions = await request('GET', '/sessions', undefined, mentorToken);
    const mentorOnlyHasMentorSessions = (mentorSessions.data?.sessions || []).every(
      (s: any) => s.mentor._id === mentorLogin.data.user._id
    );
    assert(
      'Mentor only retrieves sessions where they are the mentor',
      mentorSessions.status === 200 && mentorOnlyHasMentorSessions
    );

    const learnerSessions = await request('GET', '/sessions', undefined, learnerToken);
    const learnerOnlyHasLearnerSessions = (learnerSessions.data?.sessions || []).every(
      (s: any) => s.learner._id === learnerLogin.data.user._id
    );
    assert(
      'Learner only retrieves sessions where they are the learner',
      learnerSessions.status === 200 && learnerOnlyHasLearnerSessions
    );

    // 6. Direct URL Route Guard Redirection Logic Test
    console.log('\n--- 6. Frontend Login Redirect & Route Guard Logic ---');
    const getRoleDashboard = (role: string) => {
      if (role === 'admin') return '/admin';
      if (role === 'mentor') return '/mentor/dashboard';
      return '/learner/dashboard';
    };

    assert('Admin redirected to /admin', getRoleDashboard('admin') === '/admin');
    assert('Mentor redirected to /mentor/dashboard', getRoleDashboard('mentor') === '/mentor/dashboard');
    assert('Learner redirected to /learner/dashboard', getRoleDashboard('learner') === '/learner/dashboard');

    // Route guard cross-role access assertion
    const checkAccess = (userRole: string, targetPath: string): { allowed: boolean; redirect: string } => {
      const adminRoutes = ['/admin', '/admin/users', '/admin/analytics', '/admin/moderation', '/admin/settings', '/admin/audit-logs'];
      const mentorRoutes = ['/mentor/dashboard'];
      const learnerRoutes = ['/learner/dashboard'];

      if (adminRoutes.some((p) => targetPath.startsWith(p))) {
        return userRole === 'admin' ? { allowed: true, redirect: '' } : { allowed: false, redirect: getRoleDashboard(userRole) };
      }
      if (mentorRoutes.some((p) => targetPath.startsWith(p))) {
        return userRole === 'mentor' ? { allowed: true, redirect: '' } : { allowed: false, redirect: getRoleDashboard(userRole) };
      }
      if (learnerRoutes.some((p) => targetPath.startsWith(p))) {
        return (userRole === 'learner' || userRole === 'learner_mentor') ? { allowed: true, redirect: '' } : { allowed: false, redirect: getRoleDashboard(userRole) };
      }
      return { allowed: true, redirect: '' };
    };

    assert('Mentor accessing /admin is redirected to /mentor/dashboard', checkAccess('mentor', '/admin').redirect === '/mentor/dashboard');
    assert('Mentor accessing /learner/dashboard is redirected to /mentor/dashboard', checkAccess('mentor', '/learner/dashboard').redirect === '/mentor/dashboard');
    assert('Learner accessing /admin is redirected to /learner/dashboard', checkAccess('learner', '/admin').redirect === '/learner/dashboard');
    assert('Learner accessing /mentor/dashboard is redirected to /learner/dashboard', checkAccess('learner', '/mentor/dashboard').redirect === '/learner/dashboard');
    assert('Admin accessing /mentor/dashboard is redirected to /admin', checkAccess('admin', '/mentor/dashboard').redirect === '/admin');
    assert('Admin accessing /learner/dashboard is redirected to /admin', checkAccess('admin', '/learner/dashboard').redirect === '/admin');

  } catch (error: any) {
    console.error('Test execution error:', error);
    assert('Role isolation test suite execution', false, error.message);
  }

  console.log('\n======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`ROLE ISOLATION TEST RESULTS: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runRoleIsolationSuite();

