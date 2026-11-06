# REST API Endpoints Specification

Base URL: `http://localhost:5000/api`

### Health Check
- `GET /health` - API server status & MongoDB connection state

### Authentication (`/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user & return JWT token + user profile
- `GET /auth/me` - Get authenticated user profile (Bearer token)

### Users (`/users`)
- `GET /users` - List users / search
- `GET /users/:id` - Get user profile details
- `PUT /users/:id` - Update user profile & skills
- `GET /users/recommended` - Get recommended partners

### Skills & Categories (`/skills`, `/categories`)
- `GET /categories` - List skill categories with counts
- `GET /skills` - Explore skills with search & category filter
- `GET /skills/:id` - Get specific skill details

### Skill Matching (`/matches`)
- `GET /matches` - Compute partner matches (reciprocal score, nearby, same interests)

### Exchange Requests (`/exchanges`)
- `GET /exchanges` - Get user's exchange requests (incoming/outgoing)
- `POST /exchanges` - Send new exchange request
- `PUT /exchanges/:id/status` - Accept or reject exchange request

### Sessions (`/sessions`)
- `GET /sessions` - Get user sessions (upcoming, ongoing, completed)
- `POST /sessions` - Schedule a new session
- `PUT /sessions/:id/status` - Update session status (completed, cancelled, rescheduled)

### Chat & Messages (`/messages`)
- `GET /messages/conversations` - Get active conversations list
- `GET /messages/:userId` - Get message history with a partner
- `POST /messages` - Send a message (also broadcasted via Socket.IO)

### Reviews & Reputation (`/reviews`)
- `GET /reviews/user/:userId` - Get reviews for a user
- `POST /reviews` - Submit review for completed session

### Credits & Rewards (`/credits`)
- `GET /credits/balance` - Get user credit balance & transaction ledger
- `POST /credits/redeem` - Redeem learning credits

### Notifications (`/notifications`)
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark notification as read

### Admin & Analytics (`/admin`, `/analytics`)
- `GET /admin/users` - Admin user management
- `PUT /admin/users/:id/status` - Activate / deactivate user
- `DELETE /admin/users/:id` - Delete user
- `GET /analytics/platform` - Platform metrics (growth, categories, ratings, monthly exchanges)

