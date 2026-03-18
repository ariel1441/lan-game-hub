export type Connect4Chip = null | 'R' | 'Y';

export type Connect4WinningCell = {
  row: number;
  col: number;
};

export type Connect4State = {
  phase: 'playing' | 'finished';
  board: Connect4Chip[][];
  playerIds: [string, string];
  currentTurnPlayerId: string;
  startingPlayerId: string;
  winnerPlayerId: string | null;
  isDraw: boolean;
  winningCells: Connect4WinningCell[];
  scores: Record<string, number>;
  roundNumber: number;
  moveCount: number;
};

export type Connect4Action =
  | { type: 'DROP_PIECE'; payload: { column: number } }
  | { type: 'PLAY_AGAIN' };
