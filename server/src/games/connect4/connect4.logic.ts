import type { Connect4Chip, Connect4State, Connect4WinningCell } from './connect4.types.js';

export const CONNECT4_ROWS = 6;
export const CONNECT4_COLUMNS = 7;

export const createEmptyBoard = (): Connect4Chip[][] => {
  return Array.from({ length: CONNECT4_ROWS }, () => Array.from({ length: CONNECT4_COLUMNS }, () => null));
};

const getPlayerChip = (playerIds: [string, string], playerId: string): Connect4Chip => {
  if (playerIds[0] === playerId) {
    return 'R';
  }

  if (playerIds[1] === playerId) {
    return 'Y';
  }

  return null;
};

export const createInitialConnect4State = (playerIds: [string, string]): Connect4State => ({
  phase: 'playing',
  board: createEmptyBoard(),
  playerIds,
  currentTurnPlayerId: playerIds[0],
  startingPlayerId: playerIds[0],
  winnerPlayerId: null,
  isDraw: false,
  winningCells: [],
  scores: {
    [playerIds[0]]: 0,
    [playerIds[1]]: 0,
  },
  roundNumber: 1,
  moveCount: 0,
});

export const dropPiece = (
  board: Connect4Chip[][],
  column: number,
  chip: Exclude<Connect4Chip, null>,
): { board: Connect4Chip[][]; row: number } | null => {
  if (column < 0 || column >= CONNECT4_COLUMNS) {
    return null;
  }

  for (let row = CONNECT4_ROWS - 1; row >= 0; row -= 1) {
    if (board[row][column] === null) {
      const nextBoard = board.map((currentRow) => [...currentRow]);
      nextBoard[row][column] = chip;
      return { board: nextBoard, row };
    }
  }

  return null;
};

const directions = [
  { rowDelta: 0, colDelta: 1 },
  { rowDelta: 1, colDelta: 0 },
  { rowDelta: 1, colDelta: 1 },
  { rowDelta: 1, colDelta: -1 },
];

const collectDirectionCells = (
  board: Connect4Chip[][],
  startRow: number,
  startCol: number,
  chip: Exclude<Connect4Chip, null>,
  rowDelta: number,
  colDelta: number,
): Connect4WinningCell[] => {
  const cells: Connect4WinningCell[] = [];
  let row = startRow + rowDelta;
  let col = startCol + colDelta;

  while (
    row >= 0
    && row < CONNECT4_ROWS
    && col >= 0
    && col < CONNECT4_COLUMNS
    && board[row][col] === chip
  ) {
    cells.push({ row, col });
    row += rowDelta;
    col += colDelta;
  }

  return cells;
};

export const findWinningCells = (
  board: Connect4Chip[][],
  row: number,
  col: number,
  chip: Exclude<Connect4Chip, null>,
): Connect4WinningCell[] => {
  for (const direction of directions) {
    const backward = collectDirectionCells(
      board,
      row,
      col,
      chip,
      -direction.rowDelta,
      -direction.colDelta,
    );
    const forward = collectDirectionCells(
      board,
      row,
      col,
      chip,
      direction.rowDelta,
      direction.colDelta,
    );

    const cells = [...backward.reverse(), { row, col }, ...forward];
    if (cells.length >= 4) {
      return cells;
    }
  }

  return [];
};

export const isBoardFull = (board: Connect4Chip[][]): boolean => {
  return board.every((row) => row.every((cell) => cell !== null));
};

export const createNextRoundState = (state: Connect4State): Connect4State => {
  const nextStartingPlayerId = state.startingPlayerId === state.playerIds[0]
    ? state.playerIds[1]
    : state.playerIds[0];

  return {
    ...state,
    phase: 'playing',
    board: createEmptyBoard(),
    currentTurnPlayerId: nextStartingPlayerId,
    startingPlayerId: nextStartingPlayerId,
    winnerPlayerId: null,
    isDraw: false,
    winningCells: [],
    roundNumber: state.roundNumber + 1,
    moveCount: 0,
  };
};

export const getChipForPlayer = (playerIds: [string, string], playerId: string): Exclude<Connect4Chip, null> | null => {
  return getPlayerChip(playerIds, playerId);
};
