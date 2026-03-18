export type ImposterRole = 'imposter' | 'crew';

export type ImposterPhase = 'revealing_roles' | 'discussion' | 'voting' | 'result';

export type ImposterWinner = 'imposter' | 'crew' | null;

export type ImposterState = {
  phase: ImposterPhase;
  playerIds: string[];
  roundNumber: number;
  imposterPlayerId: string;
  secretWord: string;
  votes: Record<string, string>;
  votesSubmittedBy: string[];
  eliminatedPlayerId: string | null;
  winner: ImposterWinner;
};

export type ImposterPublicState = {
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

export type ImposterAction =
  | { type: 'START_DISCUSSION' }
  | { type: 'START_VOTING' }
  | { type: 'CAST_VOTE'; payload: { targetPlayerId: string } }
  | { type: 'NEXT_ROUND' };
