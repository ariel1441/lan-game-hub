import assert from 'node:assert/strict';
import { imposterGame } from './imposter.game.js';
import type { ImposterPublicState, ImposterState } from './imposter.types.js';

const players = [
  { id: 'p1', name: 'One', isHost: true },
  { id: 'p2', name: 'Two', isHost: false },
  { id: 'p3', name: 'Three', isHost: false },
];

export const runImposterGameTests = (): void => {
  const state: ImposterState = {
    phase: 'discussion',
    playerIds: ['p1', 'p2', 'p3'],
    roundNumber: 1,
    imposterPlayerId: 'p2',
    secretWord: 'Pizza',
    votes: {},
    votesSubmittedBy: [],
    eliminatedPlayerId: null,
    winner: null,
  };

  const imposterView = imposterGame.getPublicState({ state, players, viewerPlayerId: 'p2' }) as ImposterPublicState;
  const crewView = imposterGame.getPublicState({ state, players, viewerPlayerId: 'p1' }) as ImposterPublicState;

  assert.equal(imposterView.yourRole, 'imposter');
  assert.equal(imposterView.secretWord, null);
  assert.equal(crewView.yourRole, 'crew');
  assert.equal(crewView.secretWord, 'Pizza');
  let votingState: ImposterState = {
    phase: 'voting',
    playerIds: ['p1', 'p2', 'p3'],
    roundNumber: 1,
    imposterPlayerId: 'p3',
    secretWord: 'Pizza',
    votes: {},
    votesSubmittedBy: [],
    eliminatedPlayerId: null,
    winner: null,
  };

  votingState = imposterGame.handleAction({
    state: votingState,
    action: { type: 'CAST_VOTE', payload: { targetPlayerId: 'p3' } },
    playerId: 'p1',
    players,
  }).nextState;

  votingState = imposterGame.handleAction({
    state: votingState,
    action: { type: 'CAST_VOTE', payload: { targetPlayerId: 'p3' } },
    playerId: 'p2',
    players,
  }).nextState;

  votingState = imposterGame.handleAction({
    state: votingState,
    action: { type: 'CAST_VOTE', payload: { targetPlayerId: 'p1' } },
    playerId: 'p3',
    players,
  }).nextState;

  assert.equal(votingState.phase, 'result');
  assert.equal(votingState.eliminatedPlayerId, 'p3');
  assert.equal(votingState.winner, 'crew');
};
