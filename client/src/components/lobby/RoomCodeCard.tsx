export const RoomCodeCard = ({ roomCode }: { roomCode: string }) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Room code</p>
      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-6 text-center">
        <div className="text-4xl font-semibold tracking-[0.42em] text-white sm:text-5xl">{roomCode}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">
        Share this code with players on the same local network so they can join your lobby from their own device.
      </p>
    </section>
  );
};
