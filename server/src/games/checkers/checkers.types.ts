export type CheckersPieceColor = 'red' | 'black';

export type CheckersPieceKind = 'man' | 'king';

export type CheckersPiece = {
  color: CheckersPieceColor;
  kind: CheckersPieceKind;
};

export type CheckersCell = CheckersPiece | null;

export type CheckersBoard = CheckersCell[][];

export type CheckersPosition = {
  row: number;
  col: number;
};

export type CheckersMove = {
  path: CheckersPosition[];
  captured: CheckersPosition[];
  promotes: boolean;
};

export type CheckersRoundResult = 'win' | 'draw';

export type CheckersState = {
  phase: 'playing' | 'finished';
  board: CheckersBoard;
  playerIds: [string, string];
  currentTurnPlayerId: string;
  startingPlayerId: string;
  winnerPlayerId: string | null;
  result: CheckersRoundResult | null;
  scores: Record<string, number>;
  roundNumber: number;
  lastMove: CheckersMove | null;
  movesSinceProgress: number;
};

export type CheckersAction =
  | {
    type: 'MAKE_MOVE';
    payload: {
      path: CheckersPosition[];
    };
  }
  | { type: 'PLAY_AGAIN' };
