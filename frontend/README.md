# Scribble Frontend

This folder contains the React client for Scribble, the multiplayer drawing and guessing game.

## What This App Does

The frontend handles:

- Google sign-in entry point and JWT handoff
- Protected lobby, game, and history routes
- Real-time Socket.IO communication with the backend
- Drawing canvas interactions, chat, scoreboard, and podium views
- Player profile state, room state, and game state in Zustand

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Socket.IO client
- Axios
- Zustand
- Tailwind CSS
- Lucide icons

## Folder Structure

```text
src/
├── api/               HTTP client setup
├── assets/            Static assets used by the app
├── components/        Shared UI blocks and game widgets
├── hooks/             Reusable React hooks
├── pages/             Route-level screens
├── store/             Global game/auth state
├── types/             Frontend socket and data types
├── utils/             Drawing, error handling, and helpers
├── App.tsx            App shell and auth hydration
├── main.tsx           React bootstrap and providers
├── routes.tsx         Route definitions
└── socketClient.ts    Socket.IO client singleton
```

## Main Pages

- Login page: Google sign-in entry point
- Auth success page: Receives the JWT after Google login and stores session data
- Lobby page: Create or join a room, set a display name, and start the game as host
- Game page: Live canvas, chat, scoreboard, and turn-based gameplay
- Player history page: Statistics and match history for the signed-in player

## Core Components

- CanvasBoard: Drawing surface and canvas event handling
- ChatBox: Player chat and guess feed
- GameHeader: Live match header and turn state
- GameSettingsPanel: Room/game configuration controls
- PlayerList: Current room membership display
- ScoreBoard: Round scores and ranking view
- Podium: End-of-game summary screen
- WordSelectionModal: Drawer word choice UI
- ProtectedRoute: Guards authenticated routes

## Local Setup

Install dependencies from this folder:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Lint the codebase:

```bash
npm run lint
```

Preview a production build:

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in this folder with:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Variable Usage

- `VITE_API_BASE_URL` is used for REST requests and the Socket.IO connection.
- `VITE_GOOGLE_CLIENT_ID` is passed into the Google OAuth provider.

## Runtime Flow

1. The app boots in `main.tsx`, wraps the tree in the Google OAuth provider, and mounts the error boundary.
2. `App.tsx` restores the JWT from local storage and hydrates the global auth state.
3. The router sends unauthenticated users to the login page and authenticated users to the lobby.
4. The lobby connects to the socket server, lets the host create a room, and broadcasts the room code.
5. During a match, the game page renders the canvas, chat, score, and turn widgets.
6. After the match, the player history page fetches stats and match history from the backend.

## API Integration

The frontend talks to these backend HTTP endpoints through `src/api/axiosClient.ts`:

- `/api/player/stats`
- `/api/player/history`

Requests automatically include the JWT from local storage when present.

## Socket Integration

The client uses a singleton Socket.IO connection from `src/socketClient.ts`.

Important events used by the app include:

- Authentication and room flow: `register_name`, `create_room`, `join_room`, `leave_room`, `start_game`, `next_turn`
- Game flow: `game_started`, `turn_updated`, `word_chosen`, `guess_word`, `game_over`
- Drawing flow: `draw_line`, `erase_stroke`, `clear_canvas`, `request_canvas_sync`, `deliver_canvas_snapshot`
- UI updates: `player_list`, `score_update`, `chat_message`, `name_dict_update`

## Design Notes

- The UI uses a bold, poster-like visual style with strong borders, bright accent colors, and playful typography.
- The game view is responsive and stacks cleanly on smaller screens.
- The app keeps user session state in local storage so refreshes preserve authentication.

## Related Docs

- Root overview: [../README.md](../README.md)
- Backend guide: [../backend/README.md](../backend/README.md)
