import assert from 'node:assert/strict';
import { wouldYouRatherGame } from './would-you-rather.game.js';
import type { WouldYouRatherPublicState, WouldYouRatherState } from './would-you-rather.types.js';

const players = [
  { id: 'p1', name: 'One', isHost: true },
  { id: 'p2', name: 'Two', isHost: false },
  { id: 'p3', name: 'Three', isHost: false },
];

export const runWouldYouRatherGameTests = (): void => {
  let state = wouldYouRatherGame.createInitialState({ players }) as WouldYouRatherState;

  state = wouldYouRatherGame.handleAction({
    state,
    action: { type: 'SUBMIT_ANSWER', payload: { choice: 'left' } },
    playerId: 'p1',
    players,
  }).nextState;

  state = wouldYouRatherGame.handleAction({
    state,
    action: { type: 'SUBMIT_ANSWER', payload: { choice: 'right' } },
    playerId: 'p2',
    players,
  }).nextState;

  state = wouldYouRatherGame.handleAction({
    state,
    action: { type: 'SUBMIT_ANSWER', payload: { choice: 'left' } },
    playerId: 'p3',
    players,
  }).nextState;

  const publicState = wouldYouRatherGame.getPublicState({ state, players }) as WouldYouRatherPublicState;

  assert.equal(state.phase, 'revealed');
  assert.ok(state.revealedAt !== null);
  assert.equal(publicState.phase, 'revealed');
  assert.deepEqual(publicState.answerCounts, { left: 2, right: 1 });
  assert.deepEqual(publicState.answers, { p1: 'left', p2: 'right', p3: 'left' });
};
