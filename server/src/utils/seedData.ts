import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { User } from '../models/User';
import { SkillCategory } from '../models/SkillCategory';
import { Skill } from '../models/Skill';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Session } from '../models/Session';
import { Message } from '../models/Message';
import { Review } from '../models/Review';
import { CreditTransaction } from '../models/CreditTransaction';
import { Notification } from '../models/Notification';
import { Achievement } from '../models/Achievement';

export const seedDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongoUri);
    }

    console.log('[Seed] Checking existing data...');
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[Seed] Database already has ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('[Seed] Empty database detected. Seeding initial realistic data...');

    // 1. Categories
    const categories = await SkillCategory.create([
      { name: 'Programming', slug: 'programming', description: 'Web, mobile, systems & cloud software development', icon: 'Code', color: 'emerald', skillCount: 24 },
      { name: 'Design', slug: 'design', description: 'UI/UX, graphic design, design systems & 3D art', icon: 'Palette', color: 'orange', skillCount: 18 },
      { name: 'Business', slug: 'business', description: 'Product management, entrepreneurship, fundraising & finance', icon: 'Briefcase', color: 'blue', skillCount: 15 },
      { name: 'Language', slug: 'language', description: 'Foreign language fluency, pronunciation & business communications', icon: 'Languages', color: 'purple', skillCount: 12 },
      { name: 'Video Editing', slug: 'video-editing', description: 'Cinematic storytelling, Premiere Pro, DaVinci & color grading', icon: 'Video', color: 'red', skillCount: 10 },
      { name: 'Data Science', slug: 'data-science', description: 'Machine learning, AI prompting, pandas, SQL & analytics', icon: 'Database', color: 'teal', skillCount: 14 },
    ]);

    // 2. Skills
    const skills = await Skill.create([
      { title: 'React & TypeScript', category: 'Programming', description: 'Modern reactive web apps with strict type safety, hooks and state management', tags: ['React', 'TypeScript', 'Frontend'], level: 'Advanced', learnerCount: 340, mentorCount: 52, rating: 4.9, icon: 'Code' },
      { title: 'Figma UI/UX & Design Systems', category: 'Design', description: 'Master wireframing, interactive prototyping, autolayout and design tokens', tags: ['Figma', 'UI/UX', 'Design System'], level: 'All Levels', learnerCount: 420, mentorCount: 65, rating: 4.9, icon: 'Palette' },
      { title: 'Python & Data Analysis', category: 'Data Science', description: 'Exploratory data analysis using pandas, NumPy, and visualization libraries', tags: ['Python', 'Data', 'Pandas'], level: 'Intermediate', learnerCount: 290, mentorCount: 40, rating: 4.8, icon: 'Database' },
      { title: 'Conversational Spanish', category: 'Language', description: 'Natural speaking fluency, everyday idioms and business conversations', tags: ['Spanish', 'Language', 'Speaking'], level: 'Beginner', learnerCount: 180, mentorCount: 28, rating: 4.9, icon: 'Languages' },
      { title: 'Premiere Pro & Motion Graphics', category: 'Video Editing', description: 'Pacing, cut techniques, sound design, After Effects dynamic links', tags: ['Video', 'Premiere', 'Editing'], level: 'Intermediate', learnerCount: 210, mentorCount: 31, rating: 4.7, icon: 'Video' },
      { title: 'Product Management & GTM', category: 'Business', description: 'User stories, sprint planning, roadmapping, and metrics that matter', tags: ['Product', 'Strategy', 'Agile'], level: 'Advanced', learnerCount: 195, mentorCount: 34, rating: 4.8, icon: 'Briefcase' },
    ]);

    // 3. Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = await User.create([
      {
        name: 'Elena Rostova',
        email: 'elena@skillswap.com',
        password: passwordHash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
        bio: 'Senior Design Systems Lead with 7+ years creating enterprise SaaS designs. Passionate about teaching UI/UX and learning Full-Stack React development.',
        location: 'San Francisco, CA',
        role: 'mentor',
        credits: 85,
        rating: 4.95,
        reputationScore: 240,
        reviewCount: 34,
        sessionsCompleted: 42,
        skillsOffered: [
          { name: 'Figma UI/UX & Design Systems', category: 'Design', level: 'Expert', description: 'Design tokens, auto-layout, components' },
          { name: 'Wireframing & Prototyping', category: 'Design', level: 'Expert', description: 'Rapid user testing prototypes' },
        ],
        skillsWanted: [
          { name: 'React & TypeScript', category: 'Programming', level: 'Intermediate', description: 'Want to code my own design systems' },
          { name: 'Node.js & Express', category: 'Programming', level: 'Beginner', description: 'API fundamentals' },
        ],
        availability: 'Mon, Wed, Fri 5-8 PM PST',
        status: 'active',
        badges: ['Top Mentor', 'Community Star', 'Design Guild Lead'],
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@skillswap.com',
        password: passwordHash,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        bio: 'Full-Stack Developer specializing in Node.js, React, and MongoDB. Looking to level up my Figma design skills and learn conversational Spanish.',
        location: 'Austin, TX',
        role: 'learner_mentor',
        credits: 50,
        rating: 4.88,
        reputationScore: 190,
        reviewCount: 22,
        sessionsCompleted: 28,
        skillsOffered: [
          { name: 'React & TypeScript', category: 'Programming', level: 'Advanced', description: 'Clean architecture, custom hooks, state' },
          { name: 'Node.js & MongoDB', category: 'Programming', level: 'Advanced', description: 'REST APIs, Mongoose, Auth' },
        ],
        skillsWanted: [
          { name: 'Figma UI/UX & Design Systems', category: 'Design', level: 'Intermediate', description: 'Improve my frontend layout aesthetics' },
          { name: 'Conversational Spanish', category: 'Language', level: 'Beginner', description: 'Everyday dialogue' },
        ],
        availability: 'Weekends 10 AM - 4 PM CST',
        status: 'active',
        badges: ['Active Learner', 'Code Wizard'],
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@skillswap.com',
        password: passwordHash,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        bio: 'Data Scientist & Machine Learning researcher. Eager to teach Python, Pandas & SQL in exchange for video editing and storytelling techniques.',
        location: 'Seattle, WA',
        role: 'learner_mentor',
        credits: 65,
        rating: 4.92,
        reputationScore: 210,
        reviewCount: 29,
        sessionsCompleted: 35,
        skillsOffered: [
          { name: 'Python & Data Analysis', category: 'Data Science', level: 'Expert', description: 'Jupyter, NumPy, Pandas, Scikit-learn' },
        ],
        skillsWanted: [
          { name: 'Premiere Pro & Motion Graphics', category: 'Video Editing', level: 'Beginner', description: 'Creating tech explainers' },
        ],
        availability: 'Tue & Thu 6-9 PM PST',
        status: 'active',
        badges: ['Top Mentor', 'Data Whisperer'],
      },
      {
        name: 'Admin Master',
        email: 'admin@skillswap.com',
        password: passwordHash,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
        bio: 'SkillSwap Platform Administrator & Community Coordinator.',
        location: 'New York, NY',
        role: 'admin',
        credits: 999,
        rating: 5.0,
        reputationScore: 500,
        reviewCount: 50,
        sessionsCompleted: 80,
        skillsOffered: [{ name: 'Product Management & GTM', category: 'Business', level: 'Expert' }],
        skillsWanted: [],
        availability: 'Full Time',
        status: 'active',
        badges: ['Platform Admin', 'Founder Badge'],
      },
    ]);

    const [elena, marcus, sarah, admin] = users;

    // 4. Exchange Requests
    await ExchangeRequest.create([
      {
        sender: marcus._id,
        receiver: elena._id,
        skillOffered: 'React & TypeScript',
        skillWanted: 'Figma UI/UX & Design Systems',
        message: 'Hi Elena! I love your design system portfolio. I would love to teach you modern React component architecture in return for Figma mentorship!',
        status: 'accepted',
      },
      {
        sender: sarah._id,
        receiver: marcus._id,
        skillOffered: 'Python & Data Analysis',
        skillWanted: 'Node.js & MongoDB',
        message: 'Hey Marcus, looking to build an ML backend API with Node and Express. Would love to swap Python skills!',
        status: 'pending',
      },
    ]);

    // 5. Sessions
    await Session.create([
      {
        mentor: elena._id,
        learner: marcus._id,
        skill: 'Figma UI/UX & Design Systems',
        topic: 'Mastering Auto-Layout & Design Tokens for Developer Handoff',
        date: '2026-11-08',
        time: '18:00',
        durationMinutes: 60,
        mode: 'Google Meet',
        meetingLink: 'https://meet.google.com/ss-figma-handshake',
        notes: 'Bring current React component library wireframes to inspect live.',
        status: 'upcoming',
      },
      {
        mentor: marcus._id,
        learner: elena._id,
        skill: 'React & TypeScript',
        topic: 'Building a Reusable Button & Card Component in TypeScript',
        date: '2026-11-10',
        time: '19:00',
        durationMinutes: 60,
        mode: 'Google Meet',
        meetingLink: 'https://meet.google.com/ss-react-dive',
        notes: 'Setting up local Vite React environment.',
        status: 'upcoming',
      },
      {
        mentor: sarah._id,
        learner: marcus._id,
        skill: 'Python & Data Analysis',
        topic: 'Data cleaning and CSV analysis with Pandas',
        date: '2026-11-02',
        time: '17:00',
        durationMinutes: 60,
        mode: 'Google Meet',
        meetingLink: 'https://meet.google.com/ss-python-pandas',
        notes: 'Great session covering basic dataframes.',
        status: 'completed',
      },
    ]);

    // 6. Messages
    await Message.create([
      {
        sender: marcus._id,
        receiver: elena._id,
        content: 'Hi Elena! Looking forward to our upcoming Figma design session this weekend.',
        read: true,
      },
      {
        sender: elena._id,
        receiver: marcus._id,
        content: 'Hey Marcus! Likewise, I have prepared a practical file with auto-layout exercises for us.',
        read: true,
      },
      {
        sender: marcus._id,
        receiver: elena._id,
        content: 'Awesome! See you on Google Meet at 6 PM.',
        read: true,
      },
    ]);

    // 7. Reviews
    await Review.create([
      {
        reviewer: marcus._id,
        reviewee: sarah._id,
        rating: 5,
        feedback: 'Sarah is an incredible Python instructor! She broke down complex pandas concepts effortlessly. Highly recommend swapping skills with her!',
        skillSwapped: 'Python & Data Analysis',
      },
      {
        reviewer: sarah._id,
        reviewee: marcus._id,
        rating: 5,
        feedback: 'Marcus was prepared, enthusiastic, and asked insightful questions. A truly rewarding peer learning experience!',
        skillSwapped: 'Node.js & MongoDB',
      },
    ]);

    // 8. Credit Transactions
    await CreditTransaction.create([
      { user: elena._id, amount: 30, type: 'bonus', description: 'Welcome signup credits bonus' },
      { user: elena._id, amount: 20, type: 'earned', description: 'Completed 2 mentorship sessions' },
      { user: marcus._id, amount: 30, type: 'bonus', description: 'Welcome signup credits bonus' },
      { user: marcus._id, amount: 10, type: 'earned', description: 'Taught React introductory workshop' },
    ]);

    // 9. Notifications
    await Notification.create([
      {
        user: elena._id,
        title: 'Session Reminder',
        message: 'Upcoming session with Marcus Vance scheduled for Nov 8 at 18:00.',
        type: 'session_scheduled',
        link: '/my-sessions',
        read: false,
      },
      {
        user: marcus._id,
        title: 'Exchange Accepted!',
        message: 'Elena Rostova accepted your skill exchange request for Figma UI/UX!',
        type: 'exchange_request',
        link: '/exchange-requests',
        read: false,
      },
    ]);

    console.log('[Seed] Database successfully seeded with 10 rich collections!');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
};

// If run directly via command line
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('[Seed] Finished.');
    process.exit(0);
  });
}

