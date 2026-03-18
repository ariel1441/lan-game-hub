import type { PropsWithChildren, ReactNode } from 'react';

export const GamePage = ({ children }: PropsWithChildren) => (
  <div className="mx-auto flex h-full w-full max-w-[1360px] min-h-0 flex-col gap-4 overflow-hidden">
    {children}
  </div>
);

export const GameHud = ({
  eyebrow,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  bottomSlot,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  bottomSlot?: ReactNode;
}) => (
  <section className="shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(8,15,30,0.94))] shadow-[0_22px_70px_rgba(2,8,23,0.32)]">
    <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">{eyebrow}</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        {leftSlot ? <div className="flex flex-wrap items-center gap-2 xl:justify-end">{leftSlot}</div> : null}
      </div>
      {rightSlot ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{rightSlot}</div> : null}
    </div>
    {bottomSlot ? (
      <div className="border-t border-white/8 bg-white/[0.02] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">{bottomSlot}</div>
      </div>
    ) : null}
  </section>
);

export const GamePanel = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => (
  <section
    className={`min-h-0 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,30,0.88),rgba(15,23,42,0.78))] p-5 shadow-[0_22px_60px_rgba(2,8,23,0.24)] ${className}`.trim()}
  >
    {children}
  </section>
);

export const GameBadge = ({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: 'neutral' | 'accent' | 'success' | 'danger' }>) => {
  const toneClassName = {
    neutral: 'border-white/10 bg-white/5 text-slate-200',
    accent: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  }[tone];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${toneClassName}`}>
      {children}
    </span>
  );
};

export const GamePrimaryButton = ({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {children}
  </button>
);

export const GameSecondaryButton = ({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
  >
    {children}
  </button>
);
