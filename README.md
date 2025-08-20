# Hackathon Management System

A full-stack web app for managing hackathons: events, registrations, teams, submissions, judging, community updates, and analytics.

- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui, lucide-react
- Backend: Express.js, MongoDB (Mongoose)
- Real-time: Socket.IO

## Features
- Participant portal: register, view "My Applications", create/update submissions
- Judge/Organizer: role-aware UI (organizer access restricted on My Apply)
- Profile management with social links (GitHub/LinkedIn)
- Event pages, team info, and submission forms
- Community & notifications (backend routes in `backend/src/`)

# 🔑 Demo Access Accounts

Use the following demo accounts to explore the project features.  
These are **test accounts only** and should be used for demonstration purposes.

---

## 👨‍💼 Organizers
| Email | Password | Role |
|-------|----------|------|
| aniketyadav25012005@gmail.com | 123456789 | Organizer |
| chaitnyauthale5@gmail.com     | 123456789 | Organizer |

---

## 🧑‍🤝‍🧑 Participants
| Email | Password | Role |
|-------|----------|------|
| gadesujit106@gmail.com | 123456789 | Participant |
| rmane0069@gmail.com     | 123456789 | Participant |

---

## ⚖️ Judges
| Email | Password | Role |
|-------|----------|------|
| omkarmalakgade123@gmail.com | 123456789 | Judge |
| chaitanyauthale5@gmail.com  | 123456789 | Judge |
| ompatil123@gmail.com        | 123456789 | Judge |
| aniket93yadav@gmail.com     | 123456789 | Judge |

---

📌 **Note:**  
All demo accounts use the same password: **`123456789`**


## Monorepo Structure
```
.
├─ backend/                # Express + MongoDB API
│  ├─ src/
│  ├─ .env                 # Backend environment variables
│  └─ package.json         # dev/start scripts
├─ frontend/               # Next.js app (App Router)
│  ├─ app/
│  ├─ components/
│  ├─ public/
│  ├─ .env.local           # Frontend environment variables
│  └─ package.json         # dev/build/start scripts
└─ README.md               # You are here
```

## Requirements
- Node.js 18+ (recommended LTS) and npm
- MongoDB Atlas (or local MongoDB)

## Environment Variables

### Backend (`backend/.env`)
Copy from `.env.example` if present, or create `backend/.env` with:
```
PORT=4000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```
# Base URL of the backend API used by the frontend
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## Install & Run (Development)
Open two terminals at the repo root.

1) Backend
```
cd backend
npm install
npm run dev
# API on http://localhost:4000
```

2) Frontend
```
cd frontend
npm install
npm run dev
# App on http://localhost:3000
```

If you deploy backend elsewhere, update `NEXT_PUBLIC_API_BASE` in `frontend/.env.local` accordingly.

## Build & Start (Production)
Backend:
```
cd backend
npm install
npm run start
```

Frontend:
```
cd frontend
npm install
npm run build
npm run start
```

## Useful Scripts
- Backend: `npm run dev` (nodemon), `npm start`
- Frontend: `npm run dev`, `npm run build`, `npm start`, `npm run lint`

## Conventions
- Frontend uses Next.js App Router with TypeScript, Tailwind CSS v4, shadcn/ui components in `frontend/components/ui/`
- API base URL is read from `process.env.NEXT_PUBLIC_API_BASE`
- Organizer role is redirected away from participant-only pages (e.g., `my-apply`)

## Troubleshooting
- CORS: ensure `CORS_ORIGIN` in backend `.env` matches your frontend origin
- Auth: frontend includes `Authorization: Bearer <token>` from localStorage when available; ensure JWT settings are valid
- Mongo: verify `MONGO_URI` connectivity; check network/IP allowlist for Atlas

## License
MIT (or your preferred license). Update this section as needed.

---

## Docker (Optional)
Quickly run MongoDB and the backend locally with Docker Compose. Create `docker-compose.yml` at repo root:

