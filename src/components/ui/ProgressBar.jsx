import clsx from 'clsx'

const toneFill = {
  accent: 'bg-accent',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
}

export default function ProgressBar({ value, label, tone = 'accent', className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-gray-200">
        {/* Mounts at its final width (no entrance animation). The width
            transition only plays when `value` changes after mount. */}
        <div
          className={clsx(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            toneFill[tone] ?? toneFill.accent,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label != null && (
        <span className="w-10 shrink-0 text-right text-xs text-gray-500">{label}</span>
      )}
    </div>
  )
}
