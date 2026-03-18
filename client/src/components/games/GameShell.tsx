import type { PublicRoom } from '../../types/room';
import { Connect4View } from './connect4/Connect4View';

type GameShellProps = {
  room: PublicRoom;
  currentPlayerId: string | null;
  isHost: boolean;
  onReturnToLobby: () => Promise<void>;
  onGameAction: (action: { type: string; payload?: unknown }) => Promise<void>;
};

export const GameShell = ({ room, currentPlayerId, isHost, onReturnToLobby, onGameAction }: GameShellProps) => {
  if (!room.gameSession) {
    return null;
  }

  if (room.gameSession.gameId === 'connect4') {
    return (
      <Connect4View
        room={room}
        currentPlayerId={currentPlayerId}
        isHost={isHost}
        onReturnToLobby={onReturnToLobby}
        onGameAction={onGameAction}
      />
    );
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 text-slate-200 shadow-2xl shadow-slate-950/20 backdrop-blur">
      <h2 className="text-2xl font-semibold text-white">Unsupported game renderer</h2>
      <p className="mt-3 text-sm text-slate-300">The selected game does not have a frontend renderer yet.</p>
    </section>
  );
};
