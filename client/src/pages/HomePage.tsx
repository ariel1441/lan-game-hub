import { Link } from 'react-router-dom';

const actionCardClassName =
  'group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/60 p-7 shadow-2xl shadow-slate-950/30 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-950/70 sm:p-8';

export const HomePage = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Choose how you want to play</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Host a room or join one in seconds
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
              Start with a simple shared lobby. Once everyone is connected, this same foundation will power Connect 4 and the rest of your multiplayer games.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 sm:grid-cols-3 sm:text-center lg:min-w-[360px]">
            <div>
              <div className="text-lg font-semibold text-white">1</div>
              <div className="mt-1">Host creates room</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">2</div>
              <div className="mt-1">Players join by code</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">3</div>
              <div className="mt-1">Lobby updates live</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Link to="/host" className={actionCardClassName}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_35%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              Host
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Create a room</h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Use this device as the host. You will create the room, keep the session running, and share the code with everyone else.
            </p>
            <div className="mt-8 inline-flex items-center rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition group-hover:bg-sky-300">
              Host a game
            </div>
          </div>
        </Link>

        <Link to="/join" className={actionCardClassName}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_35%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              Join
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Join a room</h3>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Open the app on your device, enter the room code from the host, and choose a display name to enter the shared lobby.
            </p>
            <div className="mt-8 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition group-hover:border-white/20 group-hover:bg-white/10">
              Join with a code
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
};
