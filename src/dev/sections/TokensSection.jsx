const COLOR_GROUPS = [
  {
    title: 'Surfaces & text',
    tokens: ['canvas', 'surface', 'surface-subtle', 'surface-hover', 'line', 'line-strong', 'fg', 'fg-muted', 'fg-subtle'],
  },
  { title: 'Brand', tokens: ['brand-50', 'brand-100', 'brand-500', 'brand-600', 'brand-700', 'on-brand'] },
  {
    title: 'Status',
    tokens: ['success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft', 'danger-solid', 'info', 'info-soft'],
  },
  { title: 'Sidebar ink', tokens: ['ink', 'ink-hover', 'ink-fg', 'ink-active'] },
]

const TYPE_SCALE = [
  ['text-xs', '12 · captions, badges'],
  ['text-cell', '13 · table cells, hints'],
  ['text-sm', '14 · base UI'],
  ['text-base', '16 · card titles'],
  ['text-lg', '18'],
  ['text-xl', '20 · page title (mobile)'],
  ['text-2xl', '24 · page title'],
  ['text-3xl', '30 · stat numbers'],
  ['text-4xl', '36 · login heading'],
]

const RADII = ['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full']
const SHADOWS = ['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg']

const STATUS_PAIRS = [
  ['bg-success-soft text-success', 'Success'],
  ['bg-warning-soft text-warning', 'Warning'],
  ['bg-danger-soft text-danger', 'Danger'],
  ['bg-info-soft text-info', 'Info'],
  ['bg-brand-50 text-brand-700', 'Brand'],
]

export default function TokensSection() {
  return (
    <div className="flex flex-col gap-6">
      {COLOR_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="mb-2 text-sm font-semibold text-fg-muted">{group.title}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {group.tokens.map((t) => (
              <div key={t} className="overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
                <div className="h-12" style={{ backgroundColor: `var(--color-${t})` }} />
                <p className="px-2 py-1.5 font-mono text-xs text-fg-muted">{t}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-fg-muted">Status text on soft backgrounds</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_PAIRS.map(([cls, label]) => (
            <span key={label} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-fg-muted">Type scale (Inter)</h3>
          <ul className="flex flex-col gap-1">
            {TYPE_SCALE.map(([cls, note]) => (
              <li key={cls} className="flex items-baseline justify-between gap-4">
                <span className={cls}>The quick brown fox</span>
                <span className="shrink-0 font-mono text-xs text-fg-subtle">{cls} · {note}</span>
              </li>
            ))}
          </ul>
          <p className="text-display mt-4 text-3xl font-semibold tabular-nums">Outfit 1,284</p>
          <p className="text-cell text-fg-muted">Display face for page titles, stat numbers and the login heading.</p>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-fg-muted">Radius</h3>
          <div className="flex flex-wrap gap-3">
            {RADII.map((r) => (
              <div key={r} className={`flex h-16 w-20 items-end bg-brand-50 p-1.5 font-mono text-[11px] text-brand-700 ${r}`}>{r.replace('rounded-', '')}</div>
            ))}
          </div>
          <h3 className="mb-3 mt-5 text-sm font-semibold text-fg-muted">Shadows</h3>
          <div className="flex flex-wrap gap-4 bg-canvas p-3">
            {SHADOWS.map((s) => (
              <div key={s} className={`flex h-16 w-24 items-end rounded-lg bg-surface p-1.5 font-mono text-[11px] text-fg-muted ${s}`}>{s}</div>
            ))}
          </div>
          <h3 className="mb-3 mt-5 text-sm font-semibold text-fg-muted">Focus ring</h3>
          <div className="flex h-9 w-40 items-center rounded-md border border-brand-600 bg-surface px-3 text-sm focus-ring">Focused control</div>
        </div>
      </div>
    </div>
  )
}
