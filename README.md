# SkillSwap – Knowledge Exchange Network

## Overview
SkillSwap is a modern, full-stack peer-to-peer knowledge exchange platform designed to empower learners and mentors to swap skills collaboratively. Built on an egalitarian learning credit economy, SkillSwap allows users to teach what they know and learn what they love without financial barriers.

## Architecture & Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Framer Motion, Lucide React, Axios, Socket.IO Client, Recharts.
- **Backend**: Node.js, Express.js, TypeScript, MongoDB (Mongoose), Socket.IO, JWT, bcryptjs.
- **Real-Time**: Socket.IO for instant messaging, exchange notifications, and session alerts.
- **Database**: MongoDB with schemas for Users, Skills, Categories, Exchanges, Sessions, Messages, Reviews, Credits, and Notifications.

## Directory Structure
```
SkillSwap/
├── client/          # Frontend React + Vite + TypeScript application
├── server/          # Backend Express + TypeScript + MongoDB API
├── docs/            # System documentation and architectural specifications
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── matching/
│   ├── safety/
│   └── decisions/
├── .env.example     # Environment template
├── .gitignore
├── README.md
└── package.json     # Root orchestration scripts
```

## Quick Start
1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```
2. **Seed Database with Initial Realistic Data**:
   ```bash
   npm run seed
   ```
3. **Run Full-Stack Development**:
   ```bash
   npm run dev
   ```
   - Client: [http://localhost:5173](http://localhost:5173)
   - Server: [http://localhost:5000](http://localhost:5000)
   - Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

