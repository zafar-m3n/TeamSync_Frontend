import { useState } from 'react'
import clsx from 'clsx'
import TokensSection from '@/dev/sections/TokensSection'
import FormControlsSection from '@/dev/sections/FormControlsSection'
import OverlaysSection from '@/dev/sections/OverlaysSection'
import DataDisplaySection from '@/dev/sections/DataDisplaySection'
import MotionSection from '@/dev/sections/MotionSection'

const SECTIONS = [
  { id: 'tokens', label: 'Tokens', Component: TokensSection },
  { id: 'form-controls', label: 'Form controls', Component: FormControlsSection },
  { id: 'overlays', label: 'Overlays & feedback', Component: OverlaysSection },
  { id: 'data', label: 'Data display', Component: DataDisplaySection },
  { id: 'motion', label: 'Motion', Component: MotionSection },
]

export default function ComponentGallery() {
  const [dark, setDark] = useState(false)

  return (
    <div data-theme={dark ? 'dark' : undefined} className="-mx-4 -my-6 bg-canvas px-4 py-6 text-fg sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-display text-2xl font-semibold">Component gallery</h1>
            <p className="text-sm text-fg-muted">Development only. Not included in production builds.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="rounded-md px-2 py-1 text-brand-700 hover:bg-brand-50 focus-visible:focus-ring">
                {s.label}
              </a>
            ))}
            <label className="ml-2 inline-flex items-center gap-2 text-fg-muted">
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
              Preview dark tokens
            </label>
          </nav>
        </header>
        {SECTIONS.map(({ id, label, Component }) => (
          <section key={id} id={id} className="scroll-mt-20">
            <h2 className={clsx('text-display mb-4 text-xl font-semibold')}>{label}</h2>
            <Component />
          </section>
        ))}
      </div>
    </div>
  )
}
