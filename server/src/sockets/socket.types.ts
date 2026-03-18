import type { PublicRoom } from '../rooms/room.types.js';

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
    _payload: undefined,
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
    _payload: undefined,
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
  'game:action': (
    payload: { action: { type: string; payload?: unknown } },
    callback?: (response: { ok: true } | { ok: false; error: string }) => void,
  ) => void;
};

export type ServerToClientEvents = {
  'room:updated': (payload: { room: PublicRoom; you: { playerId: string; isHost: boolean } }) => void;
  'room:closed': (payload: { reason: string }) => void;
  'error:event': (payload: { message: string }) => void;
};
