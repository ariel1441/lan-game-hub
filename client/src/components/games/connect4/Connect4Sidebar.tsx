import type { PublicPlayer } from '../../../types/room';

type Connect4SidebarProps = {
  player: PublicPlayer;
  score: number;
  chip: 'R' | 'Y';
  isCurrentTurn: boolean;
  isWinner: boolean;
  align?: 'left' | 'right';
};

export const Connect4Sidebar = ({
  player,
  score,
  chip,
  isCurrentTurn,
  isWinner,
  align = 'left',
}: Connect4SidebarProps) => {
  const chipClassName =
    chip === 'R'
      ? 'border-rose-300/70 bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.32)]'
      : 'border-amber-200/80 bg-amber-300 shadow-[0_0_18px_rgba(253,224,71,0.26)]';

  const statusText = isWinner ? 'Winner' : isCurrentTurn ? 'Your move' : 'Waiting';

  return (
    <div className={`flex items-center gap-3 ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
      {align === 'right' ? (
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
          {score}
        </div>
      ) : null}

      <div className={`min-w-0 ${align === 'right' ? 'order-2' : ''}`}>
        <div className="truncate text-base font-semibold text-white">{player.name}</div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{statusText}</div>
      </div>

      <div className={`h-9 w-9 shrink-0 rounded-full border ${chipClassName} ${align === 'right' ? 'order-1' : ''}`} />

      {align === 'left' ? (
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
          {score}
        </div>
      ) : null}
    </div>
  );
};
