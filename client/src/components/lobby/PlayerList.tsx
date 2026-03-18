import type { PublicPlayer } from '../../types/room';

export const PlayerList = ({
  players,
  currentPlayerId,
}: {
  players: PublicPlayer[];
  currentPlayerId: string | null;
}) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Connected players</p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Lobby roster</h2>
        </div>
        <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
          {players.length} connected
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {players.map((player, index) => {
          const isYou = player.id === currentPlayerId;

          return (
            <li
              key={player.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.03))] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-white">{player.name}</p>
                  {isYou ? (
                    <span className="rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                      You
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{player.isHost ? 'Room host' : `Player ${index + 1}`}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {player.isHost ? (
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                    Host
                  </span>
                ) : null}
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Connected
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
