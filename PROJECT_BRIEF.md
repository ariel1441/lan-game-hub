# LAN Game Hub - Project Brief

## What This Project Is

LAN Game Hub is a local-network multiplayer game platform.

It is not a single-game app. It is a reusable room/lobby/game-session system where:

- one player hosts a room
- other players join from their own devices
- the host selects a game
- all clients stay synchronized in real time
- the backend is the source of truth

Current first game: `Connect 4`

Long-term direction: multiple game types that all run inside the same room infrastructure.

## Product Rules

- Build for LAN first
- Keep the architecture multigame-first
- Do not leak Connect 4 logic into shared room/game infrastructure
- Backend owns validation, turns, rules, win conditions, and authoritative state
- Frontend should render state and send user actions only

## Current Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- Socket.IO
- TypeScript

### State

- in-memory only
- no database yet
- no auth yet

## Current Architecture

### Shared backend game system

- `server/src/games/game.types.ts`
- `server/src/games/game.registry.ts`
- `server/src/games/game.service.ts`

Each game should implement:

- metadata
- `createInitialState`
- optional `canStart`
- `handleAction`
- `getPublicState`

### Shared frontend game system

- `client/src/components/games/GameShell.tsx`
- room page switches into the active game renderer by `gameId`

### Current game module

Backend:

- `server/src/games/connect4/`

Frontend:

- `client/src/components/games/connect4/`

## Current Status

- room create/join works
- lobby sync works
- host can select and start a game
- Connect 4 exists as the reference implementation
- replay / return to lobby flow exists

## Important Constraints For Future Chats

When adding a new game:

- keep it isolated in its own backend/frontend module
- do not hardcode game-specific rules into room service or socket handlers
- preserve generic `room -> selectedGameId -> gameSession` flow
- preserve backend authority
- preserve frontend rendering by `gameId`

## Development Commands

From repo root:

```bash
npm install
npm run dev
npm run lint
npm run build
```

LAN example:

- frontend: `http://<host-ip>:5173`
- backend/socket: `http://<host-ip>:3001`

## Recommended Next Games

See:

- [LAN_Game_Hub_Game_Ideas.md](./LAN_Game_Hub_Game_Ideas.md)

Recommended validation order:

1. `Would You Rather`
2. `Imposter`
3. `Trivia`

Reason:

- they validate different interaction models than Connect 4

