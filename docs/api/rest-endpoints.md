# SkillSwap REST API Endpoints Specification

Base URL: `http://localhost:5000/api`

## Security & Headers
All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <jwt_token>
```

---

### 1. System Health
- **`GET /health`**
  - **Auth**: Public
  - **Response**:
    ```json
    {
      "success": true,
      "message": "SkillSwap API is running",
      "database": "connected"
    }
    ```

---

### 2. Authentication (`/auth`)
- **`POST /auth/register`**
  - **Auth**: Public
  - **Body**: `{ "name": "string", "email": "string", "password": "string", "role": "learner" | "mentor" | "learner_mentor" }`
  - **Validation**: Email format, password >= 6 chars, name >= 2 chars. Admin role cannot be self-registered.
  - **Response**: 201 Created + JWT token + Safe User Object (30 bonus credits awarded)
- **`POST /auth/login`**
  - **Auth**: Public
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Response**: 200 OK + JWT token + Safe User Object
- **`GET /auth/me`**
  - **Auth**: Bearer Token required
  - **Response**: Authenticated user record (password excluded)

---

### 3. Users (`/users`)
- **`GET /users`**
  - **Auth**: Public
  - **Query Params**: `?search=...&category=...&role=...`
  - **Response**: List of active community members
- **`GET /users/recommended`**
  - **Auth**: Public / Optional Bearer Token
  - **Response**: Top recommended partners by rating and reputation
- **`PUT /users/profile`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "name": "...", "bio": "...", "location": "...", "availability": "...", "skillsOffered": [...], "skillsWanted": [...] }`
  - **Response**: Updated user profile
- **`GET /users/:id`**
  - **Auth**: Public
  - **Response**: Public profile details

---

### 4. Skill Categories (`/categories`) & Skills (`/skills`)
- **`GET /categories`**
  - **Auth**: Public
  - **Response**: All skill categories with icon, color, and skill counts
- **`GET /skills`**
  - **Auth**: Public
  - **Query Params**: `?category=...&search=...&level=...`
  - **Response**: Array of skills matching filters
- **`GET /skills/categories`** (Alias)
  - **Auth**: Public
  - **Response**: Category list
- **`GET /skills/:id`**
  - **Auth**: Public
  - **Response**: Single skill detail

---

### 5. Skill Matching Engine (`/matches`)
- **`GET /matches`**
  - **Auth**: Public / Optional Bearer Token
  - **Response**: List of matches scored by reciprocal algorithm (Best Match, Nearby, Same Interests)

---

### 6. Exchange Requests (`/exchanges`)
- **`GET /exchanges`**
  - **Auth**: Bearer Token required
  - **Response**: All incoming and outgoing exchange proposals for the logged-in user
- **`POST /exchanges`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "receiverId": "...", "skillOffered": "...", "skillWanted": "...", "message": "..." }`
  - **Response**: 201 Created exchange request
- **`PUT /exchanges/:id/status`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "status": "accepted" | "rejected" | "completed" | "cancelled" }`
  - **Response**: Updated exchange status

---

### 7. Sessions (`/sessions`)
- **`GET /sessions`**
  - **Auth**: Bearer Token required
  - **Query Params**: `?status=upcoming | ongoing | completed | cancelled`
  - **Response**: User's booked sessions
- **`POST /sessions`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "partnerId": "...", "skill": "...", "topic": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "durationMinutes": 60, "mode": "Google Meet", "notes": "..." }`
  - **Response**: 201 Created session with generated Google Meet room
- **`PUT /sessions/:id/status`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "status": "completed" | "cancelled" }`
  - **Note**: Marking a session as completed automatically awards +10 credits to mentor and logs credit ledger transaction.

---

### 8. Real-Time Chat & Messages (`/messages`)
- **`GET /messages/conversations`**
  - **Auth**: Bearer Token required
  - **Response**: Active conversation partners, last message, unread count
- **`GET /messages/:userId`**
  - **Auth**: Bearer Token required
  - **Response**: Chronological message history with partner
- **`POST /messages`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "receiverId": "...", "content": "..." }`
  - **Response**: 201 Message created & broadcasted via Socket.IO

---

### 9. Reviews & Reputation (`/reviews`)
- **`GET /reviews/user/:userId`**
  - **Auth**: Public
  - **Response**: Reviews and 5-star ratings received by user
- **`POST /reviews`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "revieweeId": "...", "rating": 5, "feedback": "...", "skillSwapped": "..." }`
  - **Response**: 201 Review recorded, recalculates recipient average rating and reputation score

---

### 10. Credits & Rewards Economy (`/credits`)
- **`GET /credits/balance`**
  - **Auth**: Bearer Token required
  - **Response**: Balance, total earned, total spent, transaction ledger
- **`POST /credits/redeem`**
  - **Auth**: Bearer Token required
  - **Body**: `{ "perkName": "Verified Mentor Badge", "cost": 20 }`
  - **Response**: Deducts credits and unlocks platform badge/perk

---

### 11. Notifications (`/notifications`)
- **`GET /notifications`**
  - **Auth**: Bearer Token required
  - **Response**: User notifications list and unread count
- **`PUT /notifications/:id/read`**
  - **Auth**: Bearer Token required
  - **Note**: Pass `all` as id to mark all notifications as read

---

### 12. Administration (`/admin`)
- **`GET /admin/users`**
  - **Auth**: Bearer Token required + **Role: `admin`**
  - **Query Params**: `?search=...&role=...&status=...`
  - **Response**: 200 OK with full user list for governance
- **`PUT /admin/users/:id`**
  - **Auth**: Bearer Token required + **Role: `admin`**
  - **Body**: `{ "role": "...", "credits": 50, "status": "active" | "inactive" }`
  - **Response**: Updated user administrative record
- **`DELETE /admin/users/:id`**
  - **Auth**: Bearer Token required + **Role: `admin`**
  - **Response**: 200 OK deletion confirmation

---

### 13. Platform Analytics (`/analytics`)
- **`GET /analytics/platform`**
  - **Auth**: Bearer Token required
  - **Response**: Platform KPIs (user growth, monthly exchange trends, category distribution, top skills)
