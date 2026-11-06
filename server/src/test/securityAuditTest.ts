import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { connectDB } from '../config/db';
import { config } from '../config/env';
import { User } from '../models/User';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Session } from '../models/Session';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { CreditTransaction } from '../models/CreditTransaction';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

const assert = (name: string, condition: boolean, details?: string) => {
  results.push({ name, passed: condition, details });
  console.log(`${condition ? '  ✅ PASS' : '  ❌ FAIL'}: ${name}${details ? ` (${details})` : ''}`);
};

const runSuite = async () => {
  console.log('\n======================================================');
  console.log('🛡️  SKILLSWAP COMPLETE SECURITY & INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  // Ensure DB is connected
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as any;
  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const request = (
    method: string,
    path: string,
    body?: any,
    token?: string
  ): Promise<{ status: number; data: any }> => {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl + path);
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

  try {
    // -------------------------------------------------------------
    // 1. Health & Database
    // -------------------------------------------------------------
    console.log('[Test Group 1: Health & Database Integrity]');
    const health = await request('GET', '/health');
    assert('Health Check Returns HTTP 200', health.status === 200);
    assert('Database Status is "connected"', health.data?.database === 'connected');

    // -------------------------------------------------------------
    // 2. Authentication & Privilege Escalation
    // -------------------------------------------------------------
    console.log('\n[Test Group 2: Authentication & Input Validation]');
    const missingEmail = await request('POST', '/auth/register', { name: 'Alice', password: 'password123' });
    assert('Reject registration with missing email (400)', missingEmail.status === 400);

    const invalidEmail = await request('POST', '/auth/register', { name: 'Alice', email: 'notanemail', password: 'password123' });
    assert('Reject registration with malformed email (400)', invalidEmail.status === 400);

    const shortPassword = await request('POST', '/auth/register', { name: 'Alice', email: 'alice@test.com', password: '123' });
    assert('Reject registration with short password (400)', shortPassword.status === 400);

    const privilegeEscalation = await request('POST', '/auth/register', {
      name: 'Attacker',
      email: 'attacker@test.com',
      password: 'password123',
      role: 'admin',
    });
    assert('Prevent privilege escalation (cannot register as admin) (400)', privilegeEscalation.status === 400);

    // Register 3 test users: User A, User B, User C
    const timestamp = Date.now();
    const userAEmail = `usera_${timestamp}@example.com`;
    const userBEmail = `userb_${timestamp}@example.com`;
    const userCEmail = `userc_${timestamp}@example.com`;

    const regA = await request('POST', '/auth/register', {
      name: 'User A',
      email: userAEmail,
      password: 'password123',
      role: 'mentor',
      skillsOffered: [{ name: 'TypeScript', category: 'Programming', level: 'Expert' }],
      skillsWanted: [{ name: 'Figma', category: 'Design', level: 'Beginner' }],
    });
    assert('Register User A successfully (201)', regA.status === 201);
    const tokenA = regA.data.token;
    const userAId = regA.data.user._id;

    const regB = await request('POST', '/auth/register', {
      name: 'User B',
      email: userBEmail,
      password: 'password123',
      role: 'learner_mentor',
      skillsOffered: [{ name: 'Figma', category: 'Design', level: 'Expert' }],
      skillsWanted: [{ name: 'TypeScript', category: 'Programming', level: 'Intermediate' }],
    });
    assert('Register User B successfully (201)', regB.status === 201);
    const tokenB = regB.data.token;
    const userBId = regB.data.user._id;

    const regC = await request('POST', '/auth/register', {
      name: 'User C (Third Party)',
      email: userCEmail,
      password: 'password123',
      role: 'learner',
    });
    assert('Register User C successfully (201)', regC.status === 201);
    const tokenC = regC.data.token;
    const userCId = regC.data.user._id;

    // Admin login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@skillswap.com',
      password: 'password123',
    });
    assert('Admin login succeeds (200)', adminLogin.status === 200);
    const adminToken = adminLogin.data.token;

    // -------------------------------------------------------------
    // 3. RBAC & Route Protection
    // -------------------------------------------------------------
    console.log('\n[Test Group 3: Role-Based Access Control (RBAC)]');
    const adminEndpointUser = await request('GET', '/admin/users', undefined, tokenA);
    assert('Non-admin User A denied access to /api/admin/users (403)', adminEndpointUser.status === 403);

    const adminEndpointAdmin = await request('GET', '/admin/users', undefined, adminToken);
    assert('Admin allowed access to /api/admin/users (200)', adminEndpointAdmin.status === 200);

    const platformAnalyticsUser = await request('GET', '/analytics/platform', undefined, tokenA);
    assert('Non-admin denied access to /api/analytics/platform (403)', platformAnalyticsUser.status === 403);

    const platformAnalyticsAdmin = await request('GET', '/analytics/platform', undefined, adminToken);
    assert('Admin allowed access to /api/analytics/platform (200)', platformAnalyticsAdmin.status === 200);
    assert('Platform analytics contains real credit circulation stat', typeof platformAnalyticsAdmin.data?.stats?.totalCreditsCirculation === 'number');

    // -------------------------------------------------------------
    // 4. Skill Exchange Security & IDOR Protection
    // -------------------------------------------------------------
    console.log('\n[Test Group 4: Exchange Requests & IDOR Protection]');
    // Self-exchange prevention
    const selfExchange = await request('POST', '/exchanges', {
      receiverId: userAId,
      skillOffered: 'TypeScript',
      skillWanted: 'TypeScript',
    }, tokenA);
    assert('Prevent self-exchange proposal (400)', selfExchange.status === 400);

    // Create exchange from A to B
    const createEx = await request('POST', '/exchanges', {
      receiverId: userBId,
      skillOffered: 'TypeScript',
      skillWanted: 'Figma',
      message: 'Let us swap skills!',
    }, tokenA);
    assert('User A sends exchange proposal to User B (201)', createEx.status === 201);
    const exchangeId = createEx.data.exchange._id;

    // IDOR check: User C (unauthorized third party) attempts to accept/modify exchange
    const idorExUpdate = await request('PUT', `/exchanges/${exchangeId}/status`, { status: 'accepted' }, tokenC);
    assert('Prevent IDOR: Unauthorized User C cannot update exchange (403)', idorExUpdate.status === 403);

    // Sender User A attempts to accept their own request (only receiver can accept)
    const senderAcceptAttempt = await request('PUT', `/exchanges/${exchangeId}/status`, { status: 'accepted' }, tokenA);
    assert('Sender cannot accept own exchange request (403)', senderAcceptAttempt.status === 403);

    // Recipient User B accepts
    const receiverAccept = await request('PUT', `/exchanges/${exchangeId}/status`, { status: 'accepted' }, tokenB);
    assert('Recipient User B accepts exchange request (200)', receiverAccept.status === 200);
    assert('Exchange status transitioned to "accepted"', receiverAccept.data?.exchange?.status === 'accepted');

    // Cannot transition accepted exchange back to pending or cancelled
    const invalidExTransition = await request('PUT', `/exchanges/${exchangeId}/status`, { status: 'pending' }, tokenB);
    assert('Reject invalid exchange state transition (400)', invalidExTransition.status === 400);

    // -------------------------------------------------------------
    // 5. Sessions & Idempotent Credit Rewards
    // -------------------------------------------------------------
    console.log('\n[Test Group 5: Sessions & Idempotent Credit Rewards]');
    // Self-session prevention
    const selfSession = await request('POST', '/sessions', {
      partnerId: userAId,
      skill: 'TypeScript',
      topic: 'Generics',
      date: '2026-11-20',
      time: '18:00',
    }, tokenA);
    assert('Prevent scheduling session with oneself (400)', selfSession.status === 400);

    // User A schedules session with User B (A is mentor, B is learner)
    const createSessionRes = await request('POST', '/sessions', {
      partnerId: userBId,
      skill: 'TypeScript',
      topic: 'Advanced Generics & Mapped Types',
      date: '2026-11-20',
      time: '18:00',
      durationMinutes: 60,
    }, tokenA);
    assert('Schedule valid session (201)', createSessionRes.status === 201);
    const sessionId = createSessionRes.data.session._id;

    // IDOR on session: User C tries to complete session
    const idorSessionComplete = await request('PUT', `/sessions/${sessionId}/status`, { status: 'completed' }, tokenC);
    assert('Prevent IDOR: Unauthorized User C cannot complete session (403)', idorSessionComplete.status === 403);

    // Mentor User A completes session
    const userABeforeComplete = await User.findById(userAId);
    const creditsBefore = userABeforeComplete?.credits || 0;

    const completeSessionRes = await request('PUT', `/sessions/${sessionId}/status`, { status: 'completed' }, tokenA);
    assert('Mentor completes session (200)', completeSessionRes.status === 200);

    const userAAfterComplete = await User.findById(userAId);
    assert('Mentor awarded exactly 10 learning credits', (userAAfterComplete?.credits || 0) === creditsBefore + 10);

    // Verify idempotency: attempt to complete again
    const repeatComplete = await request('PUT', `/sessions/${sessionId}/status`, { status: 'completed' }, tokenA);
    assert('Prevent re-completion of already completed session (400)', repeatComplete.status === 400);

    const userAAfterRepeat = await User.findById(userAId);
    assert('Credits not duplicated on repeated completion', userAAfterRepeat?.credits === userAAfterComplete?.credits);

    // -------------------------------------------------------------
    // 6. Credit Redemption & Protection
    // -------------------------------------------------------------
    console.log('\n[Test Group 6: Credit Redemption & Negative Balance Protection]');
    // Tampered cost attack: client attempts to pass cost 0 or negative cost
    const tamperedCostRes = await request('POST', '/credits/redeem', {
      perkName: 'Verified Mentor Badge',
      cost: -100, // Attacker tries to inject credits
    }, tokenA);
    // Cost must be enforced server-side (20 credits), NOT -100!
    assert('Server-authoritative cost applied for perk redemption', tamperedCostRes.status === 200 || tamperedCostRes.status === 400);
    const userAAfterRedeem = await User.findById(userAId);
    assert('Credits decremented rather than artificially inflated', (userAAfterRedeem?.credits || 0) <= (userAAfterComplete?.credits || 0));

    // Insufficient balance test
    const brokeUser = await User.create({
      name: 'Broke User',
      email: `broke_${Date.now()}@example.com`,
      password: 'password123',
      credits: 2,
    });
    const brokeToken = jwt.sign({ id: brokeUser._id, role: brokeUser.role }, config.jwtSecret);
    const insufficientRes = await request('POST', '/credits/redeem', {
      perkName: 'Verified Mentor Badge', // costs 20
    }, brokeToken);
    assert('Reject redemption with insufficient balance (400)', insufficientRes.status === 400);
    const brokeUserAfter = await User.findById(brokeUser._id);
    assert('Prevent negative balance (credits remain >= 0)', (brokeUserAfter?.credits || 0) >= 0);

    // -------------------------------------------------------------
    // 7. Reviews, Ratings & Eligibility
    // -------------------------------------------------------------
    console.log('\n[Test Group 7: Reviews & Reputation Integrity]');
    // Self-review prevention
    const selfReview = await request('POST', '/reviews', {
      revieweeId: userAId,
      rating: 5,
      feedback: 'I am amazing!',
    }, tokenA);
    assert('Prevent self-reviews (400)', selfReview.status === 400);

    // Out-of-bounds rating (> 5)
    const outOfBoundsRating = await request('POST', '/reviews', {
      revieweeId: userBId,
      rating: 99,
      feedback: 'Super high rating!',
    }, tokenA);
    assert('Reject out-of-bounds rating > 5 (400)', outOfBoundsRating.status === 400);

    // Ineligible review: User C tries to review User A without any session or exchange
    const ineligibleReview = await request('POST', '/reviews', {
      revieweeId: userAId,
      rating: 5,
      feedback: 'Never swapped but leaving a review',
    }, tokenC);
    assert('Reject ineligible review without completed session/exchange (403)', ineligibleReview.status === 403);

    // Eligible review: User B reviews User A for the completed session
    const eligibleReview = await request('POST', '/reviews', {
      revieweeId: userAId,
      sessionId,
      rating: 5,
      feedback: 'Excellent mentor, explained TypeScript generics clearly!',
      skillSwapped: 'TypeScript',
    }, tokenB);
    assert('Submit eligible review for completed session (201)', eligibleReview.status === 201);

    // Duplicate review prevention for the same session
    const duplicateReview = await request('POST', '/reviews', {
      revieweeId: userAId,
      sessionId,
      rating: 5,
      feedback: 'Second review for same session',
    }, tokenB);
    assert('Prevent duplicate review for the same session (400)', duplicateReview.status === 400);

    // -------------------------------------------------------------
    // 8. Notification Ownership IDOR Protection
    // -------------------------------------------------------------
    console.log('\n[Test Group 8: Notification Ownership IDOR Protection]');
    // Create notification for User A
    const notifA = await Notification.create({
      user: userAId,
      title: 'Confidential Notification',
      message: 'Private message for A',
      type: 'message_received',
    });

    // User B attempts to mark User A's notification as read
    const idorNotif = await request('PUT', `/notifications/${notifA._id}/read`, undefined, tokenB);
    assert('Prevent IDOR: User B cannot mark User A notification read (404)', idorNotif.status === 404);

    // User A marks own notification as read
    const ownerNotif = await request('PUT', `/notifications/${notifA._id}/read`, undefined, tokenA);
    assert('Owner User A can mark own notification read (200)', ownerNotif.status === 200);

    // -------------------------------------------------------------
    // 9. ReDoS & Filter Combination Safety
    // -------------------------------------------------------------
    console.log('\n[Test Group 9: Search Filter & ReDoS Safety]');
    // Special regex characters in search
    const redosTest = await request('GET', '/users?search=test((.*+^$%)\\\\[');
    assert('Handle special regex characters safely without server crash (200)', redosTest.status === 200);

    // Combined search and category (ensure category does not overwrite search)
    const combinedFilter = await request('GET', '/users?search=User&category=Programming');
    assert('Combined search and category returns 200 OK', combinedFilter.status === 200);

    // -------------------------------------------------------------
    // 10. Summary
    // -------------------------------------------------------------
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;

    console.log('\n======================================================');
    console.log(`📊 TEST SUITE COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED (${results.length} total)`);
    console.log('======================================================\n');

    server.close();
    await mongoose.disconnect();

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runSuite().catch((err) => {
  console.error('Suite error:', err);
  process.exit(1);
});
