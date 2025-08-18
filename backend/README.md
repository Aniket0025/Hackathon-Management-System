# Backend (Express + MongoDB)

This is the backend for the project, built with Express and MongoDB (Mongoose).

## Quick Start

1. Copy `.env.example` to `.env` and set values:

```
PORT=4000
MONGO_URI=<your MongoDB Atlas URI>
JWT_SECRET=<your secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

2. Install deps and run (from `backend/`):

```
npm install
npm run dev
```

## Structure

- `src/server.js`: Server bootstrap
- `src/app.js`: Express app, middleware, routes
- `src/config/db.js`: Mongo connection
- `src/models/*`: Mongoose models
- `src/controllers/*`: Route handlers
- `src/routes/*`: Express routers
- `src/middleware/*`: Auth and error handling
- `src/utils/*`: Helpers

## Auth
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Me: `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

## Entities
- Events: CRUD at `/api/events`
- Teams: basic endpoints at `/api/teams`
- Submissions: basic endpoints at `/api/submissions`

Adjust CORS in `.env` for your frontend origin.
