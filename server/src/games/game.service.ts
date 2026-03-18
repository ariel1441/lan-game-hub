import { gameRegistry } from './game.registry.js';
import type { BasicPlayer, GameAction, GameDefinition } from './game.types.js';
import type { GameSession, Room } from '../rooms/room.types.js';

const toBasicPlayers = (room: Room): BasicPlayer[] => {
  return room.players.map((player) => ({
    id: player.id,
    name: player.name,
    isHost: player.isHost,
  }));
};

export class GameService {
  listAvailableGames(): GameDefinition[] {
    return gameRegistry.listGames();
  }

  startGame(params: {
    room: Room;
    gameId: string;
    options?: Record<string, unknown>;
  }): { ok: true; room: Room } | { ok: false; error: string } {
    const game = gameRegistry.getGame(params.gameId);
    if (!game) {
      return { ok: false, error: 'Selected game is not available.' };
    }

    const players = toBasicPlayers(params.room);

    const playerCount = game.getPlayerCount
      ? game.getPlayerCount({ players, options: params.options })
      : players.length;

    if (playerCount < game.minPlayers) {
      return { ok: false, error: `${game.name} requires at least ${game.minPlayers} players.` };
    }

    if (playerCount > game.maxPlayers) {
      return { ok: false, error: `${game.name} currently supports at most ${game.maxPlayers} players.` };
    }

    if (game.canStart) {
      const result = game.canStart({ players, options: params.options });
      if (!result.ok) {
        return { ok: false, error: result.reason ?? 'The game could not be started.' };
      }
    }

    const session: GameSession = {
      gameId: game.id,
      startedAt: Date.now(),
      state: game.createInitialState({
        players,
        options: params.options,
      }),
    };

    return {
      ok: true,
      room: {
        ...params.room,
        status: 'in_game',
        selectedGameId: game.id,
        gameSession: session,
      },
    };
  }

  getPublicGameState(room: Room): unknown | null {
    if (!room.gameSession) {
      return null;
    }

    const game = gameRegistry.getGame(room.gameSession.gameId);
    if (!game) {
      return null;
    }

    return game.getPublicState({
      state: room.gameSession.state,
      players: toBasicPlayers(room),
    });
  }

  handleGameAction(params: {
    room: Room;
    playerId: string;
    action: GameAction;
  }): { ok: true; room: Room } | { ok: false; error: string } {
    if (!params.room.gameSession) {
      return { ok: false, error: 'No game is currently active in this room.' };
    }

    const game = gameRegistry.getGame(params.room.gameSession.gameId);
    if (!game) {
      return { ok: false, error: 'The active game could not be found.' };
    }

    try {
      const result = game.handleAction({
        state: params.room.gameSession.state,
        action: params.action,
        playerId: params.playerId,
        players: toBasicPlayers(params.room),
      });

      return {
        ok: true,
        room: {
          ...params.room,
          gameSession: {
            ...params.room.gameSession,
            state: result.nextState,
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'The game action failed.',
      };
    }
  }
}

export const gameService = new GameService();
