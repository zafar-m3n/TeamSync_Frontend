import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'

const YEAR_NOW = new Date().getFullYear()

export function toYmd(date) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function parseYmd(value) {
  if (!value) return undefined
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return { open, setOpen, ref }
}

const triggerBase =
  'flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent'

const popoverClass =
  'ts-datepicker absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-lg'

function Chevron({ orientation, className }) {
  const icon =
    orientation === 'left'
      ? 'lucide:chevron-left'
      : orientation === 'right'
        ? 'lucide:chevron-right'
        : orientation === 'up'
          ? 'lucide:chevron-up'
          : 'lucide:chevron-down'
  return <Icon icon={icon} width="18" height="18" className={className} />
}

function ClearButton({ onClear }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        onClear()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
          onClear()
        }
      }}
      className="rounded text-xs text-gray-400 hover:text-text"
    >
      Clear
    </span>
  )
}

// Single date. value / onChange are YYYY-MM-DD strings ('' when empty).
export function DateField({
  id,
  value,
  onChange,
  placeholder = 'Select a date',
  clearable = false,
  withDropdownNav = false,
  className,
}) {
  const { open, setOpen, ref } = usePopover()
  const selected = parseYmd(value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        className={clsx(triggerBase, className || 'w-full')}
      >
        <span className={selected ? 'text-text' : 'text-gray-400'}>
          {selected ? format(selected, 'PP') : placeholder}
        </span>
        <span className="flex items-center gap-2">
          {clearable && value ? <ClearButton onClear={() => onChange('')} /> : null}
          <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div className={popoverClass}>
          <DayPicker
            mode="single"
            components={{ Chevron }}
            captionLayout={withDropdownNav ? 'dropdown' : undefined}
            startMonth={withDropdownNav ? new Date(1950, 0) : undefined}
            endMonth={withDropdownNav ? new Date(YEAR_NOW + 1, 11) : undefined}
            defaultMonth={selected}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(toYmd(d))
                setOpen(false)
              } else if (clearable) {
                onChange('')
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

// Date range. value is react-day-picker's { from?: Date, to?: Date } (or falsy);
// onChange receives that same shape (or undefined when cleared).
export function DateRangeField({
  value,
  onChange,
  placeholder = 'Select a date range',
  clearable = true,
  className,
}) {
  const { open, setOpen, ref } = usePopover()

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'PP')} – ${format(value.to, 'PP')}`
      : `${format(value.from, 'PP')} – …`
    : placeholder

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(triggerBase, className || 'w-full')}
      >
        <span className={value?.from ? 'text-text' : 'text-gray-400'}>{label}</span>
        <span className="flex items-center gap-2">
          {clearable && value?.from ? (
            <ClearButton onClear={() => onChange(undefined)} />
          ) : null}
          <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div className={popoverClass}>
          <DayPicker
            mode="range"
            components={{ Chevron }}
            selected={value?.from ? value : undefined}
            defaultMonth={value?.from}
            onSelect={onChange}
          />
        </div>
      )}
    </div>
  )
}
