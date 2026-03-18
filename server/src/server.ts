import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { registerSocketHandlers } from './sockets/registerSocketHandlers.js';
import type { ClientToServerEvents, ServerToClientEvents } from './sockets/socket.types.js';

const app = createApp();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true,
  },
});

registerSocketHandlers(io);

httpServer.listen(env.port, '0.0.0.0', () => {
  console.log(`LAN Game Hub server listening on http://0.0.0.0:${env.port}`);
});
