import { useMemo, useState } from 'react';
import type { ImposterState, PublicRoom } from '../../../types/room';

type ImposterViewProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

export const ImposterView = ({
  room,
  currentPlayerId,
  isHost,
  onReturnToLobby,
  onGameAction,
}: ImposterViewProps) => {
  const [pendingVoteTargetId, setPendingVoteTargetId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const state = room.gameSession?.state as ImposterState | null;
  const playersById = useMemo(() => new Map(room.players.map((player) => [player.id, player])), [room.players]);

  if (!room.gameSession || !state) {
    return null;
  }

  const hasVoted = currentPlayerId ? state.votesSubmittedBy.includes(currentPlayerId) : false;
  const canVote = state.phase === 'voting' && !!currentPlayerId && !hasVoted && pendingVoteTargetId === null;
  const submittedCount = state.votesSubmittedBy.length;
  const totalPlayers = state.playerIds.length;

  const roleLabel = state.yourRole === 'imposter' ? 'You are the imposter' : 'You are crew';
  const statusText = state.phase === 'revealing_roles'
    ? roleLabel
    : state.phase === 'discussion'
      ? 'Discuss the hidden word'
      : state.phase === 'voting'
        ? hasVoted
          ? 'Vote locked in'
          : 'Vote for the imposter'
        : state.winner === 'crew'
          ? 'Crew wins'
          : 'Imposter wins';

  const subtitle = state.phase === 'revealing_roles'
    ? 'Make sure everyone understands their role before the discussion starts.'
    : state.phase === 'discussion'
      ? state.yourRole === 'crew'
        ? `Your secret word is: ${state.secretWord ?? 'Hidden'}`
        : 'Blend in. Everyone else knows the word and you do not.'
      : state.phase === 'voting'
        ? `${submittedCount} of ${totalPlayers} votes submitted.`
        : state.imposterPlayerId
          ? `${playersById.get(state.imposterPlayerId)?.name ?? 'The imposter'} was the imposter.`
          : 'The result is ready.';

  const handleHostAction = async (action: { type: string }) => {
    try {
      setIsAdvancing(true);
      await onGameAction(action);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleVote = async (targetPlayerId: string) => {
    if (!canVote) {
      return;
    }

    try {
      setPendingVoteTargetId(targetPlayerId);
      await onGameAction({
        type: 'CAST_VOTE',
        payload: { targetPlayerId },
      });
    } finally {
      setPendingVoteTargetId(null);
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
    <div className="mx-auto flex h-full w-full max-w-[1280px] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="shrink-0 rounded-[24px] border border-white/10 bg-slate-950/55 px-5 py-4 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Imposter</div>
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
            {isHost && state.phase === 'revealing_roles' ? (
              <button
                type="button"
                disabled={isAdvancing}
                onClick={() => handleHostAction({ type: 'START_DISCUSSION' })}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAdvancing ? 'Starting...' : 'Start discussion'}
              </button>
            ) : null}
            {isHost && state.phase === 'discussion' ? (
              <button
                type="button"
                disabled={isAdvancing}
                onClick={() => handleHostAction({ type: 'START_VOTING' })}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAdvancing ? 'Starting...' : 'Start voting'}
              </button>
            ) : null}
            {isHost && state.phase === 'result' ? (
              <button
                type="button"
                disabled={isAdvancing}
                onClick={() => handleHostAction({ type: 'NEXT_ROUND' })}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAdvancing ? 'Starting...' : 'Next round'}
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

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-0 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),linear-gradient(180deg,rgba(2,6,23,0.82),rgba(15,23,42,0.72))] p-5 shadow-2xl shadow-slate-950/30">
          <div className="flex h-full min-h-0 flex-col justify-between gap-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Role card</div>
              <div className={`mt-4 rounded-[28px] border px-6 py-6 ${
                state.yourRole === 'imposter'
                  ? 'border-rose-300/20 bg-rose-400/10'
                  : 'border-emerald-300/20 bg-emerald-400/10'
              }`}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300">
                  {state.yourRole === 'imposter' ? 'Imposter' : 'Crew'}
                </div>
                <h3 className="mt-3 text-3xl font-semibold text-white">
                  {state.yourRole === 'imposter' ? 'Blend in without the word.' : state.secretWord ?? 'Hidden word'}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {state.yourRole === 'imposter'
                    ? 'Listen carefully during discussion and try not to get exposed.'
                    : 'Use the secret word naturally enough that the imposter cannot spot it.'}
                </p>
              </div>
            </div>

            {state.phase === 'voting' ? (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Cast your vote</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {state.playerIds.map((playerId) => {
                    const player = playersById.get(playerId);

                    return (
                      <button
                        key={playerId}
                        type="button"
                        disabled={!canVote}
                        onClick={() => handleVote(playerId)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          canVote
                            ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                            : 'border-white/10 bg-white/5 opacity-80'
                        } ${pendingVoteTargetId === playerId ? 'border-sky-300/40 bg-sky-400/10' : ''}`}
                      >
                        <div className="font-semibold text-white">{player?.name ?? 'Unknown player'}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">Vote target</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : state.phase === 'result' ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Round result</div>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <div>Imposter: <span className="font-semibold text-white">{state.imposterPlayerId ? playersById.get(state.imposterPlayerId)?.name ?? 'Unknown' : 'Hidden'}</span></div>
                  <div>Secret word: <span className="font-semibold text-white">{state.secretWord ?? 'Hidden'}</span></div>
                  <div>Eliminated: <span className="font-semibold text-white">{state.eliminatedPlayerId ? playersById.get(state.eliminatedPlayerId)?.name ?? 'Nobody' : 'Nobody'}</span></div>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-6 text-slate-300">
                {state.phase === 'revealing_roles'
                  ? 'Make sure each player has read their role. The host can start the discussion when everyone is ready.'
                  : 'Talk, bluff, and observe. When the discussion is done, the host can move the room into voting.'}
              </div>
            )}
          </div>
        </div>

        <aside className="min-h-0 rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex h-full min-h-0 flex-col gap-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Players</div>
              <div className="mt-4 space-y-3">
                {state.playerIds.map((playerId) => {
                  const player = playersById.get(playerId);
                  const voted = state.votesSubmittedBy.includes(playerId);
                  const voteTargetName = state.votes?.[playerId]
                    ? playersById.get(state.votes[playerId])?.name ?? 'Unknown'
                    : null;

                  return (
                    <div
                      key={playerId}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">{player?.name ?? 'Unknown player'}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                            {state.phase === 'result'
                              ? voteTargetName
                                ? `Voted for ${voteTargetName}`
                                : 'No vote'
                              : state.phase === 'voting'
                                ? voted
                                  ? 'Vote submitted'
                                  : 'Waiting'
                                : 'In round'}
                          </div>
                        </div>

                        <div
                          className={`h-3 w-3 shrink-0 rounded-full ${
                            state.phase === 'result'
                              ? playerId === state.imposterPlayerId
                                ? 'bg-rose-400'
                                : playerId === state.eliminatedPlayerId
                                  ? 'bg-amber-300'
                                  : 'bg-slate-500'
                              : state.phase === 'voting' && voted
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

            {state.phase === 'voting' ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-200">Vote progress</div>
                  <div className="text-sm text-slate-300">{submittedCount} / {totalPlayers}</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all"
                    style={{ width: `${(submittedCount / Math.max(totalPlayers, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
                {state.phase === 'result'
                  ? state.winner === 'crew'
                    ? 'The room successfully found the imposter.'
                    : 'The imposter survived the vote and wins the round.'
                  : 'The player list stays visible throughout the round so everyone can track who is still in the game.'}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};
