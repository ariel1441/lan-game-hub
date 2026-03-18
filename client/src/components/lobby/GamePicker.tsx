import type { GameSummary } from '../../types/room';

type GamePickerProps = {
  games: GameSummary[];
  selectedGameId: string | null;
  onSelect: (gameId: string) => void;
};

export const GamePicker = ({ games, selectedGameId, onSelect }: GamePickerProps) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Choose a game</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            The room supports multiple game modules. Pick one here, then start it once your players are ready.
          </p>
        </div>
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
          Host only
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {games.map((game) => {
          const isSelected = selectedGameId === game.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelect(game.id)}
              className={`w-full rounded-3xl border px-5 py-5 text-left transition ${
                isSelected
                  ? 'border-sky-400/50 bg-[linear-gradient(180deg,rgba(56,189,248,0.16),rgba(14,165,233,0.08))] shadow-lg shadow-sky-950/30'
                  : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.03))] hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold text-white">{game.name}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{game.description}</p>
                </div>
                {isSelected ? (
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Selected
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  {game.minPlayers === game.maxPlayers
                    ? `${game.minPlayers} players required`
                    : `${game.minPlayers}-${game.maxPlayers} players`}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {game.setup.mode === 'selected_players'
                    ? `${game.setup.minSelectedPlayers ?? game.minPlayers} host-selected players`
                    : 'All current room players join'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
