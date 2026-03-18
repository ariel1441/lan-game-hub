export type PublicPlayer = {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
};

export type GameSummary = {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
};

export type Connect4Cell = null | 'R' | 'Y';

export type Connect4State = {
  phase: 'playing' | 'finished';
  board: Connect4Cell[][];
  playerIds: [string, string];
  currentTurnPlayerId: string;
  startingPlayerId: string;
  winnerPlayerId: string | null;
  isDraw: boolean;
  winningCells: { row: number; col: number }[];
  scores: Record<string, number>;
  roundNumber: number;
  moveCount: number;
};

export type PublicGameSession = {
  gameId: string;
  startedAt: number;
  state: unknown;
};

export type PublicRoom = {
  code: string;
  status: 'lobby' | 'in_game';
  hostPlayerId: string;
  players: PublicPlayer[];
  createdAt: number;
  selectedGameId: string | null;
  availableGames: GameSummary[];
  gameSession: PublicGameSession | null;
};

export type RoomViewState = {
  room: PublicRoom | null;
  currentPlayerId: string | null;
  isHost: boolean;
  error: string | null;
  roomClosedReason: string | null;
};
