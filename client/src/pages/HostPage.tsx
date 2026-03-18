import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';

export const HostPage = () => {
  const navigate = useNavigate();
  const { createRoom, error, clearError } = useRoom();
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setIsSubmitting(true);

    const result = await createRoom(playerName);
    setIsSubmitting(false);

    if (result.ok) {
      navigate(`/room/${result.roomCode}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            Host setup
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Create a room on this device</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
            This device becomes the host. Keep it open, share the room code, and other players on the same local network can join from their own phones or computers.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">What happens next</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• You enter your display name.</li>
              <li>• A room code is created instantly.</li>
              <li>• Other players join with that code.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 sm:p-6">
          <label className="block">
            <span className="mb-3 block text-sm font-medium text-slate-200">Your display name</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3.5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-slate-950"
              placeholder="Enter your name"
              maxLength={24}
              autoFocus
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
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating room...' : 'Create room'}
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
