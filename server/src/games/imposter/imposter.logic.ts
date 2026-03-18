import { imposterWords } from './imposter.words.js';
import type { ImposterState, ImposterWinner } from './imposter.types.js';

const chooseRandom = <T>(items: T[]): T => {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

export const createInitialImposterState = (playerIds: string[]): ImposterState => ({
  phase: 'revealing_roles',
  playerIds,
  roundNumber: 1,
  imposterPlayerId: chooseRandom(playerIds),
  secretWord: chooseRandom(imposterWords),
  votes: {},
  votesSubmittedBy: [],
  eliminatedPlayerId: null,
  winner: null,
});

export const createNextImposterRound = (state: ImposterState): ImposterState => ({
  phase: 'revealing_roles',
  playerIds: state.playerIds,
  roundNumber: state.roundNumber + 1,
  imposterPlayerId: chooseRandom(state.playerIds),
  secretWord: chooseRandom(imposterWords),
  votes: {},
  votesSubmittedBy: [],
  eliminatedPlayerId: null,
  winner: null,
});

export const haveAllPlayersVoted = (state: ImposterState): boolean => {
  return state.playerIds.every((playerId) => !!state.votes[playerId]);
};

export const calculateVoteResult = (state: ImposterState): { eliminatedPlayerId: string | null; winner: ImposterWinner } => {
  const tallies = new Map<string, number>();

  for (const targetPlayerId of Object.values(state.votes)) {
    tallies.set(targetPlayerId, (tallies.get(targetPlayerId) ?? 0) + 1);
  }

  let topCount = 0;
  let topPlayers: string[] = [];

  for (const [playerId, count] of tallies.entries()) {
    if (count > topCount) {
      topCount = count;
      topPlayers = [playerId];
      continue;
    }

    if (count === topCount) {
      topPlayers.push(playerId);
    }
  }

  if (topPlayers.length !== 1) {
    return {
      eliminatedPlayerId: null,
      winner: 'imposter',
    };
  }

  const eliminatedPlayerId = topPlayers[0];
  return {
    eliminatedPlayerId,
    winner: eliminatedPlayerId === state.imposterPlayerId ? 'crew' : 'imposter',
  };
};

export const createResultState = (state: ImposterState): ImposterState => {
  const result = calculateVoteResult(state);

  return {
    ...state,
    phase: 'result',
    eliminatedPlayerId: result.eliminatedPlayerId,
    winner: result.winner,
  };
};
