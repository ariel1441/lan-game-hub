import assert from 'node:assert/strict';
import { checkersGame } from './checkers.game.js';
import type { CheckersBoard, CheckersState } from './checkers.types.js';

const players = [
  { id: 'p1', name: 'One', isHost: true },
  { id: 'p2', name: 'Two', isHost: false },
];

const createEmptyBoard = (): CheckersBoard => Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

export const runCheckersGameTests = (): void => {
  const startResult = checkersGame.canStart!({
    players,
    options: { activePlayerIds: ['p1'] },
  });

  assert.equal(startResult.ok, false);
  const board = createEmptyBoard();
  board[5][0] = { color: 'red', kind: 'man' };
  board[4][1] = { color: 'black', kind: 'man' };
  board[5][4] = { color: 'red', kind: 'man' };

  const state: CheckersState = {
    phase: 'playing',
    board,
    playerIds: ['p1', 'p2'],
    currentTurnPlayerId: 'p1',
    startingPlayerId: 'p1',
    winnerPlayerId: null,
    result: null,
    scores: { p1: 0, p2: 0 },
    roundNumber: 1,
    lastMove: null,
    movesSinceProgress: 0,
  };

  assert.throws(() => {
    checkersGame.handleAction({
      state,
      action: {
        type: 'MAKE_MOVE',
        payload: {
          path: [{ row: 5, col: 4 }, { row: 4, col: 3 }],
        },
      },
      playerId: 'p1',
      players,
    });
  }, /not legal/i);
};
