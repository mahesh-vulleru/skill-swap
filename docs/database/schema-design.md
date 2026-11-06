# Database Schema Design

SkillSwap uses 10 core collections in MongoDB:

1. **User**: Credentials, profiles, role (`learner`, `mentor`, `learner_mentor`, `admin`), credits balance, rating, reputation, skills offered, skills wanted, availability, status (`active`, `inactive`).
2. **SkillCategory**: Major skill categories (Programming, Design, Business, Language, Video Editing, Data Science, etc.).
3. **Skill**: Specific skills with category reference, popularity, learner/mentor counts, icon, description.
4. **ExchangeRequest**: Exchange negotiations between requester and recipient (offered skill, wanted skill, status: `pending`, `accepted`, `rejected`, `completed`, `cancelled`).
5. **Session**: Scheduled learning sessions (Google Meet / online mode, date, time, duration, status: `upcoming`, `ongoing`, `completed`, `cancelled`, meetingLink, notes).
6. **Message**: Real-time chat messages linked to an exchange or direct user pair, timestamps, read receipts, sender/recipient refs.
7. **Review**: 5-star ratings, written testimonials, reviewer and reviewee refs, session ref.
8. **CreditTransaction**: Ledger tracking credit earning (e.g., teaching session +10, signup bonus +20) and credit spending (e.g., learning session -10).
9. **Notification**: User notifications for request events, session reminders, chat messages, credit balance changes.
10. **Achievement**: Badges and milestones (e.g., "Top Mentor", "Active Learner", "Community Star", "First Exchange").

