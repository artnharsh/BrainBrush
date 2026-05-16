# Scribble

Scribble is a real-time multiplayer drawing and guessing game with Google sign-in, live rooms, synchronized canvas updates, in-game chat, scoring, and player history tracking.

The project is split into two apps:

- `backend/`: Express, Socket.IO, MongoDB, Redis, and Google OAuth/JWT auth
- `frontend/`: React 19, TypeScript, Vite, Socket.IO client, Zustand, and Tailwind CSS

For folder-specific setup and architecture details, see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## Features

- Google authentication with JWT-based session handoff
- Create or join live game rooms with a short room code
- Real-time drawing, erasing, and canvas synchronization
- Turn-based word selection, guessing, scoring, and round progression
- Lobby controls for host-driven game start and game settings
- Player stats and match history pages
- Docker Compose setup for running the stack together

## Tech Stack

- Backend: Express, Socket.IO, Passport Google OAuth 2.0, MongoDB/Mongoose, Redis, TypeScript
- Frontend: React 19, React Router, Socket.IO client, Axios, Zustand, Vite, Tailwind CSS

## Repository Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## Prerequisites

- Node.js 20+ recommended
- MongoDB
- Redis
- Google OAuth credentials

## Environment Variables

Create a `backend/.env` file with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_long_random_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Create a `frontend/.env` file with:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Notes:

- `VITE_API_BASE_URL` is used for both REST API calls and Socket.IO connections.
- `FRONTEND_URL` is used by the backend to redirect after Google login.
- If you run behind Docker or a deployed domain, update both values accordingly.

## Local Development

Install dependencies separately in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Run the backend and frontend in two terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

By default, the backend runs on `http://localhost:5000` and the frontend runs on Vite's default dev port.

## Docker

The repository includes a `docker-compose.yml` for running the backend and frontend together.

```bash
docker compose up --build
```

This starts:

- backend on port `5000`
- frontend on port `80`

## Available Scripts

Backend:

```bash
cd backend
npm run dev
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## Game Flow

1. Sign in with Google.
2. Enter the lobby.
3. Create a room or join one with a room code.
4. The host starts the game once enough players are present.
5. One player draws while others guess in real time.
6. Scores, round changes, and game-over state are broadcast live.
7. After a match, players can review stats and history.

## Backend Endpoints

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/logout`
- `GET /api/player/stats`
- `GET /api/player/history`

## Socket Events

Some of the main Socket.IO events used by the game include:

- Room flow: `create_room`, `join_room`, `leave_room`, `start_game`, `next_turn`
- Drawing flow: `draw_line`, `erase_stroke`, `clear_canvas`, `request_canvas_sync`, `deliver_canvas_snapshot`
- Game flow: `register_name`, `choose_word`, `guess_word`

## Deployment Notes

- The backend expects a valid Google OAuth setup and access to MongoDB and Redis.
- The frontend reads the API base URL from `VITE_API_BASE_URL` at build time.
- If you change the backend host, update the OAuth redirect and the frontend API base URL together.

## License

ISC