import { useRef } from 'react'
import { usePageEnter } from '@/hooks/useMotion'
import DotGrid from '@/components/motion/reactbits/DotGrid'
import SplitText from '@/components/motion/reactbits/SplitText'
import favicon from '@/assets/favicon.png'

function Mark({ className = 'h-9 w-9' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-xs ${className}`}>
      <img src={favicon} alt="" className="h-full w-full object-contain" />
    </span>
  )
}

// Two panels on desktop (brand + form); on small screens a compact brand bar above the form.
export default function AuthLayout({ children }) {
  const formRef = useRef(null)
  usePageEnter(formRef, 'auth')

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 overflow-hidden bg-ink lg:flex">
        <div aria-hidden className="absolute inset-0">
          <DotGrid
            dotSize={3}
            gap={22}
            baseColor="#2a3236"
            activeColor="#5ed3cb"
            proximity={130}
            glow={0.4}
            fade={0.55}
            clickShock={false}
          />
        </div>
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Mark />
            <span className="text-display text-xl font-semibold text-white">TeamSync</span>
          </div>
          <div className="max-w-md">
            <SplitText
              tag="h2"
              text="Your team, in sync."
              className="text-display text-4xl font-semibold leading-tight text-white"
              textAlign="left"
              splitType="words"
              delay={70}
              duration={0.9}
            />
            <p className="mt-4 text-sm leading-relaxed text-ink-fg">
              Employees, attendance, leave, goals and training in one place for the whole team.
            </p>
          </div>
          <p className="text-xs text-ink-fg/60">Internal system · authorised staff only</p>
        </div>
      </aside>

      <header className="flex items-center gap-2.5 bg-ink px-5 py-4 lg:hidden">
        <Mark className="h-8 w-8" />
        <span className="text-display text-lg font-semibold text-white">TeamSync</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div ref={formRef} className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
