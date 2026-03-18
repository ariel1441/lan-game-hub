# LAN Game Hub - V1 Lobby Foundation

This project is the lobby foundation for a LAN multiplayer game platform.

Current scope:
- host creates a room
- players join by code
- live player list via Socket.IO
- host / player roles
- leave and disconnect handling
- room closes when host disconnects

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS v4
- Backend: Node.js + Express + Socket.IO + TypeScript
- Storage: in-memory only

## Project structure
- `server/` real-time backend and room state
- `client/` browser UI

## Development
From the root:

```bash
npm install
npm run dev
```

That starts:
- backend on `http://0.0.0.0:3001`
- frontend on `http://0.0.0.0:5173`

## LAN testing
Only one machine runs the project.
Other devices on the same network open the frontend URL in the browser.

Example:
- host machine IP: `192.168.1.50`
- frontend: `http://192.168.1.50:5173`
- backend socket URL auto-resolves to `http://192.168.1.50:3001`

## Notes
- V1 intentionally has no reconnect recovery.
- If the host disconnects, the room closes.
- If a player disconnects, they are removed from the room.
- The next step after this foundation is adding a game registry and Connect 4.
