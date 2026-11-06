# System Architecture Overview

SkillSwap operates on a decoupled client-server architecture with real-time bidirectional event streaming via Socket.IO:

```
[ Client (React + Vite + TypeScript + Tailwind) ]
               │                │
       HTTP / REST        WebSocket (Socket.IO)
               │                │
               ▼                ▼
[ Express.js REST API ]    [ Socket.IO Gateway ]
               │                │
               └───────┬────────┘
                       ▼
            [ Controllers & Services ]
                       │
                       ▼
             [ Mongoose Models ]
                       │
                       ▼
            [ MongoDB Database ]
```

## Key Layers
1. **Presentation Layer (Client)**: Single-page application using React Router 6, Tailwind CSS for modern SaaS aesthetics, Framer Motion for micro-interactions, and Recharts for interactive analytics.
2. **API & Real-time Layer (Server)**: Express RESTful routes with JWT bearer authentication, structured error handling middleware, and Socket.IO server for instant messaging and notifications.
3. **Domain & Data Layer (Mongoose + MongoDB)**: Strict TypeScript interfaces, schema validations, indexing for fast skill exploration and match score computations.

