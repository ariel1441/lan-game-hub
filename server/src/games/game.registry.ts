import type { GameDefinition, GameModule } from './game.types.js';
import { checkersGame } from './checkers/checkers.game.js';
import { connect4Game } from './connect4/connect4.game.js';
import { imposterGame } from './imposter/imposter.game.js';
import { wouldYouRatherGame } from './would-you-rather/would-you-rather.game.js';

const games = new Map<string, GameModule<any>>();

const registerGame = <TState>(game: GameModule<TState>): void => {
  games.set(game.id, game);
};

registerGame(checkersGame);
registerGame(connect4Game);
registerGame(wouldYouRatherGame);
registerGame(imposterGame);

export const gameRegistry = {
  listGames(): GameDefinition[] {
    return Array.from(games.values()).map((game) => ({
      id: game.id,
      name: game.name,
      description: game.description,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      setup: game.setup,
    }));
  },
  getGame(gameId: string): GameModule<any> | undefined {
    return games.get(gameId);
  },
};
