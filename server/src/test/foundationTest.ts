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

const runSuite = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING SKILLSWAP FOUNDATION & SECURITY TEST SUITE');
  console.log('======================================================\n');

  // 1. Health & Database Test
  console.log('[Group 1: Health & Database]');
  const health = await request('GET', '/health');
  assert('Health Check Returns HTTP 200', health.status === 200);
  assert('Health Check Database Status is "connected"', health.data?.database === 'connected');

  // 2. Auth Validation Tests
  console.log('\n[Group 2: Input Validation & Security]');
  const missingEmail = await request('POST', '/auth/register', { name: 'Test User', password: 'password123' });
  assert('Reject registration with missing email (400)', missingEmail.status === 400);

  const invalidEmail = await request('POST', '/auth/register', { name: 'Test User', email: 'not-an-email', password: 'password123' });
  assert('Reject registration with malformed email (400)', invalidEmail.status === 400);

  const shortPassword = await request('POST', '/auth/register', { name: 'Test User', email: 'valid@test.com', password: '123' });
  assert('Reject registration with short password < 6 chars (400)', shortPassword.status === 400);

  const privilegeEscalation = await request('POST', '/auth/register', {
    name: 'Hacker',
    email: 'hacker@test.com',
    password: 'password123',
    role: 'admin',
  });
  assert('Reject privilege escalation: self-registering as admin (400)', privilegeEscalation.status === 400);

  const testEmail = `user_${Date.now()}@example.com`;
  const validRegister = await request('POST', '/auth/register', {
    name: 'Verified User',
    email: testEmail,
    password: 'password123',
    role: 'learner_mentor',
  });
  assert('Successful registration with valid inputs (201)', validRegister.status === 201);
  assert('Password omitted from registration response', validRegister.data?.user?.password === undefined);
  assert('Initial 30 welcome credits awarded', validRegister.data?.user?.credits === 30);

  // 3. Login & Password Verification
  console.log('\n[Group 3: Authentication & Password Hashing]');
  const badLoginPassword = await request('POST', '/auth/login', { email: 'elena@skillswap.com', password: 'wrongpassword' });
  assert('Reject login with incorrect password (401)', badLoginPassword.status === 401);

  const goodLoginMentor = await request('POST', '/auth/login', { email: 'elena@skillswap.com', password: 'password123' });
  assert('Login mentor with correct password (200)', goodLoginMentor.status === 200);
  assert('JWT token returned upon login', typeof goodLoginMentor.data?.token === 'string');
  const mentorToken = goodLoginMentor.data?.token;

  const goodLoginAdmin = await request('POST', '/auth/login', { email: 'admin@skillswap.com', password: 'password123' });
  assert('Login admin with correct password (200)', goodLoginAdmin.status === 200);
  const adminToken = goodLoginAdmin.data?.token;

  // 4. Protected Route & Token Expiration / Malformed Tokens
  console.log('\n[Group 4: Protected Routes & Bearer Token Middleware]');
  const noTokenMe = await request('GET', '/auth/me');
  assert('Reject protected route access without token (401)', noTokenMe.status === 401);

  const badTokenMe = await request('GET', '/auth/me', undefined, 'invalid.token.payload');
  assert('Reject protected route access with malformed token (401)', badTokenMe.status === 401);

  const validTokenMe = await request('GET', '/auth/me', undefined, mentorToken);
  assert('Allow protected route access with valid Bearer token (200)', validTokenMe.status === 200);
  assert('Resolved user matches authenticated persona', validTokenMe.data?.user?.email === 'elena@skillswap.com');

  // 5. Admin Endpoint Authorization
  console.log('\n[Group 5: Role-Based Authorization & Admin Protection]');
  const adminNoToken = await request('GET', '/admin/users');
  assert('Reject unauthenticated access to /api/admin/users (401)', adminNoToken.status === 401);

  const adminMentorToken = await request('GET', '/admin/users', undefined, mentorToken);
  assert('Reject mentor access to /api/admin/users (403 Forbidden)', adminMentorToken.status === 403);

  const adminWithAdminToken = await request('GET', '/admin/users', undefined, adminToken);
  assert('Allow admin access to /api/admin/users (200 OK)', adminWithAdminToken.status === 200);

  // 6. Category & Skill Route Mapping
  console.log('\n[Group 6: Route Mapping]');
  const categoriesDirect = await request('GET', '/categories');
  assert('GET /api/categories returns category list (200)', categoriesDirect.status === 200);
  assert('GET /api/categories contains array of categories', Array.isArray(categoriesDirect.data?.categories));

  const skillsList = await request('GET', '/skills');
  assert('GET /api/skills returns skills catalog (200)', skillsList.status === 200);
  assert('GET /api/skills contains array of skills', Array.isArray(skillsList.data?.skills));

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`📊 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (${results.length} total)`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
};

runSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
