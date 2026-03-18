import type {
  CheckersBoard,
  CheckersMove,
  CheckersPiece,
  CheckersPieceColor,
  CheckersPosition,
  CheckersState,
} from './checkers.types.js';

export const CHECKERS_SIZE = 8;
const DRAW_WITHOUT_PROGRESS_TURNS = 80;

const directionForColor: Record<CheckersPieceColor, number> = {
  red: -1,
  black: 1,
};

const cloneBoard = (board: CheckersBoard): CheckersBoard => board.map((row) => [...row]);

export const isPlayableSquare = (row: number, col: number): boolean => (row + col) % 2 === 1;

const inBounds = (row: number, col: number): boolean => row >= 0 && row < CHECKERS_SIZE && col >= 0 && col < CHECKERS_SIZE;

export const createInitialCheckersBoard = (): CheckersBoard => {
  const board: CheckersBoard = Array.from({ length: CHECKERS_SIZE }, () => Array.from({ length: CHECKERS_SIZE }, () => null));

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < CHECKERS_SIZE; col += 1) {
      if (isPlayableSquare(row, col)) {
        board[row][col] = { color: 'black', kind: 'man' };
      }
    }
  }

  for (let row = 5; row < CHECKERS_SIZE; row += 1) {
    for (let col = 0; col < CHECKERS_SIZE; col += 1) {
      if (isPlayableSquare(row, col)) {
        board[row][col] = { color: 'red', kind: 'man' };
      }
    }
  }

  return board;
};

const getPieceDirections = (piece: CheckersPiece): number[] => {
  if (piece.kind === 'king') {
    return [-1, 1];
  }

  return [directionForColor[piece.color]];
};

export const getPieceColorForPlayer = (playerIds: [string, string], playerId: string): CheckersPieceColor | null => {
  if (playerIds[0] === playerId) {
    return 'red';
  }

  if (playerIds[1] === playerId) {
    return 'black';
  }

  return null;
};

const shouldPromote = (piece: CheckersPiece, row: number): boolean => (
  piece.kind === 'man' && ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === CHECKERS_SIZE - 1))
);

const serializePath = (path: CheckersPosition[]): string => path.map((position) => `${position.row},${position.col}`).join('>');

type ExploreResult = {
  path: CheckersPosition[];
  captured: CheckersPosition[];
  board: CheckersBoard;
  piece: CheckersPiece;
  stoppedByPromotion: boolean;
};

const exploreCaptures = (
  board: CheckersBoard,
  position: CheckersPosition,
  piece: CheckersPiece,
  path: CheckersPosition[],
  captured: CheckersPosition[],
  seen: Set<string>,
): ExploreResult[] => {
  const results: ExploreResult[] = [];
  let foundCapture = false;

  for (const rowStep of getPieceDirections(piece)) {
    for (const colStep of [-1, 1]) {
      const middleRow = position.row + rowStep;
      const middleCol = position.col + colStep;
      const landingRow = position.row + rowStep * 2;
      const landingCol = position.col + colStep * 2;

      if (!inBounds(middleRow, middleCol) || !inBounds(landingRow, landingCol) || !isPlayableSquare(landingRow, landingCol)) {
        continue;
      }

      const middlePiece = board[middleRow][middleCol];
      if (!middlePiece || middlePiece.color === piece.color || board[landingRow][landingCol] !== null) {
        continue;
      }

      foundCapture = true;
      const nextBoard = cloneBoard(board);
      nextBoard[position.row][position.col] = null;
      nextBoard[middleRow][middleCol] = null;

      const nextPiece: CheckersPiece = shouldPromote(piece, landingRow)
        ? { ...piece, kind: 'king' }
        : piece;

      nextBoard[landingRow][landingCol] = nextPiece;

      const nextPath = [...path, { row: landingRow, col: landingCol }];
      const nextCaptured = [...captured, { row: middleRow, col: middleCol }];
      const key = serializePath(nextPath);
      if (seen.has(key)) {
        continue;
      }

      const nextSeen = new Set(seen);
      nextSeen.add(key);

      const promotedThisStep = piece.kind === 'man' && nextPiece.kind === 'king';
      if (promotedThisStep) {
        results.push({
          path: nextPath,
          captured: nextCaptured,
          board: nextBoard,
          piece: nextPiece,
          stoppedByPromotion: true,
        });
        continue;
      }

      const branches = exploreCaptures(
        nextBoard,
        { row: landingRow, col: landingCol },
        nextPiece,
        nextPath,
        nextCaptured,
        nextSeen,
      );

      if (branches.length === 0) {
        results.push({
          path: nextPath,
          captured: nextCaptured,
          board: nextBoard,
          piece: nextPiece,
          stoppedByPromotion: false,
        });
      } else {
        results.push(...branches);
      }
    }
  }

  return foundCapture ? results : [];
};

