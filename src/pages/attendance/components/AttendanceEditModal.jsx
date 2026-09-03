import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from 'react-select'
import clsx from 'clsx'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'
import Button from '../../../components/ui/Button'
import { useUpdateAttendance } from '../../../hooks/useUpdateAttendance'

const STATUS_OPTIONS = ['Present', 'Late', 'Half-day', 'Absent'].map((s) => ({
  value: s,
  label: s,
}))

const schema = z.object({
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
  status: z.enum(['Present', 'Late', 'Half-day', 'Absent'], {
    message: 'Choose a status',
  }),
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

// `datetime-local` <-> ISO. The input is wall-clock local time with no zone;
// toISOString() attaches the browser's zone offset when sending.
function isoToLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToIso(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export default function AttendanceEditModal({ record, onClose }) {
  const mutation = useUpdateAttendance()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      clockIn: isoToLocalInput(record.clockIn),
      clockOut: isoToLocalInput(record.clockOut),
      status: record.status,
    },
  })

  const clockIn = watch('clockIn')
  const clockOut = watch('clockOut')

  const onSubmit = (values) => {
    mutation.mutate(
      {
        id: record.id,
        data: {
          clockIn: localInputToIso(values.clockIn),
          clockOut: localInputToIso(values.clockOut),
          status: values.status,
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit attendance record"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="attendance-edit-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="attendance-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Clock In" error={errors.clockIn?.message}>
          <div className="flex items-center gap-2">
            <Input type="datetime-local" {...register('clockIn')} />
            {clockIn && (
              <button
                type="button"
                onClick={() => setValue('clockIn', '', { shouldDirty: true })}
                className="shrink-0 text-xs text-gray-400 hover:text-text"
              >
                Clear
              </button>
            )}
          </div>
        </FormField>

        <FormField label="Clock Out" error={errors.clockOut?.message}>
          <div className="flex items-center gap-2">
            <Input type="datetime-local" {...register('clockOut')} />
            {clockOut && (
              <button
                type="button"
                onClick={() => setValue('clockOut', '', { shouldDirty: true })}
                className="shrink-0 text-xs text-gray-400 hover:text-text"
              >
                Clear
              </button>
            )}
          </div>
        </FormField>

        <FormField label="Status" required error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                unstyled
                classNames={rsClassNames}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
