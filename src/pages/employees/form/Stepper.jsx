import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { TOTAL_STEPS } from '@/pages/employees/form/employeeFormSchema'

const STATUS_TEXT = { complete: 'completed', error: 'has errors', current: 'current step', upcoming: 'not started' }

function Marker({ index, status }) {
  return (
    <span
      className={clsx(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-(--duration-base)',
        status === 'current' && 'bg-brand-600 text-on-brand shadow-xs',
        status === 'complete' && 'bg-brand-50 text-brand-700 ring-1 ring-brand-100',
        status === 'error' && 'bg-danger-soft text-danger ring-1 ring-danger/30',
        status === 'upcoming' && 'bg-surface text-fg-subtle ring-1 ring-line-strong/60',
      )}
    >
      {status === 'complete' ? (
        <Icon icon="lucide:check" width="14" height="14" aria-hidden />
      ) : status === 'error' ? (
        <Icon icon="lucide:circle-alert" width="14" height="14" aria-hidden />
      ) : (
        index + 1
      )}
    </span>
  )
}

// Non-clickable progress display. Wide screens show every step with its label;
// narrow ones show "Step n of N — label" with a progress track.
export default function Stepper({ steps, currentStep }) {
  const currentLabel = steps[currentStep - 1]?.label
  return (
    <div>
      <ol className="hidden md:flex">
        {steps.map((step, i) => (
          <li
            key={step.label}
            aria-current={step.status === 'current' ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col gap-2"
          >
            <div className="flex items-center">
              <Marker index={i} status={step.status} />
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={clsx(
                    'mx-2 h-px flex-1 transition-colors duration-(--duration-base)',
                    i + 1 < currentStep ? 'bg-brand-500' : 'bg-line-strong/60',
                  )}
                />
              )}
            </div>
            <span
              className={clsx(
                'pr-3 text-xs font-medium leading-snug',
                step.status === 'current' ? 'text-fg' : step.status === 'error' ? 'text-danger' : 'text-fg-muted',
              )}
            >
              {step.label}
              <span className="sr-only"> ({STATUS_TEXT[step.status]})</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="md:hidden">
        <p className="truncate text-sm font-medium text-fg">
          Step {currentStep} of {TOTAL_STEPS} — {currentLabel}
        </p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-hover" aria-hidden>
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
