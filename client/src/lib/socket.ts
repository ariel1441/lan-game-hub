import { io, type Socket } from 'socket.io-client';
import type { PublicRoom } from '../types/room';

export type ServerToClientEvents = {
  'room:updated': (payload: { room: PublicRoom; you: { playerId: string; isHost: boolean } }) => void;
  'room:closed': (payload: { reason: string }) => void;
  'error:event': (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  'room:create': (
    payload: { playerName: string },
    callback: (response: { ok: true; room: PublicRoom; playerId: string; roomCode: string } | { ok: false; error: string }) => void,
  ) => void;
  'room:join': (
    payload: { roomCode: string; playerName: string },
    callback: (response: { ok: true; room: PublicRoom; playerId: string; roomCode: string } | { ok: false; error: string }) => void,
  ) => void;
  'room:leave': (
    payload: undefined,
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'room:select-game': (
    payload: { gameId: string },
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'room:start-game': (
    payload: { options?: Record<string, unknown> },
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'room:return-to-lobby': (
    payload: undefined,
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'game:action': (
    payload: { action: { type: string; payload?: unknown } },
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
};

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const resolveSocketUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(resolveSocketUrl(), {
    transports: ['websocket'],
    autoConnect: true,
  });

  return socketInstance;
};
