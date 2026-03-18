# LAN Game Hub

LAN Game Hub is a local-network multiplayer game platform.

It is not a single-game app. The goal is to provide:

- one reusable room/lobby system
- one active game session per room
- realtime synchronization over LAN
- a modular architecture for adding very different kinds of games

Current first game: `Connect 4`

Long-term goal: support board games, social games, hidden-role games, trivia, and lightweight hybrid party games inside the same shared infrastructure.

## Core Product Flow

1. One player hosts a room
2. A short room code is generated
3. Other players join from devices on the same local network
4. Everyone enters a shared live lobby
5. The host selects a game
6. The room switches into the active game session
7. The backend remains the source of truth for game state and validation

## Non-Negotiable Architecture Rules

- Build for LAN first
- Keep the architecture multigame-first
- Do not leak Connect 4-specific assumptions into shared systems
- Backend owns turns, validation, win conditions, scoring, and transitions
- Frontend renders state and sends user intent

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

## Current Project Structure

- `server/` realtime backend, room state, game registry, game modules
- `client/` browser UI, lobby screens, game shell, game renderers

## Current Status

- room creation works
- room joining works
- live lobby sync works
- host can select and start a game
- Connect 4 is implemented as the first reference game
- replay and return-to-lobby flow exists

## Development

From the repo root:

```bash
npm install
npm run dev
```

That starts:

- backend on `http://0.0.0.0:3001`
- frontend on `http://0.0.0.0:5173`

Other useful commands:

```bash
npm run lint
npm run build
```

## LAN Usage

Only one machine runs the project.
Other devices on the same network open the host machine's LAN IP in the browser.

Example:

- host machine IP: `192.168.1.50`
- frontend: `http://192.168.1.50:5173`
- backend/socket URL auto-resolves to `http://192.168.1.50:3001`

## Important Docs

Top-level docs:

- [FUTURE_GAMES_FOUNDATION.md](./FUTURE_GAMES_FOUNDATION.md) - main rules and guardrails for adding future games

Supporting docs:

- [docs/README.md](./docs/README.md) - documentation index
- [docs/PROJECT_BRIEF.md](./docs/PROJECT_BRIEF.md) - compact project summary for future chats or tools
- [docs/NEW_GAME_WORKFLOW.md](./docs/NEW_GAME_WORKFLOW.md) - practical flow for designing and integrating new games
- [docs/GAME_DESIGN_CHECKLIST.md](./docs/GAME_DESIGN_CHECKLIST.md) - required design checklist before implementation
- [docs/GAME_IMPLEMENTATION_TEMPLATE.md](./docs/GAME_IMPLEMENTATION_TEMPLATE.md) - implementation skeleton for new games
- [docs/LAN_Game_Hub_Game_Ideas.md](./docs/LAN_Game_Hub_Game_Ideas.md) - game ideas and suggested order
- [docs/PROMPTS_FOR_PHONE.md](./docs/PROMPTS_FOR_PHONE.md) - reusable prompts for phone workflows

## Notes

- current system is LAN-first, not internet-first
- reconnect behavior is still limited
- if the host disconnects, the room closes
- future games should validate the architecture by being structurally different from Connect 4
