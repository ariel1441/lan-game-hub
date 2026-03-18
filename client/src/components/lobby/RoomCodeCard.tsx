export const RoomCodeCard = ({ roomCode }: { roomCode: string }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.88))] p-6 shadow-2xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Room code</p>
        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200">
          LAN join
        </span>
      </div>
      <div className="mt-4 rounded-3xl border border-sky-300/10 bg-slate-900/80 px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="font-mono text-4xl font-semibold tracking-[0.42em] text-white sm:text-5xl">{roomCode}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">
        Share this code with players on the same local network so they can join your lobby from their own device.
      </p>
    </section>
  );
};
