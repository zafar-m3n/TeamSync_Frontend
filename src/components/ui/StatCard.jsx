import clsx from 'clsx'

const toneText = {
  neutral: 'text-primary',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  info: 'text-sky-600',
}

export default function StatCard({ value, label, tone = 'neutral', children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className={clsx('text-3xl font-semibold', toneText[tone] ?? toneText.neutral)}>
        {value}
      </p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {children != null && <div className="mt-3 text-sm text-text">{children}</div>}
    </div>
  )
}
