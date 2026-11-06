  # SkillSwap – User Workflow Documentation (Phase 3)

  ## 1. Overview & Closed-Loop Architecture

  SkillSwap operates on a peer-to-peer knowledge exchange model structured around a 10-step closed-loop user workflow. Users exchange their skills without monetary transactions, governed by a time-banking credit economy and reputation engine.

  ```mermaid
  flowchart TD
      A["1. Register & Login\n(/register, /login)"] --> B["2. Setup Profile & Skills\n(/profile)"]
      B --> C["3. Explore Catalog & Tags\n(/skills)"]
      C --> D["4. Algorithmic Matching\n(/matches)"]
      D --> E["5. Propose Knowledge Exchange\n(/exchange-requests)"]
      E --> F["6. Coordinate via Chat\n(/chat/:userId)"]
      F --> G["7. Schedule 1-on-1 Session\n(/schedule?partnerId=...&skill=...)"]
      G --> H["8. Attend Video Call\n(/my-sessions - Google Meet)"]
      H --> I["9. Mark Completed\n(+10 Credits to Mentor)"]
      I --> J["10. Submit Testimonial\n(/reviews?sessionId=... +2 Bonus Credits)"]
      J --> K["11. Redeem Credits & Badges\n(/credits)"]
      K --> D
  ```

  ---

  ## 2. Step-by-Step User Workflow

  ### Step 1: Registration & Authentication
  - **Routes:** `/register`, `/login`
  - **Component:** `RegisterPage.tsx`, `LoginPage.tsx`
  - **API Endpoints:** `POST /api/auth/register`, `POST /api/auth/login`
  - **Actions:**
    - New user registers with Full Name, Email, and Password.
    - Backend verifies password strength (minimum 6 characters) and prevents duplicate accounts.
    - Server hashes password with `bcryptjs` (salt factor 10) and assigns an initial grant of **20 welcome credits** and an initial reputation score of **100**.
    - A secure JWT token (valid for 7 days) is returned with the user payload (passwords excluded).
    - AuthContext stores the token in `localStorage`, establishes real-time Socket.IO connection, and redirects to `/dashboard`.

  ---

  ### Step 2: Profile Customization & Skill Inventory
  - **Route:** `/profile`
  - **Component:** `ProfilePage.tsx`
  - **API Endpoints:** `GET /api/users/profile`, `PUT /api/users/profile`
  - **Actions:**
    - Users define their public bio, geographic location, and availability schedule.
    - Users add skills they **Offer (Teach)**: e.g., "React & TypeScript", category "Web Development", level "Expert".
    - Users add skills they **Want (Learn)**: e.g., "Go & Microservices", category "Backend Development", level "Beginner".
    - Skills update triggers cache invalidation for the recommendation engine.

  ---

  ### Step 3: Skill Discovery & Catalog Filtering
  - **Route:** `/skills`
  - **Component:** `ExploreSkillsPage.tsx`
  - **API Endpoints:** `GET /api/skills`, `GET /api/categories`
  - **Actions:**
    - Browse community-wide catalog of skills with categories, difficulty levels, learner count, and average ratings.
    - Real-time search by keywords and tags (e.g., `#docker`, `#react`, `#graphql`).
    - Clicking **"Find Peer Mentors"** navigates directly to `/matches?skill=React%20%26%20TypeScript`.

  ---

  ### Step 4: Compatibility Matching & Partner Discovery
  - **Route:** `/matches`
  - **Component:** `FindPartnersPage.tsx`
  - **API Endpoints:** `GET /api/matches`
  - **Actions:**
    - Algorithmic matching compares the current user's `skillsWanted` against other active members' `skillsOffered`, and vice versa.
    - Generates a compatibility match score (e.g., 96% Match).
    - Users can filter by Category ("All", "Design", "Development", "Business").
    - Quick action buttons on each partner card:
      - **"Chat"**: Navigates directly to `/chat/:partnerId`.
      - **"Send Request"**: Opens pre-populated modal to initiate an exchange proposal.

  ---

  ### Step 5: Exchange Proposal Negotiation
  - **Route:** `/exchange-requests`
  - **Component:** `ExchangeRequestsPage.tsx`
  - **API Endpoints:** `GET /api/exchanges`, `POST /api/exchanges`, `PUT /api/exchanges/:id/status`
  - **Actions:**
    - User submits a swap proposal specifying:
      1. Skill Offered (teach)
      2. Skill Wanted (learn)
      3. Custom introductory message
    - **Guardrails:**
      - Self-exchange proposals are blocked with HTTP 400.
      - Duplicate pending requests between the same peer pair are blocked with HTTP 400.
    - Recipient receives an instant notification and can **Accept** or **Decline**.
    - Senders cannot accept their own proposals (enforced with HTTP 403).
    - Once accepted:
      - Status turns emerald (`ACCEPTED`).
      - Quick actions **"Schedule Session"** and **"Chat with partner"** become active.

  ---

  ### Step 6: Real-time Communication & Direct Messaging
  - **Routes:** `/chat`, `/chat/:userId`
  - **Component:** `ChatPage.tsx`
  - **API Endpoints:** `GET /api/messages/conversations`, `GET /api/messages/:partnerId`, `POST /api/messages`
  - **Socket.IO Events:** `send_message`, `receive_message`, `message_sent`
  - **Actions:**
    - Navigating with `/chat/:userId` automatically selects or initializes a conversation thread with that partner.
    - Real-time instant messaging with typing indicators, delivery timestamps, and online status.
    - Guardrail: Self-messaging is blocked with HTTP 400.

  ---

  ### Step 7: Session Scheduling & Google Meet Integration
  - **Route:** `/schedule`
  - **Component:** `ScheduleSessionPage.tsx`
  - **API Endpoints:** `POST /api/sessions`
  - **Query Parameters:** `?partnerId=...&skill=...`
  - **Actions:**
    - Automatically pre-populates mentor, skill, topic, and preferred date/time.
    - Generates a unique Google Meet link (e.g., `https://meet.google.com/ss-x9k2p`).
    - Guardrail: Self-session scheduling is blocked with HTTP 400.
    - Dispatches `session_scheduled` notification to partner.

  ---

  ### Step 8: Session Execution & Attendance Verification
  - **Route:** `/my-sessions`
  - **Component:** `MySessionsPage.tsx`
  - **API Endpoints:** `GET /api/sessions`, `PUT /api/sessions/:id/status`
  - **Actions:**
    - Tabbed overview: "Upcoming", "Ongoing", "Completed", "Cancelled", "All".
    - One-click launch into video call via **"Join Google Meet"**.
    - Cancellation confirmation dialog with audit tracking.

  ---

  ### Step 9: Session Completion & Mentor Reward (+10 Credits)
  - **Route:** `/my-sessions`
  - **API Endpoints:** `PUT /api/sessions/:id/status`
  - **Business Logic:**
    - Either participant (or admin) can mark an upcoming/ongoing session as `completed`.
    - Guardrails:
      - Cancelled sessions cannot be completed (HTTP 400).
      - Already-completed sessions cannot be re-completed (prevents duplicate credit awards).
    - **Credit Award:**
      - Mentor receives **+10 credits** immediately.
      - `CreditTransaction` logged with `type: 'earned'`, referencing session ID.
      - Mentor reputation increased by +15 points.
      - Learner reputation increased by +5 points.
      - Both users receive automated notifications.

  ---

  ### Step 10: Peer Review Submission & Reviewer Bonus (+2 Credits)
  - **Route:** `/reviews`
  - **Component:** `ReviewsPage.tsx`
  - **API Endpoints:** `POST /api/reviews`, `GET /api/reviews/user/:id`
  - **Cross-Module Link:** Clicking "Leave Review" on `/my-sessions` navigates to:
    `/reviews?sessionId=${session._id}&partnerId=${partner._id}&partnerName=${name}&skill=${skill}`
  - **Actions:**
    - Pre-populates the review modal with the completed session context.
    - User selects star rating (1–5) and writes qualitative feedback.
    - Guardrails:
      - Self-reviews are blocked with HTTP 400.
      - Duplicate reviews for the same session ID are blocked with HTTP 400.
    - **Reviewer Incentive:**
      - Submitting a verified review awards **+2 bonus credits** to the reviewer.
      - `CreditTransaction` logged with `type: 'bonus'`.
      - Reviewee average rating and total review counts are recalculated.

  ---

  ### Step 11: Credit Economy & Perk Redemption
  - **Route:** `/credits`
  - **Component:** `CreditsPage.tsx`
  - **API Endpoints:** `GET /api/credits/balance`, `GET /api/credits/history`, `POST /api/credits/spend`
  - **Actions:**
    - View real-time credit balance, total earned, and total spent.
    - Full audit ledger of all credit transactions with timestamps and type tags.
    - Spend credits on platform perks:
      - Highlighted profile listing (15 credits)
      - Priority search placement (25 credits)
      - Custom achievement badge unlock (50 credits)

