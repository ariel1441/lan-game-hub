import assert from 'node:assert/strict';
import { gameRegistry } from './game.registry.js';

export const runGameMetadataTests = (): void => {
  const games = gameRegistry.listGames();
  const byId = new Map(games.map((game) => [game.id, game]));

  assert.equal(byId.get('connect4')?.setup.mode, 'selected_players');
  assert.equal(byId.get('checkers')?.setup.mode, 'selected_players');
  assert.equal(byId.get('would-you-rather')?.setup.mode, 'all_players');
  assert.equal(byId.get('imposter')?.setup.mode, 'all_players');
};
