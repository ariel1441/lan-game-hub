import { useMemo, useState } from 'react';
import type { CheckersMove, CheckersPosition, CheckersState, PublicRoom } from '../../../types/room';
import { CheckersBoard } from './CheckersBoard';
import { getLegalMovesForColor, getPlayerColor, pathPrefixMatches } from './checkers.helpers';

type CheckersViewProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

const toKey = (row: number, col: number): string => `${row}-${col}`;

export const CheckersView = ({
  room,
  currentPlayerId,
  isHost,
  onReturnToLobby,
  onGameAction,
}: CheckersViewProps) => {
  const [selectedPath, setSelectedPath] = useState<CheckersPosition[]>([]);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const state = room.gameSession?.state as CheckersState | null;
  const playersById = useMemo(() => new Map(room.players.map((player) => [player.id, player])), [room.players]);

  if (!room.gameSession || !state) {
    return null;
  }

  const playerColor = getPlayerColor(state.playerIds, currentPlayerId);
  const isCurrentPlayerTurn = currentPlayerId === state.currentTurnPlayerId;
  const canAct = state.phase === 'playing' && !!playerColor && isCurrentPlayerTurn && !isSubmittingMove;
  const legalMoves = playerColor ? getLegalMovesForColor(state.board, playerColor) : [];

  const selectableStarts = useMemo(() => {
    const starts = new Set<string>();
    for (const move of legalMoves) {
      const start = move.path[0];
      starts.add(toKey(start.row, start.col));
    }
    return starts;
  }, [legalMoves]);

  const candidateMoves = useMemo(
    () => (selectedPath.length > 0 ? legalMoves.filter((move) => pathPrefixMatches(move.path, selectedPath)) : []),
    [legalMoves, selectedPath],
  );

  const nextTargets = useMemo(() => {
    const targets = new Set<string>();
    if (selectedPath.length === 0) {
      return targets;
    }

    for (const move of candidateMoves) {
      if (move.path.length > selectedPath.length) {
        const next = move.path[selectedPath.length];
        targets.add(toKey(next.row, next.col));
      }
    }

    return targets;
  }, [candidateMoves, selectedPath]);

  const lastMoveCells = useMemo(() => {
    const cells = new Set<string>();
    if (!state.lastMove) {
      return cells;
    }

    for (const position of state.lastMove.path) {
      cells.add(toKey(position.row, position.col));
    }

    for (const position of state.lastMove.captured) {
      cells.add(toKey(position.row, position.col));
    }

    return cells;
  }, [state.lastMove]);

  const currentTurnPlayer = playersById.get(state.currentTurnPlayerId) ?? null;
  const winner = state.winnerPlayerId ? playersById.get(state.winnerPlayerId) ?? null : null;

  const statusText = winner
    ? `${winner.name} wins round ${state.roundNumber}`
    : state.result === 'draw'
      ? `Round ${state.roundNumber} ended in a draw`
      : currentTurnPlayer
        ? `${currentTurnPlayer.name}'s turn`
        : 'Waiting for the next move';

  const subtitle = winner || state.result === 'draw'
    ? 'The host can replay the round or return to the lobby.'
    : canAct
      ? 'Select a piece, then follow the highlighted landing squares. Captures are mandatory.'
      : 'Watch the board and wait for your turn.';

  const submitMove = async (move: CheckersMove) => {
    try {
      setIsSubmittingMove(true);
      await onGameAction({
        type: 'MAKE_MOVE',
        payload: { path: move.path },
      });
      setSelectedPath([]);
    } finally {
      setIsSubmittingMove(false);
    }
  };

  const handleSquareClick = async (row: number, col: number) => {
    if (!canAct) {
      return;
    }

    const clickedKey = toKey(row, col);

    if (selectedPath.length === 0) {
      if (!selectableStarts.has(clickedKey)) {
        return;
      }

      setSelectedPath([{ row, col }]);
      return;
    }

    const first = selectedPath[0];
    if (selectedPath.length > 0 && first.row === row && first.col === col) {
      setSelectedPath([]);
      return;
    }

    if (!nextTargets.has(clickedKey)) {
      if (selectableStarts.has(clickedKey)) {
        setSelectedPath([{ row, col }]);
      }
      return;
    }

    const nextPath = [...selectedPath, { row, col }];
    const exactMove = candidateMoves.find(
      (move) => move.path.length === nextPath.length && pathPrefixMatches(move.path, nextPath),
    );
    const hasLongerContinuation = candidateMoves.some(
      (move) => move.path.length > nextPath.length && pathPrefixMatches(move.path, nextPath),
    );

    if (exactMove && !hasLongerContinuation) {
      await submitMove(exactMove);
      return;
    }

    setSelectedPath(nextPath);
  };

  const handlePlayAgain = async () => {
    try {
      setIsReplaying(true);
      await onGameAction({ type: 'PLAY_AGAIN' });
      setSelectedPath([]);
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

  const redPlayer = playersById.get(state.playerIds[0]);
  const blackPlayer = playersById.get(state.playerIds[1]);

  if (!redPlayer || !blackPlayer) {
    return null;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1340px] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="shrink-0 rounded-[24px] border border-white/10 bg-slate-950/55 px-5 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Checkers</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{statusText}</h2>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100">
              Red: {redPlayer.name} ({state.scores[redPlayer.id] ?? 0})
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Black: {blackPlayer.name} ({state.scores[blackPlayer.id] ?? 0})
            </div>
            {state.phase === 'finished' && isHost ? (
              <button
                type="button"
                disabled={isReplaying}
                onClick={handlePlayAgain}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isReplaying ? 'Starting...' : 'Play again'}
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
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-h-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.82),rgba(15,23,42,0.72))] p-5 shadow-2xl shadow-slate-950/30">
          <div className="flex h-full min-h-0 items-center justify-center">
            <CheckersBoard
              board={state.board}
              selectedPath={selectedPath}
              selectableStarts={selectableStarts}
              nextTargets={nextTargets}
              lastMoveCells={lastMoveCells}
              onSquareClick={handleSquareClick}
            />
          </div>
        </div>

        <aside className="min-h-0 rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex h-full min-h-0 flex-col gap-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Round info</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Round</div>
                  <div className="mt-2 text-xl font-semibold text-white">{state.roundNumber}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Your side</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {playerColor ? `${playerColor[0].toUpperCase()}${playerColor.slice(1)}` : 'Viewer'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">No-progress count</div>
                  <div className="mt-2 text-xl font-semibold text-white">{state.movesSinceProgress}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
              Full rules in this version:
              mandatory captures, full multi-jump chains, kings, and a draw after long no-progress play.
            </div>

            {selectedPath.length > 0 ? (
              <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-4 text-sm leading-6 text-sky-50">
                Selected path: {selectedPath.map((position) => `(${position.row + 1}, ${position.col + 1})`).join(' -> ')}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
                Tap one of your highlighted movable pieces to begin. If a multi-jump is available, keep following the highlighted landing squares.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};
