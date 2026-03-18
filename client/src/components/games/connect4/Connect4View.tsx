import { useMemo, useState } from 'react';
import type { Connect4State, PublicRoom } from '../../../types/room';
import { Connect4Board } from './Connect4Board';
import { Connect4Sidebar } from './Connect4Sidebar';

type Connect4ViewProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

export const Connect4View = ({ room, currentPlayerId, isHost, onReturnToLobby, onGameAction }: Connect4ViewProps) => {
  const [pendingColumn, setPendingColumn] = useState<number | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const state = room.gameSession?.state as Connect4State | null;
  const playersById = useMemo(() => new Map(room.players.map((player) => [player.id, player])), [room.players]);

  if (!room.gameSession || !state) {
    return null;
  }

  const firstPlayer = playersById.get(state.playerIds[0]);
  const secondPlayer = playersById.get(state.playerIds[1]);

  if (!firstPlayer || !secondPlayer) {
    return null;
  }

  const currentTurnPlayer = playersById.get(state.currentTurnPlayerId) ?? null;
  const winner = state.winnerPlayerId ? playersById.get(state.winnerPlayerId) ?? null : null;
  const isActivePlayer = currentPlayerId ? state.playerIds.includes(currentPlayerId) : false;
  const canPlay = state.phase === 'playing' && currentPlayerId === state.currentTurnPlayerId && pendingColumn === null;
  const currentPlayerChip = state.currentTurnPlayerId === firstPlayer.id ? 'R' : 'Y';

  const statusText = winner
    ? `${winner.name} wins round ${state.roundNumber}`
    : state.isDraw
      ? `Round ${state.roundNumber} ended in a draw`
      : currentTurnPlayer
        ? `${currentTurnPlayer.name}'s turn`
        : 'Waiting for the next move';

  const subtitle = winner || state.isDraw
    ? 'The host can start the next round or return to the lobby.'
    : canPlay
      ? 'Click any column to drop your chip.'
      : isActivePlayer
        ? 'Watch the board and wait for your turn.'
        : 'This round is between the selected players. You can follow along live from this screen.';

  const handleDrop = async (column: number) => {
    if (!canPlay) {
      return;
    }

    try {
      setPendingColumn(column);
      await onGameAction({
        type: 'DROP_PIECE',
        payload: { column },
      });
    } finally {
      setPendingColumn(null);
    }
  };

  const handlePlayAgain = async () => {
    try {
      setIsReplaying(true);
      await onGameAction({ type: 'PLAY_AGAIN' });
    } finally {
      setIsReplaying(false);
    }
  };

  const handleReturnToLobby = async () => {
    try {
      setIsReturning(true);
      await onReturnToLobby();
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1380px] min-h-0 flex-col gap-3 overflow-hidden">
      <section className="shrink-0 rounded-[22px] border border-white/10 bg-[#243344]/94 px-4 py-3 shadow-[0_18px_45px_rgba(2,8,23,0.28)] backdrop-blur">
        <div className="grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
          <Connect4Sidebar
            player={firstPlayer}
            score={state.scores[firstPlayer.id] ?? 0}
            chip="R"
            isCurrentTurn={state.currentTurnPlayerId === firstPlayer.id && state.phase === 'playing'}
            isWinner={state.winnerPlayerId === firstPlayer.id}
            align="left"
          />

          <div className="flex items-center justify-center gap-3 px-2">
            <div className="hidden h-px w-10 bg-white/10 sm:block" />
            <div className="text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-200">Connect 4</div>
              <div className="mt-1 text-lg font-semibold text-white sm:text-xl">{statusText}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-slate-400">Round {state.roundNumber}</div>
            </div>
            <div className="hidden h-px w-10 bg-white/10 sm:block" />
          </div>

          <div className="flex items-center justify-center gap-3 lg:justify-end">
            <Connect4Sidebar
              player={secondPlayer}
              score={state.scores[secondPlayer.id] ?? 0}
              chip="Y"
              isCurrentTurn={state.currentTurnPlayerId === secondPlayer.id && state.phase === 'playing'}
              isWinner={state.winnerPlayerId === secondPlayer.id}
              align="right"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/8 pt-3">
          <p className="text-sm text-slate-300">{subtitle}</p>
          {state.phase === 'finished' && isHost ? (
            <button
              type="button"
              disabled={isReplaying}
              onClick={handlePlayAgain}
              className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isReplaying ? 'Starting next round...' : 'Play again'}
            </button>
          ) : null}
          {isHost ? (
            <button
              type="button"
              disabled={isReturning}
              onClick={handleReturnToLobby}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isReturning ? 'Returning...' : 'Return to lobby'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="min-h-0 flex flex-1 items-center justify-center overflow-hidden rounded-[28px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.02),transparent_42%),linear-gradient(180deg,rgba(3,11,29,0.44),rgba(3,11,29,0.12))] px-3 py-2 sm:px-4 sm:py-3">
        <Connect4Board
          board={state.board}
          canPlay={canPlay}
          currentPlayerChip={currentPlayerChip}
          winningCells={state.winningCells}
          onDrop={handleDrop}
        />
      </section>
    </div>
  );
};
