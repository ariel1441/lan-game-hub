import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getSocket } from '../lib/socket';
import type { PublicRoom, RoomViewState } from '../types/room';

type CreateRoomResult =
  | { ok: true; roomCode: string }
  | { ok: false; error: string };

type OperationResult =
  | { ok: true }
  | { ok: false; error: string };

type RoomContextValue = RoomViewState & {
  createRoom: (playerName: string) => Promise<CreateRoomResult>;
  joinRoom: (roomCode: string, playerName: string) => Promise<CreateRoomResult>;
  leaveRoom: () => Promise<void>;
  selectGame: (gameId: string) => Promise<OperationResult>;
  startGame: (options?: Record<string, unknown>) => Promise<OperationResult>;
  returnToLobby: () => Promise<OperationResult>;
  sendGameAction: (action: { type: string; payload?: unknown }) => Promise<OperationResult>;
  clearRoomClosedReason: () => void;
  clearError: () => void;
};

const initialState: RoomViewState = {
  room: null,
  currentPlayerId: null,
  isHost: false,
  error: null,
  roomClosedReason: null,
};

export const RoomContext = createContext<RoomContextValue | null>(null);

const toErrorResult = (message: string): OperationResult => ({ ok: false, error: message });
const toSuccessResult = (): OperationResult => ({ ok: true });

export const RoomProvider = ({ children }: PropsWithChildren) => {
  const socket = useMemo(() => getSocket(), []);
  const [state, setState] = useState<RoomViewState>(initialState);

  useEffect(() => {
    const handleRoomUpdated = (payload: { room: PublicRoom; you: { playerId: string; isHost: boolean } }) => {
      setState((current) => ({
        ...current,
        room: payload.room,
        currentPlayerId: payload.you.playerId,
        isHost: payload.you.isHost,
        error: null,
        roomClosedReason: null,
      }));
    };

    const handleRoomClosed = (payload: { reason: string }) => {
      setState((current) => ({
        ...current,
        room: null,
        currentPlayerId: null,
        isHost: false,
        roomClosedReason: payload.reason,
      }));
    };

    const handleError = (payload: { message: string }) => {
      setState((current) => ({
        ...current,
        error: payload.message,
      }));
    };

    socket.on('room:updated', handleRoomUpdated);
    socket.on('room:closed', handleRoomClosed);
    socket.on('error:event', handleError);

    return () => {
      socket.off('room:updated', handleRoomUpdated);
      socket.off('room:closed', handleRoomClosed);
      socket.off('error:event', handleError);
    };
  }, [socket]);

  const createRoom = async (playerName: string): Promise<CreateRoomResult> => {
    return await new Promise((resolve) => {
      socket.emit('room:create', { playerName }, (response) => {
        if (!response.ok) {
          setState((current) => ({ ...current, error: response.error }));
          resolve({ ok: false, error: response.error });
          return;
        }

        setState({
          room: response.room,
          currentPlayerId: response.playerId,
          isHost: true,
          error: null,
          roomClosedReason: null,
        });

        resolve({ ok: true, roomCode: response.roomCode });
      });
    });
  };

  const joinRoom = async (roomCode: string, playerName: string): Promise<CreateRoomResult> => {
    return await new Promise((resolve) => {
      socket.emit('room:join', { roomCode, playerName }, (response) => {
        if (!response.ok) {
          setState((current) => ({ ...current, error: response.error }));
          resolve({ ok: false, error: response.error });
          return;
        }

        setState({
          room: response.room,
          currentPlayerId: response.playerId,
          isHost: false,
          error: null,
          roomClosedReason: null,
        });

        resolve({ ok: true, roomCode: response.roomCode });
      });
    });
  };

  const runSimpleOperation = async (
    emitter: (callback: (response: { ok: true } | { ok: false; error: string }) => void) => void,
  ): Promise<OperationResult> => {
    return await new Promise((resolve) => {
      emitter((response) => {
        if (!response.ok) {
          setState((current) => ({ ...current, error: response.error }));
          resolve(toErrorResult(response.error));
          return;
        }

        resolve(toSuccessResult());
      });
    });
  };

  const leaveRoom = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      socket.emit('room:leave', undefined, () => {
        resolve();
      });
    });

    setState(initialState);
  };

  const selectGame = async (gameId: string): Promise<OperationResult> => {
    return runSimpleOperation((callback) => {
      socket.emit('room:select-game', { gameId }, callback);
    });
  };

  const startGame = async (options?: Record<string, unknown>): Promise<OperationResult> => {
    return runSimpleOperation((callback) => {
      socket.emit('room:start-game', { options }, callback);
    });
  };

  const returnToLobby = async (): Promise<OperationResult> => {
    return runSimpleOperation((callback) => {
      socket.emit('room:return-to-lobby', undefined, callback);
    });
  };

  const sendGameAction = async (action: { type: string; payload?: unknown }): Promise<OperationResult> => {
    return runSimpleOperation((callback) => {
      socket.emit('game:action', { action }, callback);
    });
  };

  const value: RoomContextValue = {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    selectGame,
    startGame,
    returnToLobby,
    sendGameAction,
    clearRoomClosedReason: () => {
      setState((current) => ({ ...current, roomClosedReason: null }));
    },
    clearError: () => {
      setState((current) => ({ ...current, error: null }));
    },
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
