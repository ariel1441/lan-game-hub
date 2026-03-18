import { gameService } from '../games/game.service.js';
import type { ServiceResponse } from '../types/common.js';
import { createId } from '../utils/createId.js';
import { createRoomCode } from '../utils/createRoomCode.js';
import { roomStore } from './room.store.js';
import type { Player, PublicRoom, Room } from './room.types.js';

const MAX_NAME_LENGTH = 24;
const MAX_ROOM_CODE_ATTEMPTS = 100;

const normalizePlayerName = (value: string): string => value.trim().replace(/\s+/g, ' ');
const normalizeRoomCode = (value: string): string => value.trim().toUpperCase();

const validatePlayerName = (value: string): string | null => {
  const normalized = normalizePlayerName(value);

  if (!normalized) {
    return 'Player name is required.';
  }

  if (normalized.length > MAX_NAME_LENGTH) {
    return `Player name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  return null;
};

const toPublicRoom = (room: Room): PublicRoom => ({
  code: room.code,
  status: room.status,
  hostPlayerId: room.hostPlayerId,
  createdAt: room.createdAt,
  selectedGameId: room.selectedGameId,
  availableGames: gameService.listAvailableGames(),
  gameSession: room.gameSession
    ? {
      gameId: room.gameSession.gameId,
      startedAt: room.gameSession.startedAt,
      state: gameService.getPublicGameState(room),
    }
    : null,
  players: room.players.map((player) => ({
    id: player.id,
    name: player.name,
    isHost: player.isHost,
    connected: player.connected,
    joinedAt: player.joinedAt,
  })),
});

const createPlayer = (params: { name: string; socketId: string; isHost: boolean }): Player => ({
  id: createId(),
  socketId: params.socketId,
  name: normalizePlayerName(params.name),
  isHost: params.isHost,
  connected: true,
  joinedAt: Date.now(),
});

const createUniqueRoomCode = (): string => {
  for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt += 1) {
    const code = createRoomCode();
    if (!roomStore.getRoom(code)) {
      return code;
    }
  }

  throw new Error('Failed to generate a unique room code.');
};

const getRoomAndMembership = (socketId: string): {
  room: Room;
  membership: { roomCode: string; playerId: string };
} | null => {
  const membership = roomStore.getMembership(socketId);
  if (!membership) {
    return null;
  }

  const room = roomStore.getRoom(membership.roomCode);
  if (!room) {
    roomStore.deleteMembership(socketId);
    return null;
  }

  return { room, membership };
};

export class RoomService {
  createRoom(params: { playerName: string; socketId: string }): ServiceResponse<{
    room: PublicRoom;
    playerId: string;
    roomCode: string;
  }> {
    const nameError = validatePlayerName(params.playerName);
    if (nameError) {
      return { ok: false, error: nameError };
    }

    const hostPlayer = createPlayer({
      name: params.playerName,
      socketId: params.socketId,
      isHost: true,
    });

    const room: Room = {
      id: createId(),
      code: createUniqueRoomCode(),
      hostPlayerId: hostPlayer.id,
      players: [hostPlayer],
      status: 'lobby',
      selectedGameId: null,
      gameSession: null,
      createdAt: Date.now(),
    };

    roomStore.setRoom(room);
    roomStore.setMembership(params.socketId, {
      roomCode: room.code,
      playerId: hostPlayer.id,
    });

    return {
      ok: true,
      data: {
        room: toPublicRoom(room),
        playerId: hostPlayer.id,
        roomCode: room.code,
      },
    };
  }

  joinRoom(params: { roomCode: string; playerName: string; socketId: string }): ServiceResponse<{
    room: PublicRoom;
    playerId: string;
    roomCode: string;
  }> {
    const roomCode = normalizeRoomCode(params.roomCode);
    const room = roomStore.getRoom(roomCode);

    if (!room) {
      return { ok: false, error: 'Room not found.' };
    }

    if (room.status !== 'lobby') {
      return { ok: false, error: 'You can only join a room while it is in the lobby.' };
    }

    const nameError = validatePlayerName(params.playerName);
    if (nameError) {
      return { ok: false, error: nameError };
    }

    const normalizedName = normalizePlayerName(params.playerName);
    const nameExists = room.players.some(
      (player) => player.name.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (nameExists) {
      return { ok: false, error: 'That player name is already taken in this room.' };
    }

    const player = createPlayer({
      name: normalizedName,
      socketId: params.socketId,
      isHost: false,
    });

    room.players.push(player);
    roomStore.setRoom(room);
    roomStore.setMembership(params.socketId, {
      roomCode: room.code,
      playerId: player.id,
    });

    return {
      ok: true,
      data: {
        room: toPublicRoom(room),
        playerId: player.id,
        roomCode: room.code,
      },
    };
  }

  selectGame(params: { socketId: string; gameId: string }): ServiceResponse<{ room: PublicRoom }> {
    const found = getRoomAndMembership(params.socketId);
    if (!found) {
      return { ok: false, error: 'You are not currently in a room.' };
    }

    const { room, membership } = found;
    if (room.hostPlayerId !== membership.playerId) {
      return { ok: false, error: 'Only the host can choose a game.' };
    }

    if (room.status !== 'lobby') {
      return { ok: false, error: 'Games can only be selected from the lobby.' };
    }

    const availableGame = gameService.listAvailableGames().find((game) => game.id === params.gameId);
    if (!availableGame) {
      return { ok: false, error: 'Selected game is not available.' };
    }

    room.selectedGameId = params.gameId;
    roomStore.setRoom(room);
    return { ok: true, data: { room: toPublicRoom(room) } };
  }

  startSelectedGame(params: {
    socketId: string;
    options?: Record<string, unknown>;
  }): ServiceResponse<{ room: PublicRoom }> {
    const found = getRoomAndMembership(params.socketId);
    if (!found) {
      return { ok: false, error: 'You are not currently in a room.' };
    }

    const { room, membership } = found;
    if (room.hostPlayerId !== membership.playerId) {
      return { ok: false, error: 'Only the host can start the game.' };
    }

    if (room.status !== 'lobby') {
      return { ok: false, error: 'A game is already in progress.' };
    }

    if (!room.selectedGameId) {
      return { ok: false, error: 'Select a game before starting.' };
    }

    const startResult = gameService.startGame({
      room,
      gameId: room.selectedGameId,
      options: params.options,
    });

    if (!startResult.ok) {
      return { ok: false, error: startResult.error };
    }

    roomStore.setRoom(startResult.room);
    return { ok: true, data: { room: toPublicRoom(startResult.room) } };
  }

  returnToLobby(params: { socketId: string }): ServiceResponse<{ room: PublicRoom }> {
    const found = getRoomAndMembership(params.socketId);
    if (!found) {
      return { ok: false, error: 'You are not currently in a room.' };
    }

    const { room, membership } = found;
    if (room.hostPlayerId !== membership.playerId) {
      return { ok: false, error: 'Only the host can return to the lobby.' };
    }

    room.status = 'lobby';
    room.gameSession = null;
    roomStore.setRoom(room);
    return { ok: true, data: { room: toPublicRoom(room) } };
  }

  handleGameAction(params: {
    socketId: string;
    action: { type: string; payload?: unknown };
  }): ServiceResponse<{ room: PublicRoom }> {
    const found = getRoomAndMembership(params.socketId);
    if (!found) {
      return { ok: false, error: 'You are not currently in a room.' };
    }

    const { room, membership } = found;
    const actionResult = gameService.handleGameAction({
      room,
      playerId: membership.playerId,
      action: params.action,
    });

    if (!actionResult.ok) {
      return { ok: false, error: actionResult.error };
    }

    roomStore.setRoom(actionResult.room);
    return { ok: true, data: { room: toPublicRoom(actionResult.room) } };
  }

  leaveRoomBySocketId(socketId: string):
    | { kind: 'not_found' }
    | { kind: 'room_closed'; roomCode: string; reason: string }
    | { kind: 'room_updated'; room: PublicRoom; roomCode: string } {
    const membership = roomStore.getMembership(socketId);
    if (!membership) {
      return { kind: 'not_found' };
    }

    const room = roomStore.getRoom(membership.roomCode);
    if (!room) {
      roomStore.deleteMembership(socketId);
      return { kind: 'not_found' };
    }

    const leavingPlayer = room.players.find((player) => player.socketId === socketId);
    room.players = room.players.filter((player) => player.socketId !== socketId);
    roomStore.deleteMembership(socketId);

    if (!leavingPlayer) {
      roomStore.setRoom(room);
      return { kind: 'room_updated', room: toPublicRoom(room), roomCode: room.code };
    }

    if (leavingPlayer.isHost) {
      roomStore.deleteRoom(room.code);
      return {
        kind: 'room_closed',
        roomCode: room.code,
        reason: 'The host left the room.',
      };
    }

    if (room.players.length === 0) {
      roomStore.deleteRoom(room.code);
      return {
        kind: 'room_closed',
        roomCode: room.code,
        reason: 'The room is now empty.',
      };
    }

    if (room.status === 'in_game') {
      room.status = 'lobby';
      room.selectedGameId = null;
      room.gameSession = null;
    }

    roomStore.setRoom(room);
    return {
      kind: 'room_updated',
      room: toPublicRoom(room),
      roomCode: room.code,
    };
  }
}

export const roomService = new RoomService();
