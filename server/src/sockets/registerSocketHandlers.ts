import type { Server } from 'socket.io';
import { roomStore } from '../rooms/room.store.js';
import { roomService } from '../rooms/room.service.js';
import type { PublicRoom } from '../rooms/room.types.js';
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types.js';

const emitRoomUpdated = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  room: PublicRoom,
): void => {
  for (const player of room.players) {
    const socketId = roomStore
      .getRoom(room.code)
      ?.players.find((roomPlayer) => roomPlayer.id === player.id)
      ?.socketId;

    if (!socketId) {
      continue;
    }

    io.to(socketId).emit('room:updated', {
      room,
      you: {
        playerId: player.id,
        isHost: player.isHost,
      },
    });
  }
};

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>): void => {
  io.on('connection', (socket) => {
    socket.on('room:create', (payload, callback) => {
      const result = roomService.createRoom({
        playerName: payload.playerName,
        socketId: socket.id,
      });

      if (!result.ok) {
        callback({ ok: false, error: result.error });
        return;
      }

      socket.join(result.data.roomCode);
      emitRoomUpdated(io, result.data.room);

      callback({
        ok: true,
        room: result.data.room,
        playerId: result.data.playerId,
        roomCode: result.data.roomCode,
      });
    });

    socket.on('room:join', (payload, callback) => {
      const result = roomService.joinRoom({
        roomCode: payload.roomCode,
        playerName: payload.playerName,
        socketId: socket.id,
      });

      if (!result.ok) {
        callback({ ok: false, error: result.error });
        return;
      }

      socket.join(result.data.roomCode);
      emitRoomUpdated(io, result.data.room);

      callback({
        ok: true,
        room: result.data.room,
        playerId: result.data.playerId,
        roomCode: result.data.roomCode,
      });
    });

    socket.on('room:leave', (_payload, callback) => {
      const result = roomService.leaveRoomBySocketId(socket.id);

      if (result.kind === 'not_found') {
        callback?.({ ok: false, error: 'You are not currently in a room.' });
        return;
      }

      if (result.kind === 'room_closed') {
        io.to(result.roomCode).emit('room:closed', { reason: result.reason });
        callback?.({ ok: true });
        return;
      }

      emitRoomUpdated(io, result.room);
      callback?.({ ok: true });
    });

    socket.on('room:select-game', (payload, callback) => {
      const result = roomService.selectGame({
        socketId: socket.id,
        gameId: payload.gameId,
      });

      if (!result.ok) {
        callback?.({ ok: false, error: result.error });
        return;
      }

      emitRoomUpdated(io, result.data.room);
      callback?.({ ok: true });
    });

    socket.on('room:start-game', (payload, callback) => {
      const result = roomService.startSelectedGame({
        socketId: socket.id,
        options: payload.options,
      });

      if (!result.ok) {
        callback?.({ ok: false, error: result.error });
        return;
      }

      emitRoomUpdated(io, result.data.room);
      callback?.({ ok: true });
    });

    socket.on('room:return-to-lobby', (_payload, callback) => {
      const result = roomService.returnToLobby({ socketId: socket.id });

      if (!result.ok) {
        callback?.({ ok: false, error: result.error });
        return;
      }

      emitRoomUpdated(io, result.data.room);
      callback?.({ ok: true });
    });

    socket.on('game:action', (payload, callback) => {
      const result = roomService.handleGameAction({
        socketId: socket.id,
        action: payload.action,
      });

      if (!result.ok) {
        callback?.({ ok: false, error: result.error });
        return;
      }

      emitRoomUpdated(io, result.data.room);
      callback?.({ ok: true });
    });

    socket.on('disconnect', () => {
      const result = roomService.leaveRoomBySocketId(socket.id);

      if (result.kind === 'room_closed') {
        io.to(result.roomCode).emit('room:closed', { reason: result.reason });
        return;
      }

      if (result.kind === 'room_updated') {
        emitRoomUpdated(io, result.room);
      }
    });
  });
};
