import { Outlet, useLocation } from 'react-router-dom';

export const App = () => {
  const location = useLocation();
  const isRoomRoute = location.pathname.startsWith('/room/');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.08),_transparent_26%),linear-gradient(180deg,_#030712_0%,_#09111f_42%,_#0f1b31_100%)] text-slate-100">
      <div
        className={`mx-auto flex w-full flex-col ${
          isRoomRoute
            ? 'min-h-screen max-w-none overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5'
            : 'min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        }`}
      >
        {!isRoomRoute ? (
          <header className="mb-8 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.78),rgba(8,15,30,0.86))] px-5 py-5 shadow-[0_24px_70px_rgba(2,8,23,0.3)] backdrop-blur sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/90">LAN Game Hub</p>
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

        <main className={`flex flex-1 ${isRoomRoute ? 'items-stretch' : 'items-center'}`}>
          <div className={`w-full ${isRoomRoute ? '' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
