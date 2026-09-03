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
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useCreateGoal } from '@/hooks/useCreateGoal'
import { useUpdateGoal } from '@/hooks/useUpdateGoal'

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

function SingleDateField({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = parseYmd(value)

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
          style={{
            '--rdp-accent-color': '#059c99',
            '--rdp-accent-background-color': '#e6f4f3',
          }}
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

function buildSchema(mode) {
  return z.object({
    ...(mode === 'create'
      ? {
          employeeId: z
            .number({ message: 'Choose an employee' })
            .int()
            .positive('Choose an employee'),
        }
      : {}),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    numericTarget: z.coerce.number().positive('Must be greater than 0'),
    targetDate: z.string().min(1, 'Pick a target date'),
  })
}

export default function GoalFormModal({ goal, onClose }) {
  const isEdit = Boolean(goal)
  const mode = isEdit ? 'edit' : 'create'

  const { data: team = [] } = useMyTeam()
  const teamOptions = team.map((e) => ({ value: e.id, label: e.fullName }))

  const createMutation = useCreateGoal()
  const updateMutation = useUpdateGoal()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      ...(mode === 'create' ? { employeeId: undefined } : {}),
      title: goal?.title ?? '',
      description: goal?.description ?? '',
      numericTarget: goal?.numericTarget ?? '',
      targetDate: (goal?.targetDate ?? '').slice(0, 10),
    },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: goal.id,
          data: {
            title: values.title,
            ...(values.description ? { description: values.description } : {}),
            numericTarget: values.numericTarget,
            targetDate: values.targetDate,
          },
        },
        { onSuccess: onClose },
      )
    } else {
      createMutation.mutate(
        {
          employeeId: values.employeeId,
          title: values.title,
          ...(values.description ? { description: values.description } : {}),
          numericTarget: values.numericTarget,
          targetDate: values.targetDate,
        },
        { onSuccess: onClose },
      )
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit goal' : 'New goal'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="goal-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form
        id="goal-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {mode === 'create' && (
          <FormField label="Employee" required error={errors.employeeId?.message}>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select
                  unstyled
                  classNames={rsClassNames}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
                  options={teamOptions}
                  placeholder="Select a direct report…"
                  value={teamOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange(opt?.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>
        )}

        <FormField label="Title" required error={errors.title?.message}>
          <Input autoFocus {...register('title')} />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Input multiline rows={3} {...register('description')} />
        </FormField>

        <FormField label="Numeric Target" required error={errors.numericTarget?.message}>
          <Input type="number" min="0" step="any" {...register('numericTarget')} />
        </FormField>

        <FormField label="Target Date" required error={errors.targetDate?.message}>
          <Controller
            control={control}
            name="targetDate"
            render={({ field }) => (
              <SingleDateField value={field.value} onChange={field.onChange} />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
