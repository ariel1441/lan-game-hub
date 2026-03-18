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
  setup: {
    mode: 'all_players' | 'selected_players';
    minSelectedPlayers?: number;
    maxSelectedPlayers?: number;
    setupTitle?: string;
    setupDescription?: string;
  };
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

export type WouldYouRatherChoice = 'left' | 'right';

export type WouldYouRatherPrompt = {
  id: string;
  left: string;
  right: string;
};

export type WouldYouRatherState = {
  phase: 'answering' | 'revealed';
  playerIds: string[];
  roundNumber: number;
  prompt: WouldYouRatherPrompt;
  submittedPlayerIds: string[];
  answerCounts: {
    left: number;
    right: number;
  };
  answers: Record<string, WouldYouRatherChoice> | null;
  revealedAt: number | null;
};

export type ImposterPhase = 'revealing_roles' | 'discussion' | 'voting' | 'result';

export type ImposterRole = 'imposter' | 'crew';

export type ImposterWinner = 'imposter' | 'crew' | null;

export type ImposterState = {
  phase: ImposterPhase;
  playerIds: string[];
  roundNumber: number;
  yourRole: ImposterRole | null;
  secretWord: string | null;
  votesSubmittedBy: string[];
  votes: Record<string, string> | null;
  imposterPlayerId: string | null;
  eliminatedPlayerId: string | null;
  winner: ImposterWinner;
};

export type CheckersPieceColor = 'red' | 'black';

export type CheckersPieceKind = 'man' | 'king';

export type CheckersPiece = {
  color: CheckersPieceColor;
  kind: CheckersPieceKind;
};

export type CheckersCell = CheckersPiece | null;

export type CheckersPosition = {
  row: number;
  col: number;
};

export type CheckersMove = {
  path: CheckersPosition[];
  captured: CheckersPosition[];
  promotes: boolean;
};

export type CheckersState = {
  phase: 'playing' | 'finished';
  board: CheckersCell[][];
  playerIds: [string, string];
  currentTurnPlayerId: string;
  startingPlayerId: string;
  winnerPlayerId: string | null;
  result: 'win' | 'draw' | null;
  scores: Record<string, number>;
  roundNumber: number;
  lastMove: CheckersMove | null;
  movesSinceProgress: number;
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
