export type WouldYouRatherChoice = 'left' | 'right';

export type WouldYouRatherPhase = 'answering' | 'revealed';

export type WouldYouRatherPrompt = {
  id: string;
  left: string;
  right: string;
};

export type WouldYouRatherState = {
  phase: WouldYouRatherPhase;
  playerIds: string[];
  roundNumber: number;
  prompt: WouldYouRatherPrompt;
  answers: Record<string, WouldYouRatherChoice>;
  submittedPlayerIds: string[];
  usedPromptIds: string[];
  revealedAt: number | null;
};

export type WouldYouRatherPublicState = {
  phase: WouldYouRatherPhase;
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

export type WouldYouRatherAction =
  | { type: 'SUBMIT_ANSWER'; payload: { choice: WouldYouRatherChoice } }
  | { type: 'REVEAL_RESULTS' }
  | { type: 'NEXT_ROUND' };
