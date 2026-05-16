# Scribble Backend

This folder contains the Express, Socket.IO, MongoDB, Redis, and authentication layer for Scribble.

## What This Service Does

The backend is responsible for:

- Google OAuth login and JWT creation
- Session handoff to the frontend after authentication
- Room creation, joining, leaving, and game lifecycle management
- Real-time gameplay, canvas relays, scoring, and turn progression
- Player stats and match history APIs
- Persistent data in MongoDB and transient game state in Redis

## Tech Stack

- Node.js
- Express 5
- TypeScript
- Socket.IO
- MongoDB with Mongoose
- Redis with ioredis
- Passport Google OAuth 2.0
- JWT authentication

## Folder Structure

```text
src/
├── app.ts              Express app setup
├── server.ts           HTTP server bootstrap and Socket.IO startup
├── config/             Environment, database, Redis, and Passport setup
├── controllers/        Auth and other HTTP controllers
├── middlewares/        Auth and error handling middleware
├── models/             Mongoose models
├── routes/             HTTP routes
├── services/           Business logic for rooms, games, players, scoring
├── sockets/            Socket.IO event handlers
├── types/              Shared TypeScript types for sockets and game data
└── utils/              Helper utilities such as timers and word generation
```

## Main Responsibilities by Area

### Config

- `config/db.ts`: MongoDB connection setup
- `config/env.ts`: Environment variable access
- `config/passport.ts`: Google OAuth strategy and user lookup/creation
- `config/redis.ts`: Redis connection setup

### Routes

- `routes/authRoutes.ts`: Google auth, callback redirect, and logout
- `routes/playerRoutes.ts`: Player stats and match history endpoints
- `routes/roomRoutes.ts`: Room endpoints are present but currently commented out in the app bootstrap

### Services

- `services/roomService.ts`: Room creation and membership state in Redis
- `services/gameService.ts`: Game lifecycle, turn rotation, and end-game processing
- `services/playerService.ts`: Player history and stats aggregation
- `services/scoringService.ts`: Guess scoring and match scoring rules

### Sockets

- `sockets/roomSocket.ts`: Room creation, join, leave, start, and turn events
- `sockets/gameSocket.ts`: Word selection, guess handling, temporary names, and canvas sync orchestration
- `sockets/drawingSocket.ts`: Canvas drawing, erasing, clearing, and snapshot forwarding
- `sockets/index.ts`: Socket.IO authentication middleware and socket registration

## Local Setup

Install dependencies from this folder:

```bash
npm install
```

Run the server in development mode:

```bash
npm run dev
```

Build the TypeScript project:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

## Environment Variables

Create a `.env` file in this folder with:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_long_random_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Variable Usage

- `PORT` controls the HTTP server port.
- `MONGO_URI` connects the Mongoose models to MongoDB.
- `REDIS_URL` stores live room and game state.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` configure Google sign-in.
- `JWT_SECRET` signs the JWT returned to the frontend.
- `FRONTEND_URL` is used for the post-login redirect.

## HTTP API

### Auth

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/logout`

The Google callback generates a JWT and redirects back to the frontend auth success page with the token in the query string.

### Player

- `GET /api/player/stats`
- `GET /api/player/history?limit=20`

Both routes require a valid JWT and return the signed-in player's data.

## Socket.IO Event Overview

The backend uses Socket.IO for real-time gameplay.

### Room Events

- `create_room`: Create a new room for the authenticated user
- `join_room`: Join an existing room by code
- `leave_room`: Leave the current room
- `start_game`: Start the match with optional settings
- `next_turn`: Advance to the next drawer or end the game

### Game Events

- `register_name`: Store a display name for a connected player
- `choose_word`: Drawer selects the round word
- `guess_word`: Player submits a guess
- `game_started`: Broadcast initial game state
- `turn_updated`: Broadcast turn changes
- `word_chosen`: Send the hidden word to guessers
- `game_over`: Broadcast final result and winner

### Drawing Events

- `draw_line`: Broadcast a drawing segment to the room
- `erase_stroke`: Remove a stroke from the shared canvas
- `clear_canvas`: Clear the shared canvas
- `request_canvas_sync`: Ask the drawer for the current canvas state
- `deliver_canvas_snapshot`: Forward a canvas snapshot to a new player
- `receive_canvas_snapshot`: Send the canvas data to the target socket

## Game Flow

1. A player signs in through Google auth.
2. The backend creates a JWT and returns the user to the frontend.
3. The player creates or joins a room over Socket.IO.
4. The host starts the game when enough players are present.
5. The current drawer chooses a word and starts the timer.
6. Guess submissions are scored and broadcast to the room.
7. The server advances turns and ends the game when the match is complete.

## Persistence Model

- MongoDB stores user and game history data.
- Redis stores live room state, game state, room settings, and other transient match data.
- An in-memory map is used for temporary display names and active drawer tracking during a running process.

## Related Docs

- Root overview: [../README.md](../README.md)
- Frontend guide: [../frontend/README.md](../frontend/README.md)