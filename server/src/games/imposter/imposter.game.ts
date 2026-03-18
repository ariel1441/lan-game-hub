import type { GameModule } from '../game.types.js';
import type { ImposterAction, ImposterPublicState, ImposterState } from './imposter.types.js';
import {
  createInitialImposterState,
  createNextImposterRound,
  createResultState,
  haveAllPlayersVoted,
} from './imposter.logic.js';

export const imposterGame: GameModule<ImposterState> = {
  id: 'imposter',
  name: 'Imposter',
  description: 'One player is the imposter, everyone else knows the secret word, and the room votes at the end.',
  minPlayers: 3,
  maxPlayers: 8,
  setup: {
    mode: 'all_players',
    setupTitle: 'Imposter setup',
    setupDescription: 'This game starts with everyone currently in the room. Each player gets a role, the room discusses, then everyone votes.',
  },
  canStart: ({ players }) => {
    if (players.length < 3) {
      return { ok: false, reason: 'Imposter requires at least 3 players.' };
    }

    return { ok: true };
  },
  createInitialState: ({ players }) => {
    return createInitialImposterState(players.map((player) => player.id));
  },
  getPublicState: ({ state, viewerPlayerId }): ImposterPublicState => {
    const isViewerImposter = viewerPlayerId === state.imposterPlayerId;

    return {
      phase: state.phase,
      playerIds: state.playerIds,
      roundNumber: state.roundNumber,
      yourRole: viewerPlayerId
        ? (isViewerImposter ? 'imposter' : 'crew')
        : null,
      secretWord: state.phase === 'result'
        ? state.secretWord
        : isViewerImposter
          ? null
          : state.secretWord,
      votesSubmittedBy: state.phase === 'result' ? state.votesSubmittedBy : [],
      votes: state.phase === 'result' ? state.votes : null,
      imposterPlayerId: state.phase === 'result' ? state.imposterPlayerId : null,
      eliminatedPlayerId: state.phase === 'result' ? state.eliminatedPlayerId : null,
      winner: state.winner,
    };
  },
  handleAction: ({ state, action, playerId, players }) => {
    const typedAction = action as ImposterAction;
    const requestingPlayer = players.find((player) => player.id === playerId);

    if (typedAction.type === 'CAST_VOTE') {
      if (state.phase !== 'voting') {
        throw new Error('Votes can only be cast during the voting phase.');
      }

      if (!state.playerIds.includes(playerId)) {
        throw new Error('Only active players can vote.');
      }

      if (state.votes[playerId]) {
        throw new Error('You have already voted this round.');
      }

      const targetPlayerId = typedAction.payload?.targetPlayerId;
      if (typeof targetPlayerId !== 'string' || !state.playerIds.includes(targetPlayerId)) {
        throw new Error('You must vote for a valid player.');
      }

      const nextState: ImposterState = {
        ...state,
        votes: {
          ...state.votes,
          [playerId]: targetPlayerId,
        },
        votesSubmittedBy: [...state.votesSubmittedBy, playerId],
      };

      return {
        nextState: haveAllPlayersVoted(nextState) ? createResultState(nextState) : nextState,
      };
    }

    if (!requestingPlayer?.isHost) {
      throw new Error('Only the host can control the game flow.');
    }

    if (typedAction.type === 'START_DISCUSSION') {
      if (state.phase !== 'revealing_roles') {
        throw new Error('Discussion can only start after roles are revealed.');
      }

      return {
        nextState: {
          ...state,
          phase: 'discussion',
        },
      };
    }

    if (typedAction.type === 'START_VOTING') {
      if (state.phase !== 'discussion') {
        throw new Error('Voting can only start after discussion.');
      }

      return {
        nextState: {
          ...state,
          phase: 'voting',
          votes: {},
          votesSubmittedBy: [],
        },
      };
    }

    if (typedAction.type === 'NEXT_ROUND') {
      if (state.phase !== 'result') {
        throw new Error('You can only start a new round after showing the result.');
      }

      return {
        nextState: createNextImposterRound(state),
      };
    }

    throw new Error('Unsupported Imposter action.');
  },
};
