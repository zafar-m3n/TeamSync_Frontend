import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { TOTAL_STEPS } from '@/pages/employees/form/employeeFormSchema'

// Non-clickable progress display. The label is a single truncating line so it
// can never wrap or overflow; the track fill is a % width; the status row is
// icon/dot only (flex-wrap purely as a safety net).
export default function Stepper({ steps, currentStep }) {
  const currentLabel = steps[currentStep - 1]?.label
  return (
    <div>
      <p className="truncate text-sm font-medium text-primary">
        Step {currentStep} of {TOTAL_STEPS} — {currentLabel}
      </p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-hidden>
        {steps.map((step) => {
          if (step.status === 'error') {
            return (
              <Icon
                key={step.label}
                icon="lucide:circle-alert"
                width="14"
                height="14"
                className="text-red-600"
              />
            )
          }
          if (step.status === 'complete') {
            return (
              <Icon
                key={step.label}
                icon="lucide:circle-check"
                width="14"
                height="14"
                className="text-accent"
              />
            )
          }
          return (
            <span
              key={step.label}
              className={clsx(
                'h-3.5 w-3.5 rounded-full',
                step.status === 'current' ? 'bg-accent' : 'bg-gray-200',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