```yaml
version: '3.9'
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  api:
    build: ./backend
    command: node src/server.js
    environment:
      PORT: 4000
      MONGO_URI: mongodb://mongo:27017/hackathon
      JWT_SECRET: changeme
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "4000:4000"
    depends_on:
      - mongo
volumes:
  mongo_data:
```

Then run:
```
docker compose up -d
# Frontend still runs via npm run dev in ./frontend (NEXT_PUBLIC_API_BASE=http://localhost:4000)
```

## Deployment

### Frontend (Vercel)
- Framework preset: Next.js
- Build command: `npm run build`
- Output: `.next`
- Env: set `NEXT_PUBLIC_API_BASE` to your deployed API URL

### Backend (Render/Railway/Heroku)
- Node app, start command: `node src/server.js`
- Env vars required:
  - `PORT` (Render sets automatically, read from `process.env.PORT`)
  - `MONGO_URI`
  - `JWT_SECRET`, `JWT_EXPIRES_IN`
  - `CORS_ORIGIN` (your frontend origin, e.g., `https://your-app.vercel.app`)

After deploy, update frontend `NEXT_PUBLIC_API_BASE` to the backend URL.

## API Overview
Base URL: `${NEXT_PUBLIC_API_BASE}` (local default `http://localhost:4000`).

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (requires `Authorization: Bearer <token>`)

- Core
  - Events: `/api/events`
  - Teams: `/api/teams`
  - Submissions: `/api/submissions`
  - Registrations (mine): `/api/registrations/mine`

Example (login + me):
```bash
curl -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret"}'

curl "$API/auth/me" -H "Authorization: Bearer <JWT>"
```

## Seed Data (Optional)
If you want quick test data, insert a user and an event in Mongo:

```js
// In Mongo shell or MongoDB Compass
use hackathon
db.users.insertOne({ email: 'test@user.com', password: 'hashed', role: 'participant' })
db.events.insertOne({ name: 'Sample Hack', startDate: new Date(), endDate: new Date() })
```

Or add a small script under `backend/src/utils/seed.js` and run it with `node` after setting env.

## 📸 Screenshots

### 🔹 Dashboard & Event Management
<p align="center">
  <img src="https://github.com/user-attachments/assets/8df9d41a-2db9-40a6-a682-426b8111d836" alt="Dashboard" width="45%"/>
  <img src="https://github.com/user-attachments/assets/26a7eee8-b97c-4d94-9dd3-91e35e64e14f" alt="Event Management" width="45%"/>
</p>

### 🔹 Event Registration & Judge Assigning
<p align="center">
  <img src="https://github.com/user-attachments/assets/32a950d3-8e5c-4ec7-912f-05191baf65fa" alt="Event Registration" width="45%"/>
  <img src="https://github.com/user-attachments/assets/a8e2762f-f092-436a-9d6d-5eae37e1dbb6" alt="Judge Assigning" width="45%"/>
</p>

### 🔹 Event Details
<p align="center">
  <img src="https://github.com/user-attachments/assets/8577405e-8023-43e7-b900-b19168cdd758" alt="Event Details 1" width="45%"/>
  <img src="https://github.com/user-attachments/assets/f496c852-3632-4763-ab57-2e62deb7aad6" alt="Event Details 2" width="45%"/>
</p>

### 🔹 Analytics
<p align="center">
  <img src="https://github.com/user-attachments/assets/3079728d-df23-49de-af5d-35ddb1bc0fcc" alt="Analytics 1" width="45%"/>

  <img src="https://github.com/user-attachments/assets/53ed0183-9c4c-4330-b53f-7355551f7b4e" alt="Analytics 2" width="45%"/>
</p>







## Security Notes
- Never commit real secrets. Use environment variables.
- Configure CORS precisely per environment.
- Rotate `JWT_SECRET` for production and use HTTPS in production deployments.
