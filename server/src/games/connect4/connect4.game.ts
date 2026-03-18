import type { GameModule } from '../game.types.js';
import type { Connect4Action, Connect4State } from './connect4.types.js';
import {
  createInitialConnect4State,
  createNextRoundState,
  dropPiece,
  findWinningCells,
  getChipForPlayer,
  isBoardFull,
} from './connect4.logic.js';

const validateSelectedPlayerIds = (
  selected: unknown,
  players: { id: string }[],
): { ok: true; playerIds: [string, string] } | { ok: false; reason: string } => {
  if (!Array.isArray(selected) || selected.length !== 2) {
    return { ok: false, reason: 'Connect 4 requires exactly 2 selected players.' };
  }

  const [first, second] = selected;
  if (typeof first !== 'string' || typeof second !== 'string' || first === second) {
    return { ok: false, reason: 'Choose two different players for Connect 4.' };
  }

  const roomPlayerIds = new Set(players.map((player) => player.id));
  if (!roomPlayerIds.has(first) || !roomPlayerIds.has(second)) {
    return { ok: false, reason: 'Selected players must belong to the room.' };
  }

  return { ok: true, playerIds: [first, second] };
};

export const connect4Game: GameModule<Connect4State> = {
  id: 'connect4',
  name: 'Connect 4',
  description: 'Take turns dropping pieces into a shared board. First to connect four wins the round.',
  minPlayers: 2,
  maxPlayers: 2,
  getPlayerCount: ({ players, options }) => {
    const selectedPlayers = validateSelectedPlayerIds(options?.activePlayerIds, players);
    return selectedPlayers.ok ? selectedPlayers.playerIds.length : players.length;
  },
  canStart: ({ players, options }) => {
    const selectedPlayers = validateSelectedPlayerIds(options?.activePlayerIds, players);
    if (!selectedPlayers.ok) {
      return { ok: false, reason: selectedPlayers.reason };
    }

    return { ok: true };
  },
  createInitialState: ({ players, options }) => {
    const selectedPlayers = validateSelectedPlayerIds(options?.activePlayerIds, players);
    if (!selectedPlayers.ok) {
      throw new Error(selectedPlayers.reason);
    }

    return createInitialConnect4State(selectedPlayers.playerIds);
  },
  getPublicState: ({ state }) => state,
  handleAction: ({ state, action, playerId, players }) => {
    const typedAction = action as Connect4Action;

    if (typedAction.type === 'PLAY_AGAIN') {
      if (state.phase !== 'finished') {
        throw new Error('You can only replay after the round is finished.');
      }

      const requestingPlayer = players.find((player) => player.id === playerId);
      if (!requestingPlayer?.isHost) {
        throw new Error('Only the host can start the next round.');
      }

      return {
        nextState: createNextRoundState(state),
      };
    }

    if (typedAction.type !== 'DROP_PIECE') {
      throw new Error('Unsupported Connect 4 action.');
    }

    if (state.phase !== 'playing') {
      throw new Error('The round is already finished.');
    }

    if (!state.playerIds.includes(playerId)) {
      throw new Error('Only active players can make a move in Connect 4.');
    }

    if (state.currentTurnPlayerId !== playerId) {
      throw new Error('It is not your turn.');
    }

    const column = typedAction.payload?.column;
    if (typeof column !== 'number' || !Number.isInteger(column)) {
      throw new Error('A valid column is required for Connect 4.');
    }

    const chip = getChipForPlayer(state.playerIds, playerId);
    if (!chip) {
      throw new Error('Player is not assigned a valid chip.');
    }

    const dropResult = dropPiece(state.board, column, chip);
    if (!dropResult) {
      throw new Error('That column is full or invalid.');
    }

    const winningCells = findWinningCells(dropResult.board, dropResult.row, column, chip);
    if (winningCells.length >= 4) {
      return {
        nextState: {
          ...state,
          board: dropResult.board,
          phase: 'finished',
          winnerPlayerId: playerId,
          isDraw: false,
          winningCells,
          moveCount: state.moveCount + 1,
          scores: {
            ...state.scores,
            [playerId]: (state.scores[playerId] ?? 0) + 1,
          },
        },
      };
    }

    if (isBoardFull(dropResult.board)) {
      return {
        nextState: {
          ...state,
          board: dropResult.board,
          phase: 'finished',
          winnerPlayerId: null,
          isDraw: true,
          winningCells: [],
          moveCount: state.moveCount + 1,
        },
      };
    }

    const nextPlayerId = state.playerIds[0] === playerId ? state.playerIds[1] : state.playerIds[0];

    return {
      nextState: {
        ...state,
        board: dropResult.board,
        currentTurnPlayerId: nextPlayerId,
        moveCount: state.moveCount + 1,
      },
    };
  },
};
