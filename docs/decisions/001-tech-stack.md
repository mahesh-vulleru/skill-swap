# ADR 001: Technology Stack Selection

## Status
Accepted

## Context
SkillSwap requires a responsive, high-performance web client with modern SaaS aesthetics, smooth micro-interactions, robust type safety, real-time messaging, and an API with MongoDB document storage.

## Decision
- **Client**: React 18 with Vite + TypeScript, styled using Tailwind CSS, Framer Motion for interactive micro-animations, Lucide React icons, and Recharts for analytics.
- **Server**: Express.js with TypeScript, Mongoose for schema-based MongoDB object modeling, and Socket.IO for real-time WebSocket communication.
- **Authentication**: JWT with bcryptjs for password hashing.

