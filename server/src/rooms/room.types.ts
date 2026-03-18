import type { GameDefinition } from '../games/game.types.js';

export type RoomStatus = 'lobby' | 'in_game';

export type Player = {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
};

export type GameSession = {
  gameId: string;
  state: unknown;
  startedAt: number;
};

export type Room = {
  id: string;
  code: string;
  hostPlayerId: string;
  players: Player[];
  status: RoomStatus;
  selectedGameId: string | null;
  gameSession: GameSession | null;
  createdAt: number;
};

export type PublicPlayer = Pick<Player, 'id' | 'name' | 'isHost' | 'connected' | 'joinedAt'>;

export type PublicGameSession = {
  gameId: string;
  state: unknown;
  startedAt: number;
};

export type PublicRoom = {
  code: string;
  status: RoomStatus;
  hostPlayerId: string;
  players: PublicPlayer[];
  createdAt: number;
  selectedGameId: string | null;
  availableGames: GameDefinition[];
  gameSession: PublicGameSession | null;
};

export type RoomMembership = {
  roomCode: string;
  playerId: string;
};
