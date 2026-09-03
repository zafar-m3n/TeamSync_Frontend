import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from 'react-select'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Button from '@/components/ui/Button'
import { useLeaveTypes } from '@/hooks/useLeaveTypes'
import { useSubmitLeaveRequest } from '@/hooks/useLeaveRequestMutations'
import { computeLeaveDays } from '@/pages/leave/utils/computeLeaveDays'

const schema = z
  .object({
    leaveTypeId: z
      .number({ message: 'Choose a leave type' })
      .int()
      .positive('Choose a leave type'),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    isHalfDay: z.boolean(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  })
  .refine((v) => !v.isHalfDay || v.startDate === v.endDate, {
    message: 'A half day must be a single date',
    path: ['endDate'],
  })

const rsClassNames = {
  control: ({ isFocused }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
      isFocused ? 'border-accent ring-2 ring-accent' : 'border-gray-300',
    ),
  valueContainer: () => 'px-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  dropdownIndicator: () => 'px-1.5 text-gray-400',
  indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
  menu: () => 'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
  menuList: () => 'py-1',
  option: ({ isFocused, isSelected }) =>
    clsx(
      'cursor-pointer px-3 py-2 text-sm',
      isSelected
        ? 'bg-accent text-white'
        : isFocused
          ? 'bg-gray-100 text-text'
          : 'text-text',
    ),
}

function toYmd(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function parseYmd(value) {
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

const POPOVER_STYLE = {
  '--rdp-accent-color': '#059c99',
  '--rdp-accent-background-color': '#e6f4f3',
}

function SingleDateField({ value, onChange }) {
  const { open, setOpen, ref } = usePopover()
  const selected = parseYmd(value)
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={selected ? 'text-text' : 'text-gray-400'}>
          {selected ? format(selected, 'PP') : 'Pick a date'}
        </span>
        <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={POPOVER_STYLE}
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              if (d) {
                onChange(toYmd(d))
                setOpen(false)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

function DateRangeField({ from, to, onChange }) {
  const { open, setOpen, ref } = usePopover()
  const value = { from: parseYmd(from), to: parseYmd(to) }
  const label = value.from
    ? value.to
      ? `${format(value.from, 'PP')} – ${format(value.to, 'PP')}`
      : `${format(value.from, 'PP')} – …`
    : 'Pick a date range'
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={value.from ? 'text-text' : 'text-gray-400'}>{label}</span>
        <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={POPOVER_STYLE}
        >
          <DayPicker
            mode="range"
            selected={value.from ? value : undefined}
            defaultMonth={value.from}
            onSelect={(range) =>
              onChange(
                range?.from ? toYmd(range.from) : '',
                range?.to ? toYmd(range.to) : '',
              )
            }
          />
        </div>
      )}
    </div>
  )
}

export default function LeaveRequestFormModal({ onClose }) {
  const { data: leaveTypes = [] } = useLeaveTypes()
  const submit = useSubmitLeaveRequest()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      leaveTypeId: undefined,
      startDate: '',
      endDate: '',
      isHalfDay: false,
    },
  })

  const isHalfDay = watch('isHalfDay')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // A half day must be a single date — mirror the backend's own rule so an
  // invalid start/end pair never reaches the API.
  useEffect(() => {
    if (isHalfDay && startDate) {
      setValue('endDate', startDate, { shouldValidate: true })
    }
  }, [isHalfDay, startDate, setValue])

  const typeOptions = leaveTypes.map((t) => ({ value: t.id, label: t.name }))

  const days =
    startDate && endDate
      ? computeLeaveDays(startDate, endDate, isHalfDay)
      : null

  const onSubmit = (values) => {
    submit.mutate(
      {
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.isHalfDay ? values.startDate : values.endDate,
        isHalfDay: values.isHalfDay,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Request leave"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submit.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="leave-request-form"
            variant="accent"
            isLoading={submit.isPending}
          >
            Submit request
          </Button>
        </>
      }
    >
      <form
        id="leave-request-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Leave Type" required error={errors.leaveTypeId?.message}>
          <Controller
            control={control}
            name="leaveTypeId"
            render={({ field }) => (
              <Select
                unstyled
                classNames={rsClassNames}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
                options={typeOptions}
                placeholder="Select a leave type…"
                value={typeOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...register('isHalfDay')} />
          Half day
        </label>

        {isHalfDay ? (
          <FormField label="Date" required error={errors.startDate?.message || errors.endDate?.message}>
            <SingleDateField
              value={startDate}
              onChange={(ymd) => {
                setValue('startDate', ymd, { shouldValidate: true })
                setValue('endDate', ymd, { shouldValidate: true })
              }}
            />
          </FormField>
        ) : (
          <FormField
            label="Dates"
            required
            error={errors.startDate?.message || errors.endDate?.message}
          >
            <DateRangeField
              from={startDate}
              to={endDate}
              onChange={(from, to) => {
                setValue('startDate', from, { shouldValidate: true })
                setValue('endDate', to, { shouldValidate: true })
              }}
            />
          </FormField>
        )}

        {days != null && (
          <p className="text-sm text-gray-500">
            {days} day{days === 1 ? '' : 's'}
          </p>
        )}
      </form>
    </Modal>
  )
}
