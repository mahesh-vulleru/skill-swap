# SkillSwap – API Status & Verification Report

**Base URL:** `http://localhost:5000/api`  
**Test Suite:** `npm --prefix server run test:foundation` (24/24 Passing)  

---

## Endpoint Health & Verification Matrix

| Method | Endpoint | Authorization | Controller / Handler | Test Result |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | `healthRoutes.ts` | ✅ 200 OK (DB: Connected) |
| `POST` | `/auth/register` | Public (Validated) | `authController.register` | ✅ 201 Created |
| `POST` | `/auth/login` | Public (Validated) | `authController.login` | ✅ 200 OK |
| `GET` | `/auth/me` | Bearer Token | `authController.getMe` | ✅ 200 OK |
| `GET` | `/users` | Public | `userController.getUsers` | ✅ 200 OK |
| `GET` | `/users/recommended` | Public / Optional | `userController.getRecommendedPartners` | ✅ 200 OK |
| `PUT` | `/users/profile` | Bearer Token | `userController.updateProfile` | ✅ 200 OK |
| `GET` | `/users/:id` | Public | `userController.getUserById` | ✅ 200 OK |
| `GET` | `/categories` | Public | `skillController.getCategories` | ✅ 200 OK (Mapped correctly) |
| `GET` | `/skills` | Public | `skillController.getSkills` | ✅ 200 OK |
| `GET` | `/skills/:id` | Public | `skillController.getSkillById` | ✅ 200 OK |
| `GET` | `/matches` | Public / Optional | `matchController.getMatches` | ✅ 200 OK |
| `GET` | `/exchanges` | Bearer Token | `exchangeController.getExchanges` | ✅ 200 OK |
| `POST` | `/exchanges` | Bearer Token | `exchangeController.createExchange` | ✅ 201 Created |
| `PUT` | `/exchanges/:id/status`| Bearer Token | `exchangeController.updateExchangeStatus`| ✅ 200 OK |
| `GET` | `/sessions` | Bearer Token | `sessionController.getSessions` | ✅ 200 OK |
| `POST` | `/sessions` | Bearer Token | `sessionController.createSession` | ✅ 201 Created |
| `PUT` | `/sessions/:id/status` | Bearer Token | `sessionController.updateSessionStatus` | ✅ 200 OK |
| `GET` | `/messages/conversations`| Bearer Token | `messageController.getConversations` | ✅ 200 OK |
| `GET` | `/messages/:userId` | Bearer Token | `messageController.getMessagesWithUser` | ✅ 200 OK |
| `POST` | `/messages` | Bearer Token | `messageController.sendMessage` | ✅ 201 Created |
| `GET` | `/reviews/user/:userId`| Public | `reviewController.getReviewsForUser` | ✅ 200 OK |
| `POST` | `/reviews` | Bearer Token | `reviewController.createReview` | ✅ 201 Created |
| `GET` | `/credits/balance` | Bearer Token | `creditController.getBalance` | ✅ 200 OK |
| `POST` | `/credits/redeem` | Bearer Token | `creditController.redeemCredits` | ✅ 200 OK |
| `GET` | `/notifications` | Bearer Token | `notificationController.getNotifications` | ✅ 200 OK |
| `PUT` | `/notifications/:id/read`| Bearer Token | `notificationController.markAsRead` | ✅ 200 OK |
| `GET` | `/admin/users` | Bearer + `admin` | `adminController.getAllUsersAdmin` | ✅ 200 OK (Protected) |
| `PUT` | `/admin/users/:id` | Bearer + `admin` | `adminController.updateUserStatusAdmin` | ✅ 200 OK (Protected) |
| `DELETE`| `/admin/users/:id` | Bearer + `admin` | `adminController.deleteUserAdmin` | ✅ 200 OK (Protected) |
| `GET` | `/analytics/platform` | Bearer Token | `analyticsController.getPlatformAnalytics`| ✅ 200 OK (Protected) |
