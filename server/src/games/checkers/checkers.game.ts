import type { GameModule } from '../game.types.js';
import type { CheckersAction, CheckersState } from './checkers.types.js';
import {
  applyMove,
  createInitialCheckersState,
  createNextCheckersRound,
  findMoveByPath,
  getLegalMovesForColor,
  getPieceColorForPlayer,
  getRoundOutcome,
  isDrawByNoProgress,
} from './checkers.logic.js';

const validateSelectedPlayerIds = (
  selected: unknown,
  players: { id: string }[],
): { ok: true; playerIds: [string, string] } | { ok: false; reason: string } => {
  if (!Array.isArray(selected) || selected.length !== 2) {
    return { ok: false, reason: 'Checkers requires exactly 2 selected players.' };
  }

  const [first, second] = selected;
  if (typeof first !== 'string' || typeof second !== 'string' || first === second) {
    return { ok: false, reason: 'Choose two different players for Checkers.' };
  }

  const roomPlayerIds = new Set(players.map((player) => player.id));
  if (!roomPlayerIds.has(first) || !roomPlayerIds.has(second)) {
    return { ok: false, reason: 'Selected players must belong to the room.' };
  }

  return { ok: true, playerIds: [first, second] };
};

export const checkersGame: GameModule<CheckersState> = {
  id: 'checkers',
  name: 'Checkers',
  description: 'Move diagonally, capture pieces, and crown kings. Full move validation lives on the server.',
  minPlayers: 2,
  maxPlayers: 2,
  setup: {
    mode: 'selected_players',
    minSelectedPlayers: 2,
    maxSelectedPlayers: 2,
    setupTitle: 'Checkers setup',
    setupDescription: 'Choose exactly 2 active players for this match. Captures are mandatory and the server enforces the full move rules.',
  },
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

    return createInitialCheckersState(selectedPlayers.playerIds);
  },
  getPublicState: ({ state }) => state,
  handleAction: ({ state, action, playerId, players }) => {
    const typedAction = action as CheckersAction;

    if (typedAction.type === 'PLAY_AGAIN') {
      if (state.phase !== 'finished') {
        throw new Error('You can only replay after the round is finished.');
      }

      const requestingPlayer = players.find((player) => player.id === playerId);
      if (!requestingPlayer?.isHost) {
        throw new Error('Only the host can start the next round.');
      }

      return {
        nextState: createNextCheckersRound(state),
      };
    }

    if (typedAction.type !== 'MAKE_MOVE') {
      throw new Error('Unsupported Checkers action.');
    }

    if (state.phase !== 'playing') {
      throw new Error('The round is already finished.');
    }

    if (!state.playerIds.includes(playerId)) {
      throw new Error('Only active players can move in Checkers.');
    }

    if (state.currentTurnPlayerId !== playerId) {
      throw new Error('It is not your turn.');
    }

    const pieceColor = getPieceColorForPlayer(state.playerIds, playerId);
    if (!pieceColor) {
      throw new Error('Player is not assigned a valid color.');
    }

    const path = typedAction.payload?.path;
    if (!Array.isArray(path) || path.length < 2) {
      throw new Error('A full move path is required.');
    }

    const legalMoves = getLegalMovesForColor(state.board, pieceColor);
    const selectedMove = findMoveByPath(legalMoves, path);
    if (!selectedMove) {
      throw new Error('That move is not legal.');
    }

    const nextBoard = applyMove(state.board, selectedMove);
    const nextPlayerId = state.playerIds[0] === playerId ? state.playerIds[1] : state.playerIds[0];
    const movesSinceProgress = selectedMove.captured.length > 0 || selectedMove.promotes
      ? 0
      : state.movesSinceProgress + 1;

    if (isDrawByNoProgress(movesSinceProgress)) {
      return {
        nextState: {
          ...state,
          board: nextBoard,
          phase: 'finished',
          currentTurnPlayerId: nextPlayerId,
          winnerPlayerId: null,
          result: 'draw',
          lastMove: selectedMove,
          movesSinceProgress,
        },
      };
    }

    const roundOutcome = getRoundOutcome(nextBoard, nextPlayerId, state.playerIds, playerId);
    if (roundOutcome.result === 'win') {
      return {
        nextState: {
          ...state,
          board: nextBoard,
          phase: 'finished',
          currentTurnPlayerId: nextPlayerId,
          winnerPlayerId: roundOutcome.winnerPlayerId,
          result: 'win',
          lastMove: selectedMove,
          movesSinceProgress,
          scores: roundOutcome.winnerPlayerId
            ? {
              ...state.scores,
              [roundOutcome.winnerPlayerId]: (state.scores[roundOutcome.winnerPlayerId] ?? 0) + 1,
            }
            : state.scores,
        },
      };
    }

    return {
      nextState: {
        ...state,
        board: nextBoard,
        currentTurnPlayerId: nextPlayerId,
        lastMove: selectedMove,
        movesSinceProgress,
      },
    };
  },
};
