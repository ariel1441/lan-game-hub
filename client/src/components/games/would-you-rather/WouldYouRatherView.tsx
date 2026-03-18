import { useMemo, useState } from 'react';
import type { PublicRoom, WouldYouRatherChoice, WouldYouRatherState } from '../../../types/room';

type WouldYouRatherViewProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

export const WouldYouRatherView = ({
  room,
  currentPlayerId,
  isHost,
  onReturnToLobby,
  onGameAction,
}: WouldYouRatherViewProps) => {
  const [pendingChoice, setPendingChoice] = useState<WouldYouRatherChoice | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isNextRoundLoading, setIsNextRoundLoading] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const state = room.gameSession?.state as WouldYouRatherState | null;
  const playersById = useMemo(() => new Map(room.players.map((player) => [player.id, player])), [room.players]);

  if (!room.gameSession || !state) {
    return null;
  }

  const submittedCount = state.submittedPlayerIds.length;
  const totalPlayers = state.playerIds.length;
  const hasAnswered = currentPlayerId ? state.submittedPlayerIds.includes(currentPlayerId) : false;
  const canAnswer = state.phase === 'answering' && !!currentPlayerId && !hasAnswered && pendingChoice === null;
  const canRevealEarly = isHost && state.phase === 'answering';
  const canStartNextRound = isHost && state.phase === 'revealed';

  const leftVoters = state.phase === 'revealed' && state.answers
    ? state.playerIds
      .filter((playerId) => state.answers?.[playerId] === 'left')
      .map((playerId) => playersById.get(playerId)?.name ?? 'Unknown')
    : [];
  const rightVoters = state.phase === 'revealed' && state.answers
    ? state.playerIds
      .filter((playerId) => state.answers?.[playerId] === 'right')
      .map((playerId) => playersById.get(playerId)?.name ?? 'Unknown')
    : [];

  const statusText = state.phase === 'revealed'
    ? 'Results are in'
    : hasAnswered
      ? 'Answer locked in'
      : canAnswer
        ? 'Choose your side'
        : 'Waiting for answers';

  const subtitle = state.phase === 'revealed'
    ? 'See how the room voted, then move to the next prompt.'
    : `${submittedCount} of ${totalPlayers} players have answered.`;

  const handleSubmit = async (choice: WouldYouRatherChoice) => {
    if (!canAnswer) {
      return;
    }

    try {
      setPendingChoice(choice);
      await onGameAction({
        type: 'SUBMIT_ANSWER',
        payload: { choice },
      });
    } finally {
      setPendingChoice(null);
    }
  };

  const handleReveal = async () => {
    try {
      setIsRevealing(true);
      await onGameAction({ type: 'REVEAL_RESULTS' });
    } finally {
      setIsRevealing(false);
    }
  };

  const handleNextRound = async () => {
    try {
      setIsNextRoundLoading(true);
      await onGameAction({ type: 'NEXT_ROUND' });
    } finally {
      setIsNextRoundLoading(false);
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
    <div className="mx-auto flex h-full w-full max-w-[1260px] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="shrink-0 rounded-[24px] border border-white/10 bg-slate-950/55 px-5 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Would You Rather</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{statusText}</h2>
            <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Round {state.roundNumber}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              {totalPlayers} players
            </div>
            {canRevealEarly ? (
              <button
                type="button"
                disabled={isRevealing}
                onClick={handleReveal}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRevealing ? 'Revealing...' : 'Reveal now'}
              </button>
            ) : null}
            {canStartNextRound ? (
              <button
                type="button"
                disabled={isNextRoundLoading}
                onClick={handleNextRound}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isNextRoundLoading ? 'Loading...' : 'Next round'}
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

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.82),rgba(15,23,42,0.72))] p-5 shadow-2xl shadow-slate-950/30">
          <div className="flex h-full min-h-0 flex-col justify-between gap-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">The prompt</div>
              <h3 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">Would you rather...</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                disabled={!canAnswer}
                onClick={() => handleSubmit('left')}
                className={`rounded-[28px] border px-6 py-8 text-left transition ${
                  canAnswer
                    ? 'border-rose-300/25 bg-rose-400/10 hover:bg-rose-400/16'
                    : 'border-white/10 bg-white/5'
                } ${pendingChoice === 'left' ? 'border-rose-300/40 bg-rose-400/18' : ''}`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-200">Option A</div>
                <div className="mt-4 text-2xl font-semibold leading-snug text-white">{state.prompt.left}</div>
                {state.phase === 'revealed' ? (
                  <div className="mt-5 text-sm text-rose-100/90">{state.answerCounts.left} votes</div>
                ) : null}
              </button>

              <button
                type="button"
                disabled={!canAnswer}
                onClick={() => handleSubmit('right')}
                className={`rounded-[28px] border px-6 py-8 text-left transition ${
                  canAnswer
                    ? 'border-amber-300/25 bg-amber-300/10 hover:bg-amber-300/16'
                    : 'border-white/10 bg-white/5'
                } ${pendingChoice === 'right' ? 'border-amber-300/40 bg-amber-300/18' : ''}`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100">Option B</div>
                <div className="mt-4 text-2xl font-semibold leading-snug text-white">{state.prompt.right}</div>
                {state.phase === 'revealed' ? (
                  <div className="mt-5 text-sm text-amber-100/90">{state.answerCounts.right} votes</div>
                ) : null}
              </button>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-200">Answer progress</div>
                <div className="text-sm text-slate-300">{submittedCount} / {totalPlayers}</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all"
                  style={{ width: `${(submittedCount / Math.max(totalPlayers, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="min-h-0 rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex h-full min-h-0 flex-col gap-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Players</div>
              <div className="mt-4 space-y-3">
                {state.playerIds.map((playerId) => {
                  const player = playersById.get(playerId);
                  const answered = state.submittedPlayerIds.includes(playerId);
                  const answer = state.answers?.[playerId] ?? null;

                  return (
                    <div
                      key={playerId}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">{player?.name ?? 'Unknown player'}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                            {state.phase === 'revealed'
                              ? answer === 'left'
                                ? 'Picked option A'
                                : answer === 'right'
                                  ? 'Picked option B'
                                  : 'No answer'
                              : answered
                                ? 'Answered'
                                : 'Waiting'}
                          </div>
                        </div>

                        <div
                          className={`h-3 w-3 shrink-0 rounded-full ${
                            state.phase === 'revealed'
                              ? answer === 'left'
                                ? 'bg-rose-400'
                                : answer === 'right'
                                  ? 'bg-amber-300'
                                  : 'bg-slate-600'
                              : answered
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {state.phase === 'revealed' ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-rose-300/15 bg-rose-400/10 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-200">Option A voters</div>
                  <div className="mt-3 text-sm leading-6 text-rose-50/90">
                    {leftVoters.length > 0 ? leftVoters.join(', ') : 'Nobody picked this side.'}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200/15 bg-amber-300/10 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100">Option B voters</div>
                  <div className="mt-3 text-sm leading-6 text-amber-50/90">
                    {rightVoters.length > 0 ? rightVoters.join(', ') : 'Nobody picked this side.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
                Votes stay hidden until the round is revealed. Everyone answers first, then the room sees the split.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};
