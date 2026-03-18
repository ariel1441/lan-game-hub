import assert from 'node:assert/strict';
import { connect4Game } from './connect4.game.js';
import type { Connect4State } from './connect4.types.js';

const players = [
  { id: 'p1', name: 'One', isHost: true },
  { id: 'p2', name: 'Two', isHost: false },
  { id: 'p3', name: 'Three', isHost: false },
];

export const runConnect4GameTests = (): void => {
  const state = connect4Game.createInitialState({
    players,
    options: { activePlayerIds: ['p2', 'p3'] },
  }) as Connect4State;

  assert.deepEqual(state.playerIds, ['p2', 'p3']);
  assert.equal(state.currentTurnPlayerId, 'p2');
  let winningState = connect4Game.createInitialState({
    players,
    options: { activePlayerIds: ['p1', 'p2'] },
  }) as Connect4State;

  const moveSequence = [0, 0, 1, 1, 2, 2, 3];
  const turnSequence = ['p1', 'p2', 'p1', 'p2', 'p1', 'p2', 'p1'];

  for (let index = 0; index < moveSequence.length; index += 1) {
    winningState = connect4Game.handleAction({
      state: winningState,
      action: { type: 'DROP_PIECE', payload: { column: moveSequence[index] } },
      playerId: turnSequence[index],
      players,
    }).nextState;
  }

  assert.equal(winningState.phase, 'finished');
  assert.equal(winningState.winnerPlayerId, 'p1');
  assert.equal(winningState.isDraw, false);
  assert.equal(winningState.scores.p1, 1);
  assert.ok(winningState.winningCells.length >= 4);
};
