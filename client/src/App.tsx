import { Outlet, useLocation } from 'react-router-dom';

export const App = () => {
  const location = useLocation();
  const isRoomRoute = location.pathname.startsWith('/room/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#071224_45%,_#0b1730_100%)] text-slate-100">
      <div
        className={`mx-auto flex w-full flex-col ${
          isRoomRoute
            ? 'h-screen max-w-none overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5'
            : 'min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        }`}
      >
        {!isRoomRoute ? (
          <header className="mb-8 rounded-[28px] border border-white/10 bg-slate-950/40 px-5 py-5 shadow-2xl shadow-slate-950/30 backdrop-blur sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300/90">LAN Game Hub</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Local multiplayer, one host, instant join
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  One device runs the room. Everyone else joins from the same local network with a short room code.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 sm:w-auto sm:max-w-xs">
                Works best when one laptop hosts and other players join from phones or browsers on the same network.
              </div>
            </div>
          </header>
        ) : null}

        <main className={`flex flex-1 ${isRoomRoute ? 'min-h-0 items-stretch' : 'items-center'}`}>
          <div className={`w-full ${isRoomRoute ? 'min-h-0' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
