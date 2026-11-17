import { useEffect, useRef, useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import { CountUp, usePageEnter } from '@/hooks/useMotion'
import { prefersReducedMotion } from '@/lib/motion'
import { toast } from '@/hooks/useToast'

const ROWS = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  name: ['Sara Ahmed', 'Ali Raza', 'Hina Khan', 'Omar Farooq', 'Zara Malik', 'Bilal Shah', 'Ayesha Noor'][i % 7],
  dept: ['Engineering', 'HR', 'Operations', 'Finance'][i % 4],
}))

const COLUMNS = [
  { key: 'id', header: '#', className: 'w-12 tabular-nums text-fg-muted' },
  { key: 'name', header: 'Name', className: 'font-medium' },
  { key: 'dept', header: 'Department' },
]

function FakePage({ label }) {
  const ref = useRef(null)
  usePageEnter(ref, label)
  return (
    <div ref={ref} className="rounded-md border border-dashed border-line-strong/50 bg-canvas p-4">
      <p className="text-display text-lg font-semibold">{label}</p>
      <p className="text-cell text-fg-muted">Fade + 6px rise, 220ms. Re-runs on every route change.</p>
    </div>
  )
}

function useReducedMotionFlag() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export default function MotionSection() {
  const reduced = useReducedMotionFlag()
  const [page, setPage] = useState('Employees')
  const [tableKey, setTableKey] = useState(0)
  const [stats, setStats] = useState({ present: 42, leave: 6, pct: 87.5 })

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Motion presets (GSAP)"
        description="All presets jump to their end state when the OS asks for reduced motion."
        actions={
          <Badge dot tone={reduced ? 'warning' : 'success'}>
            {reduced ? 'Reduced motion: ON — nothing moves' : 'Reduced motion: off'}
          </Badge>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-fg-muted">Page transition</h3>
            <div className="flex gap-2">
              {['Employees', 'Leave', 'Attendance'].map((p) => (
                <Button key={p} size="sm" variant={p === page ? 'primary' : 'secondary'} onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <FakePage label={page} />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-fg-muted">Count-up (dashboards only)</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Present', stats.present],
                ['On leave', stats.leave],
                ['Attendance %', stats.pct],
              ].map(([label, v]) => (
                <div key={label} className="rounded-lg border border-line bg-surface p-3 shadow-xs">
                  <p className="text-display text-3xl font-semibold tabular-nums">
                    <CountUp value={v} />
                  </p>
                  <p className="text-cell text-fg-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setStats({
                    present: 30 + Math.round(Math.random() * 28),
                    leave: Math.round(Math.random() * 9),
                    pct: Math.round(700 + Math.random() * 300) / 10,
                  })
                }
              >
                New numbers
              </Button>
              <Button size="sm" variant="secondary" onClick={() => toast.success('Toast enter/exit uses the same module.')}>
                Toast
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Table rows: stagger on first load only"
        description="15ms apart, at most 10 rows animate; sorting and paging never animate."
        actions={
          <Button size="sm" variant="secondary" onClick={() => setTableKey((k) => k + 1)}>
            Replay (remount)
          </Button>
        }
      >
        <Table key={tableKey} columns={COLUMNS.map((c) => ({ ...c, sortable: c.key !== 'id' }))} rows={ROWS} />
      </Card>
    </div>
  )
}
