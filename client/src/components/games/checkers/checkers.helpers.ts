import type {
  CheckersCell,
  CheckersMove,
  CheckersPiece,
  CheckersPieceColor,
  CheckersPosition,
} from '../../../types/room';

const CHECKERS_SIZE = 8;

const directionForColor: Record<CheckersPieceColor, number> = {
  red: -1,
  black: 1,
};

const cloneBoard = (board: CheckersCell[][]): CheckersCell[][] => board.map((row) => [...row]);

export const isPlayableSquare = (row: number, col: number): boolean => (row + col) % 2 === 1;

const inBounds = (row: number, col: number): boolean => row >= 0 && row < CHECKERS_SIZE && col >= 0 && col < CHECKERS_SIZE;

const getPieceDirections = (piece: CheckersPiece): number[] => {
  if (piece.kind === 'king') {
    return [-1, 1];
  }

  return [directionForColor[piece.color]];
};

const shouldPromote = (piece: CheckersPiece, row: number): boolean => (
  piece.kind === 'man' && ((piece.color === 'red' && row === 0) || (piece.color === 'black' && row === CHECKERS_SIZE - 1))
);

const serializePath = (path: CheckersPosition[]): string => path.map((position) => `${position.row},${position.col}`).join('>');

type ExploreResult = {
  path: CheckersPosition[];
  captured: CheckersPosition[];
  piece: CheckersPiece;
  stoppedByPromotion: boolean;
};

const exploreCaptures = (
  board: CheckersCell[][],
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
          piece: nextPiece,
          stoppedByPromotion: true,
        });
        continue;
      }

      const branches = exploreCaptures(nextBoard, { row: landingRow, col: landingCol }, nextPiece, nextPath, nextCaptured, nextSeen);
      if (branches.length === 0) {
        results.push({
          path: nextPath,
          captured: nextCaptured,
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

const getSimpleMovesForPiece = (board: CheckersCell[][], row: number, col: number, piece: CheckersPiece): CheckersMove[] => {
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

const getCaptureMovesForPiece = (board: CheckersCell[][], row: number, col: number, piece: CheckersPiece): CheckersMove[] => {
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
    promotes: result.stoppedByPromotion || (piece.kind === 'man' && result.piece.kind === 'king'),
  }));
};

const getLegalMovesForPiece = (board: CheckersCell[][], row: number, col: number): CheckersMove[] => {
  const piece = board[row][col];
  if (!piece) {
    return [];
  }

  const captures = getCaptureMovesForPiece(board, row, col, piece);
  if (captures.length > 0) {
    return captures;
  }

  return getSimpleMovesForPiece(board, row, col, piece);
};

export const getLegalMovesForColor = (board: CheckersCell[][], color: CheckersPieceColor): CheckersMove[] => {
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

export const getPlayerColor = (playerIds: [string, string], playerId: string | null): CheckersPieceColor | null => {
  if (!playerId) {
    return null;
  }

  if (playerIds[0] === playerId) {
    return 'red';
  }

  if (playerIds[1] === playerId) {
    return 'black';
  }

  return null;
};

export const pathPrefixMatches = (fullPath: CheckersPosition[], prefix: CheckersPosition[]): boolean => {
  return prefix.length <= fullPath.length
    && prefix.every((position, index) => position.row === fullPath[index].row && position.col === fullPath[index].col);
};

