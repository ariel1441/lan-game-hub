import { useMemo, useState } from 'react';
import type { Connect4Cell } from '../../../types/room';

type Connect4BoardProps = {
  board: Connect4Cell[][];
  canPlay: boolean;
  currentPlayerChip: 'R' | 'Y';
  winningCells: { row: number; col: number }[];
  onDrop: (column: number) => void;
};

const cellClassName = (cell: Connect4Cell, isWinningCell: boolean): string => {
  const base =
    'aspect-square w-full rounded-full border shadow-[inset_0_-10px_20px_rgba(0,0,0,0.28)] transition duration-150';

  if (cell === 'R') {
    return `${base} border-rose-200/80 bg-rose-400 ${isWinningCell ? 'scale-105 ring-4 ring-rose-200/70' : ''}`;
  }

  if (cell === 'Y') {
    return `${base} border-amber-100/85 bg-amber-300 ${isWinningCell ? 'scale-105 ring-4 ring-amber-100/80' : ''}`;
  }

  return `${base} border-slate-950/70 bg-[#132235]`;
};

export const Connect4Board = ({ board, canPlay, currentPlayerChip, winningCells, onDrop }: Connect4BoardProps) => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const winningSet = useMemo(() => new Set(winningCells.map((cell) => `${cell.row}-${cell.col}`)), [winningCells]);

  const previewChipClass =
    currentPlayerChip === 'R'
      ? 'border-rose-200/70 bg-rose-400/95 shadow-[0_0_26px_rgba(251,113,133,0.3)]'
      : 'border-amber-100/80 bg-amber-300/95 shadow-[0_0_26px_rgba(253,224,71,0.24)]';

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <div className="relative h-full aspect-[7/6] w-auto max-w-full max-h-[720px]">
        <div className="relative h-full rounded-[32px] bg-[#35506a] p-[1.9%] shadow-[0_24px_70px_rgba(2,8,23,0.42)] ring-1 ring-white/5">
          <div className="pointer-events-none absolute inset-x-[2%] top-[2.2%] z-30 grid grid-cols-7 gap-[2.4%]">
            {Array.from({ length: 7 }).map((_, columnIndex) => (
              <div key={columnIndex} className="flex justify-center">
                <div
                  className={`aspect-square w-full max-w-full rounded-full border transition-all duration-150 ${
                    hoveredColumn === columnIndex && canPlay
                      ? `${previewChipClass} translate-y-0 opacity-100`
                      : 'translate-y-1 scale-90 border-transparent opacity-0'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-[2%] top-[2%] bottom-[2%] z-20 grid grid-cols-7 gap-[2.4%]">
            {Array.from({ length: 7 }).map((_, columnIndex) => (
              <button
                key={columnIndex}
                type="button"
                onClick={() => onDrop(columnIndex)}
                onMouseEnter={() => setHoveredColumn(columnIndex)}
                onFocus={() => setHoveredColumn(columnIndex)}
                onMouseLeave={() => setHoveredColumn((current) => (current === columnIndex ? null : current))}
                onBlur={() => setHoveredColumn((current) => (current === columnIndex ? null : current))}
                disabled={!canPlay}
                aria-label={`Drop piece in column ${columnIndex + 1}`}
                className={`rounded-[22px] transition duration-150 ${
                  canPlay ? 'cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] focus-visible:bg-white/[0.05]' : 'cursor-default'
                } ${hoveredColumn === columnIndex && canPlay ? 'bg-white/[0.06]' : ''}`}
              />
            ))}
          </div>

          <div className="pointer-events-none relative z-10 grid h-full grid-cols-7 gap-[2.4%]">
            {board.map((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <div key={`${rowIndex}-${columnIndex}`} className="flex items-center justify-center">
                  <div className={cellClassName(cell, winningSet.has(`${rowIndex}-${columnIndex}`))} />
                </div>
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