const getSimpleMovesForPiece = (board: CheckersBoard, row: number, col: number, piece: CheckersPiece): CheckersMove[] => {
  const moves: CheckersMove[] = [];

  for (const rowStep of getPieceDirections(piece)) {
    for (const colStep of [-1, 1]) {
      const targetRow = row + rowStep;
      const targetCol = col + colStep;

      if (!inBounds(targetRow, targetCol) || !isPlayableSquare(targetRow, targetCol) || board[targetRow][targetCol] !== null) {
        continue;
      }

      moves.push({
        path: [{ row, col }, { row: targetRow, col: targetCol }],
        captured: [],
        promotes: shouldPromote(piece, targetRow),
      });
    }
  }

  return moves;
};

const getCaptureMovesForPiece = (board: CheckersBoard, row: number, col: number, piece: CheckersPiece): CheckersMove[] => {
  return exploreCaptures(
    board,
    { row, col },
    piece,
    [{ row, col }],
    [],
    new Set([serializePath([{ row, col }])]),
  ).map((result) => ({
    path: result.path,
    captured: result.captured,
    promotes: result.stoppedByPromotion || result.piece.kind === 'king' && piece.kind === 'man',
  }));
};

export const getLegalMovesForPiece = (board: CheckersBoard, row: number, col: number): CheckersMove[] => {
  const piece = board[row][col];
  if (!piece) {
    return [];
  }

  const captureMoves = getCaptureMovesForPiece(board, row, col, piece);
  if (captureMoves.length > 0) {
    return captureMoves;
  }

  return getSimpleMovesForPiece(board, row, col, piece);
};

export const getLegalMovesForColor = (board: CheckersBoard, color: CheckersPieceColor): CheckersMove[] => {
  const captureMoves: CheckersMove[] = [];
  const simpleMoves: CheckersMove[] = [];

  for (let row = 0; row < CHECKERS_SIZE; row += 1) {
    for (let col = 0; col < CHECKERS_SIZE; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) {
        continue;
      }

      const moves = getLegalMovesForPiece(board, row, col);
      for (const move of moves) {
        if (move.captured.length > 0) {
          captureMoves.push(move);
        } else {
          simpleMoves.push(move);
        }
      }
    }
  }

  return captureMoves.length > 0 ? captureMoves : simpleMoves;
};

const positionsEqual = (left: CheckersPosition, right: CheckersPosition): boolean => left.row === right.row && left.col === right.col;

export const findMoveByPath = (moves: CheckersMove[], path: CheckersPosition[]): CheckersMove | null => {
  return moves.find(
    (move) =>
      move.path.length === path.length
      && move.path.every((position, index) => positionsEqual(position, path[index])),
  ) ?? null;
};

export const applyMove = (board: CheckersBoard, move: CheckersMove): CheckersBoard => {
  const nextBoard = cloneBoard(board);
  const from = move.path[0];
  const to = move.path[move.path.length - 1];
  const piece = nextBoard[from.row][from.col];

  if (!piece) {
    throw new Error('Cannot apply a move without a piece.');
  }

  nextBoard[from.row][from.col] = null;
  for (const captured of move.captured) {
    nextBoard[captured.row][captured.col] = null;
  }

  nextBoard[to.row][to.col] = shouldPromote(piece, to.row)
    ? { ...piece, kind: 'king' }
    : piece;

  return nextBoard;
};

export const countPiecesForColor = (board: CheckersBoard, color: CheckersPieceColor): number => {
  return board.reduce(
    (count, row) => count + row.filter((cell) => cell?.color === color).length,
    0,
  );
};

export const createInitialCheckersState = (playerIds: [string, string]): CheckersState => ({
  phase: 'playing',
  board: createInitialCheckersBoard(),
  playerIds,
  currentTurnPlayerId: playerIds[0],
  startingPlayerId: playerIds[0],
  winnerPlayerId: null,
  result: null,
  scores: {
    [playerIds[0]]: 0,
    [playerIds[1]]: 0,
  },
  roundNumber: 1,
  lastMove: null,
  movesSinceProgress: 0,
});

export const createNextCheckersRound = (state: CheckersState): CheckersState => {
  const nextStartingPlayerId = state.startingPlayerId === state.playerIds[0]
    ? state.playerIds[1]
    : state.playerIds[0];

  return {
    ...createInitialCheckersState(state.playerIds),
    currentTurnPlayerId: nextStartingPlayerId,
    startingPlayerId: nextStartingPlayerId,
    scores: state.scores,
    roundNumber: state.roundNumber + 1,
  };
};

export const getRoundOutcome = (
  board: CheckersBoard,
  nextTurnPlayerId: string,
  playerIds: [string, string],
  currentPlayerId: string,
): { winnerPlayerId: string | null; result: 'win' | 'draw' | null } => {
  const nextColor = getPieceColorForPlayer(playerIds, nextTurnPlayerId);
  if (!nextColor) {
    return { winnerPlayerId: null, result: null };
  }

  const nextPlayerPieceCount = countPiecesForColor(board, nextColor);
  if (nextPlayerPieceCount === 0 || getLegalMovesForColor(board, nextColor).length === 0) {
    return {
      winnerPlayerId: currentPlayerId,
      result: 'win',
    };
  }

  return { winnerPlayerId: null, result: null };
};

export const isDrawByNoProgress = (movesSinceProgress: number): boolean => movesSinceProgress >= DRAW_WITHOUT_PROGRESS_TURNS;
