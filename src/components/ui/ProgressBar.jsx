import clsx from 'clsx'

const toneFill = {
  accent: 'bg-brand-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

export default function ProgressBar({ value, label, tone = 'accent', className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-surface-hover"
      >
        {/* Mounts at its final width; the transition only plays when `value` changes. */}
        <div
          className={clsx('h-full rounded-full transition-[width] duration-500 ease-out', toneFill[tone] ?? toneFill.accent)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label != null && <span className="w-10 shrink-0 text-right text-xs tabular-nums text-fg-muted">{label}</span>}
    </div>
  )
}
