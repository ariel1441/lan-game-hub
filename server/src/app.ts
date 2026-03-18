import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin === '*' ? true : env.clientOrigin,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'lan-game-hub-server' });
  });

  return app;
};
