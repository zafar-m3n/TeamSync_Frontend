import { useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'
import Popover from '@/components/ui/Popover'
import { controlClass } from '@/components/form/controlStyles'
import { FieldContext, useFieldProps } from '@/components/form/fieldContext'
import Select from '@/components/ui/Select'

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

function Chevron({ orientation, className }) {
  const icon =
    { left: 'lucide:chevron-left', right: 'lucide:chevron-right', up: 'lucide:chevron-up' }[orientation] ??
    'lucide:chevron-down'
  return <Icon icon={icon} width="18" height="18" className={className} />
}

// Month / year pickers in the calendar caption, using the app's own Select so they
// match every other dropdown. react-day-picker expects a <select>-style change event.
// Compact: no separator, tighter arrow, so "September" and "2008" fit.
const CALENDAR_SELECT_CLASSES = {
  indicatorSeparator: () => 'hidden',
  dropdownIndicator: () => 'px-1 text-fg-subtle',
  valueContainer: () => 'flex items-center px-1 py-0.5',
}

function CalendarDropdown({ options = [], value, onChange, disabled, className, 'aria-label': ariaLabel }) {
  const isYear = className?.includes('years')
  const opts = options.map((o) => ({ value: o.value, label: o.label, disabled: o.disabled }))
  const current = opts.find((o) => o.value === Number(value)) ?? null
  return (
    // Reset the field context: these selects belong to the calendar, not the form
    // field the date picker sits in, so they must not take its id or error state.
    <FieldContext.Provider value={null}>
      <div className={isYear ? 'w-[5.5rem]' : 'w-[8.5rem]'}>
        <Select
          aria-label={ariaLabel}
          isDisabled={disabled}
          options={opts}
          value={current}
          isOptionDisabled={(o) => o.disabled}
          onChange={(opt) => opt && onChange?.({ target: { value: String(opt.value) } })}
          // Rendered inside the popover (not portalled) so picking an option counts
          // as a click inside the calendar and doesn't close it.
          menuPortalTarget={null}
          classNames={CALENDAR_SELECT_CLASSES}
          maxMenuHeight={224}
        />
      </div>
    </FieldContext.Provider>
  )
}

// Trigger + clear button + calendar popover shared by both fields. The popover hands
// focus back to the trigger when it closes, so selecting a day doesn't drop focus.
function PickerShell({ fieldProps, label, hasValue, placeholder, clearable, onClear, disabled, className, open, setOpen, children }) {
  const anchorRef = useRef(null)
  const field = useFieldProps(fieldProps)
  const showClear = clearable && hasValue && !disabled

  return (
    <div ref={anchorRef} className={clsx('relative', className || 'w-full')}>
      <button
        type="button"
        id={field.id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        onClick={() => setOpen((v) => !v)}
        className={controlClass({
          invalid: field.invalid,
          className: clsx('flex h-9 items-center justify-between gap-2 text-left', showClear ? 'pr-16' : 'pr-9'),
        })}
      >
        <span className={clsx('truncate', hasValue ? 'text-fg' : 'text-fg-subtle')}>{hasValue ? label : placeholder}</span>
      </button>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-fg-subtle">
        <Icon icon="lucide:calendar" width="16" height="16" aria-hidden />
      </span>
      {showClear && (
        <button
          type="button"
          onClick={(e) => {
            onClear()
            e.currentTarget.parentElement?.querySelector('button')?.focus()
          }}
          className="absolute inset-y-0 right-8 my-auto h-6 rounded px-1.5 text-xs text-fg-muted hover:bg-surface-hover hover:text-fg focus-visible:focus-ring"
        >
          Clear
        </button>
      )}
      <Popover
        open={open}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        role="dialog"
        aria-label="Choose date"
        className="ts-datepicker p-3"
      >
        {children}
      </Popover>
    </div>
  )
}

// Single date. value / onChange are YYYY-MM-DD strings ('' when empty).
// `withDropdownNav` adds month/year selects; `fromYear` / `toYear` bound them
// (defaults 1950 to next year).
export function DateField({
  value,
  onChange,
  placeholder = 'Select a date',
  clearable = false,
  withDropdownNav = false,
  fromYear,
  toYear,
  disabled = false,
  className,
  ...fieldProps
}) {
  const [open, setOpen] = useState(false)
  const selected = parseYmd(value)
  const firstYear = fromYear ?? 1950
  const lastYear = toYear ?? YEAR_NOW + 1
  const bounded = fromYear != null || toYear != null
  // Open on a month inside the allowed range (e.g. date of birth opens in the
  // latest allowed year, not this month).
  const today = new Date()
  const openMonth =
    selected ??
    (today.getFullYear() > lastYear ? new Date(lastYear, 11) : today.getFullYear() < firstYear ? new Date(firstYear, 0) : undefined)

  return (
    <PickerShell
      fieldProps={fieldProps}
      label={selected ? format(selected, 'PP') : ''}
      hasValue={Boolean(selected)}
      placeholder={placeholder}
      clearable={clearable}
      onClear={() => onChange('')}
      disabled={disabled}
      className={className}
      open={open}
      setOpen={setOpen}
    >
      <DayPicker
        mode="single"
        autoFocus
        components={{ Chevron, Dropdown: CalendarDropdown }}
        captionLayout={withDropdownNav ? 'dropdown' : undefined}
        reverseYears
        startMonth={withDropdownNav || bounded ? new Date(firstYear, 0) : undefined}
        endMonth={withDropdownNav || bounded ? new Date(lastYear, 11) : undefined}
        disabled={bounded ? [{ before: new Date(firstYear, 0, 1) }, { after: new Date(lastYear, 11, 31) }] : undefined}
        defaultMonth={openMonth}
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
    </PickerShell>
  )
}

// Date range. value is react-day-picker's { from?: Date, to?: Date } (or falsy);
// onChange receives that same shape (or undefined when cleared).
export function DateRangeField({
  value,
  onChange,
  placeholder = 'Select a date range',
  clearable = true,
  disabled = false,
  className,
  ...fieldProps
}) {
  const [open, setOpen] = useState(false)

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'PP')} – ${format(value.to, 'PP')}`
      : `${format(value.from, 'PP')} – …`
    : ''

  return (
    <PickerShell
      fieldProps={fieldProps}
      label={label}
      hasValue={Boolean(value?.from)}
      placeholder={placeholder}
      clearable={clearable}
      onClear={() => onChange(undefined)}
      disabled={disabled}
      className={className}
      open={open}
      setOpen={setOpen}
    >
      <DayPicker
        mode="range"
        autoFocus
        components={{ Chevron }}
        selected={value?.from ? value : undefined}
        defaultMonth={value?.from}
        onSelect={onChange}
      />
    </PickerShell>
  )
}
