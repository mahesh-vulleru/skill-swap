# SkillSwap – Phase 01: Foundation Audit & Corrections

## 1. Overview
Phase 01 focused on auditing the existing project architecture, identifying and rectifying security risks, hardening authentication, validating route parameters, and establishing an automated verification pipeline.

---

## 2. Issues Identified & Corrections Implemented

### Issue 1: Insecure Client Route Guarding
- **Observation**: `client/src/routes/AppRoutes.tsx` previously returned `<>{children}</>` even when `user` was `null`, allowing any visitor to access dashboard, chat, sessions, and admin screens.
- **Correction**: Replaced passthrough logic with strict `ProtectedRoute`. Unauthenticated visitors are redirected to `/login` with `state: { from: location }` preserved.
- **Admin Guarding**: Introduced `AdminRoute` component that verifies `user.role === 'admin'`. Non-admin accounts attempting access are redirected to `/dashboard`.

### Issue 2: Insecure JWT Fallback Secret
- **Observation**: `server/src/config/env.ts` defaulted to `'skillswap_super_secret_jwt_key_2026'` when `JWT_SECRET` was omitted from `.env`.
- **Correction**: Implemented mandatory environment validation. The server refuses to start if `JWT_SECRET` is missing, empty, shorter than 16 characters, or equal to placeholder values.

### Issue 3: Missing Admin Route Protection on Backend
- **Observation**: `server/src/routes/adminRoutes.ts` previously exposed `/users`, `/users/:id` without `authenticate` or `requireRole`.
- **Correction**: Applied `router.use(authenticate)` and `router.use(requireRole(['admin']))` across all admin routes.

### Issue 4: Public Self-Registration Privilege Escalation
- **Observation**: `authController.ts` allowed the request payload to specify `role: 'admin'`, potentially allowing anyone to register an administrator account.
- **Correction**: Restricted public registration roles to `['learner', 'mentor', 'learner_mentor']`. Rejects attempts to self-assign `'admin'`.

### Issue 5: Missing Input Validation on Registration & Login
- **Observation**: Registration and login only checked field presence, ignoring email format and password length.
- **Correction**: Added RFC 5322 regex email format verification and enforced password length >= 6 characters.

### Issue 6: Category Route Mapping Collision
- **Observation**: In `server/src/app.ts`, `skillRoutes` was mounted at `/api/categories`, causing `GET /api/categories` to execute `getSkills` instead of `getCategories`.
- **Correction**: Created a dedicated `categoryRoutes.ts` and mounted it at `/api/categories`, while preserving `/api/skills/categories` as a backward-compatible alias.

### Issue 7: Route Order Shadowing
- **Observation**: `PUT /users/profile` was positioned after parameter routes.
- **Correction**: Reordered `userRoutes.ts` to register specific path `/profile` before dynamic parameter `/:id`.

---

## 3. Verification Suite
An automated test runner (`server/src/test/foundationTest.ts`) was executed against the live API and MongoDB:
- **Total Tests**: 24
- **Passed**: 24 (100%)
- **Failed**: 0
- **TypeScript Compiler Checks**:
  - `server`: 0 errors (`tsc`)
  - `client`: 0 errors (`tsc && vite build`)
