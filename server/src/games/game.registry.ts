import type { GameDefinition, GameModule } from './game.types.js';
import { connect4Game } from './connect4/connect4.game.js';

const games = new Map<string, GameModule<any>>();

const registerGame = <TState>(game: GameModule<TState>): void => {
  games.set(game.id, game);
};

registerGame(connect4Game);

export const gameRegistry = {
  listGames(): GameDefinition[] {
    return Array.from(games.values()).map((game) => ({
      id: game.id,
      name: game.name,
      description: game.description,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
    }));
  },
  getGame(gameId: string): GameModule<any> | undefined {
    return games.get(gameId);
  },
};
