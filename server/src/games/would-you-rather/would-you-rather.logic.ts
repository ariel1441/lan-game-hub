import { wouldYouRatherPrompts } from './would-you-rather.prompts.js';
import type {
  WouldYouRatherChoice,
  WouldYouRatherPrompt,
  WouldYouRatherState,
} from './would-you-rather.types.js';

const choosePrompt = (excludedPromptIds: string[]): WouldYouRatherPrompt => {
  const unusedPrompts = wouldYouRatherPrompts.filter((prompt) => !excludedPromptIds.includes(prompt.id));
  const availablePrompts = unusedPrompts.length > 0 ? unusedPrompts : wouldYouRatherPrompts;
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
};

export const createInitialWouldYouRatherState = (playerIds: string[]): WouldYouRatherState => {
  const prompt = choosePrompt([]);

  return {
    phase: 'answering',
    playerIds,
    roundNumber: 1,
    prompt,
    answers: {},
    submittedPlayerIds: [],
    usedPromptIds: [prompt.id],
    revealedAt: null,
  };
};

export const haveAllPlayersAnswered = (state: WouldYouRatherState): boolean => {
  return state.playerIds.every((playerId) => !!state.answers[playerId]);
};

export const countAnswers = (answers: Record<string, WouldYouRatherChoice>): { left: number; right: number } => {
  return Object.values(answers).reduce(
    (counts, choice) => {
      if (choice === 'left') {
        counts.left += 1;
      } else {
        counts.right += 1;
      }

      return counts;
    },
    { left: 0, right: 0 },
  );
};

export const revealResults = (state: WouldYouRatherState): WouldYouRatherState => {
  return {
    ...state,
    phase: 'revealed',
    revealedAt: Date.now(),
  };
};

export const createNextWouldYouRatherRound = (state: WouldYouRatherState): WouldYouRatherState => {
  const prompt = choosePrompt(state.usedPromptIds);

  return {
    phase: 'answering',
    playerIds: state.playerIds,
    roundNumber: state.roundNumber + 1,
    prompt,
    answers: {},
    submittedPlayerIds: [],
    usedPromptIds: [...state.usedPromptIds, prompt.id],
    revealedAt: null,
  };
};
