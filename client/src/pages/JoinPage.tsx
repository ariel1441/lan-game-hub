import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';

export const JoinPage = () => {
  const navigate = useNavigate();
  const { joinRoom, error, clearError } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setIsSubmitting(true);

    const result = await joinRoom(roomCode.toUpperCase(), playerName);
    setIsSubmitting(false);

    if (result.ok) {
      navigate(`/room/${result.roomCode}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
            Join setup
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Join an existing room</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            Get the room code from the host, enter your display name, and join the shared lobby from this device.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Before you join</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Be on the same local network as the host.</li>
              <li>• Enter the 4-letter room code exactly.</li>
              <li>• Pick the name this device should use in the lobby.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <label className="block">
            <span className="mb-3 block text-sm font-medium text-slate-200">Room code</span>
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-center text-xl font-semibold uppercase tracking-[0.35em] text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-slate-950"
              placeholder="ABCD"
              maxLength={4}
              autoFocus
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-3 block text-sm font-medium text-slate-200">Your display name</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:bg-slate-950"
              placeholder="Enter your name"
              maxLength={24}
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Joining room...' : 'Join room'}
          </button>

          <Link
            to="/"
            className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Back
          </Link>
        </form>
      </div>
    </div>
  );
};
