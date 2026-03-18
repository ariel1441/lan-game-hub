import type { GameModule } from '../game.types.js';
import type {
  WouldYouRatherAction,
  WouldYouRatherChoice,
  WouldYouRatherPublicState,
  WouldYouRatherState,
} from './would-you-rather.types.js';
import {
  countAnswers,
  createInitialWouldYouRatherState,
  createNextWouldYouRatherRound,
  haveAllPlayersAnswered,
  revealResults,
} from './would-you-rather.logic.js';

const isValidChoice = (value: unknown): value is WouldYouRatherChoice => value === 'left' || value === 'right';

export const wouldYouRatherGame: GameModule<WouldYouRatherState> = {
  id: 'would-you-rather',
  name: 'Would You Rather',
  description: 'Everyone answers the same dilemma at once, then the room reveals how the group voted.',
  minPlayers: 2,
  maxPlayers: 12,
  setup: {
    mode: 'all_players',
    setupTitle: 'Would You Rather setup',
    setupDescription: 'This game starts with everyone currently in the room. Players answer at the same time, then the room reveals the vote split.',
  },
  canStart: ({ players }) => {
    if (players.length < 2) {
      return { ok: false, reason: 'Would You Rather requires at least 2 players.' };
    }

    return { ok: true };
  },
  createInitialState: ({ players }) => {
    return createInitialWouldYouRatherState(players.map((player) => player.id));
  },
  getPublicState: ({ state }): WouldYouRatherPublicState => ({
    phase: state.phase,
    playerIds: state.playerIds,
    roundNumber: state.roundNumber,
    prompt: state.prompt,
    submittedPlayerIds: state.submittedPlayerIds,
    answerCounts: countAnswers(state.answers),
    answers: state.phase === 'revealed' ? state.answers : null,
    revealedAt: state.revealedAt,
  }),
  handleAction: ({ state, action, playerId, players }) => {
    const typedAction = action as WouldYouRatherAction;

    if (typedAction.type === 'SUBMIT_ANSWER') {
      if (state.phase !== 'answering') {
        throw new Error('Answers can only be submitted while the round is open.');
      }

      if (!state.playerIds.includes(playerId)) {
        throw new Error('Only active players can answer this round.');
      }

      if (state.answers[playerId]) {
        throw new Error('You have already answered this round.');
      }

      const choice = typedAction.payload?.choice;
      if (!isValidChoice(choice)) {
        throw new Error('A valid choice is required.');
      }

      const nextState: WouldYouRatherState = {
        ...state,
        answers: {
          ...state.answers,
          [playerId]: choice,
        },
        submittedPlayerIds: [...state.submittedPlayerIds, playerId],
      };

      return {
        nextState: haveAllPlayersAnswered(nextState) ? revealResults(nextState) : nextState,
      };
    }

    const requestingPlayer = players.find((player) => player.id === playerId);
    if (!requestingPlayer?.isHost) {
      throw new Error('Only the host can control the next step.');
    }

    if (typedAction.type === 'REVEAL_RESULTS') {
      if (state.phase !== 'answering') {
        throw new Error('Results can only be revealed while the round is open.');
      }

      return {
        nextState: revealResults(state),
      };
    }

    if (typedAction.type === 'NEXT_ROUND') {
      if (state.phase !== 'revealed') {
        throw new Error('You can only start the next round after revealing results.');
      }

      return {
        nextState: createNextWouldYouRatherRound(state),
      };
    }

    throw new Error('Unsupported Would You Rather action.');
  },
};
