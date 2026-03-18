import type { CheckersCell, CheckersMove, CheckersPosition } from '../../../types/room';
import { isPlayableSquare } from './checkers.helpers';

type CheckersBoardProps = {
  board: CheckersCell[][];
  selectedPath: CheckersPosition[];
  selectableStarts: Set<string>;
  nextTargets: Set<string>;
  lastMoveCells: Set<string>;
  onSquareClick: (row: number, col: number) => void;
};

const toKey = (row: number, col: number): string => `${row}-${col}`;

export const CheckersBoard = ({
  board,
  selectedPath,
  selectableStarts,
  nextTargets,
  lastMoveCells,
  onSquareClick,
}: CheckersBoardProps) => {
  const selectedSet = new Set(selectedPath.map((position) => toKey(position.row, position.col)));

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#10192b] shadow-[0_24px_70px_rgba(2,8,23,0.42)]">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const playable = isPlayableSquare(rowIndex, colIndex);
            const key = toKey(rowIndex, colIndex);
            const isSelectableStart = selectableStarts.has(key);
            const isNextTarget = nextTargets.has(key);
            const isSelected = selectedSet.has(key);
            const isLastMove = lastMoveCells.has(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSquareClick(rowIndex, colIndex)}
                className={`relative flex items-center justify-center transition ${
                  playable ? 'bg-[#35506a] hover:bg-[#3d5d7a]' : 'bg-[#e4d7c4]'
                } ${isSelected ? 'ring-2 ring-inset ring-sky-300' : ''} ${isLastMove ? 'shadow-[inset_0_0_0_100vmax_rgba(56,189,248,0.08)]' : ''}`}
              >
                {isNextTarget ? (
                  <div className="absolute h-4 w-4 rounded-full bg-sky-300/90 shadow-[0_0_18px_rgba(125,211,252,0.55)]" />
                ) : null}
                {cell ? (
                  <div
                    className={`relative flex h-[72%] w-[72%] items-center justify-center rounded-full border-2 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.28)] ${
                      cell.color === 'red'
                        ? 'border-rose-200/75 bg-rose-500'
                        : 'border-slate-200/75 bg-slate-900'
                    } ${isSelectableStart ? 'ring-4 ring-white/15' : ''}`}
                  >
                    {cell.kind === 'king' ? (
                      <div className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        cell.color === 'red'
                          ? 'border-rose-100/60 bg-rose-100/15 text-rose-50'
                          : 'border-white/30 bg-white/10 text-white'
                      }`}
                      >
                        K
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
};
