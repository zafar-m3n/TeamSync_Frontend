import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from 'react-select'
import clsx from 'clsx'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'
import Button from '../../../components/ui/Button'
import { useCreateShift, useUpdateShift } from '../../../hooks/useShift'

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

const DAY_OPTIONS = [
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
]

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  startTime: z.string().regex(TIME_RE, 'Use HH:MM (24-hour)'),
  endTime: z.string().regex(TIME_RE, 'Use HH:MM (24-hour)'),
  gracePeriodMinutes: z.coerce
    .number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative'),
  workingDays: z
    .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))
    .min(1, 'Pick at least one day'),
})

function selectClassNames(hasError) {
  return {
    control: ({ isFocused }) =>
      clsx(
        'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
        isFocused
          ? 'border-accent ring-2 ring-accent'
          : hasError
            ? 'border-red-600'
            : 'border-gray-300',
      ),
    valueContainer: () => 'flex flex-wrap gap-1 py-1',
    placeholder: () => 'text-gray-400',
    input: () => 'text-sm text-text',
    multiValue: () => 'flex items-center rounded bg-gray-100',
    multiValueLabel: () => 'px-1.5 py-0.5 text-xs text-text',
    multiValueRemove: () =>
      'rounded-r px-1 text-gray-500 hover:bg-gray-200 hover:text-text',
    indicatorsContainer: () => 'flex items-center',
    dropdownIndicator: () => 'px-1.5 text-gray-400',
    clearIndicator: () => 'px-1.5 text-gray-400 hover:text-text',
    indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
    menu: () =>
      'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
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
    noOptionsMessage: () => 'px-3 py-2 text-sm text-gray-400',
  }
}

export default function ShiftFormModal({ shift, onClose }) {
  const isEdit = Boolean(shift)
  const createMutation = useCreateShift()
  const updateMutation = useUpdateShift()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shift?.name ?? '',
      // A time <input> only handles HH:MM; the backend accepts HH:MM and also
      // returns HH:MM:SS, so trim to HH:MM on the way in.
      startTime: (shift?.startTime ?? '').slice(0, 5),
      endTime: (shift?.endTime ?? '').slice(0, 5),
      gracePeriodMinutes: shift?.gracePeriodMinutes ?? 0,
      workingDays: shift?.workingDays ?? [],
    },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate({ id: shift.id, data: values }, { onSuccess: onClose })
    } else {
      createMutation.mutate(values, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit shift' : 'New shift'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="shift-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create shift'}
          </Button>
        </>
      }
    >
      <form
        id="shift-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="e.g. Morning shift" {...register('name')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Time" required error={errors.startTime?.message}>
            <Input type="time" {...register('startTime')} />
          </FormField>
          <FormField label="End Time" required error={errors.endTime?.message}>
            <Input type="time" {...register('endTime')} />
          </FormField>
        </div>

        <FormField
          label="Grace Period Minutes"
          required
          error={errors.gracePeriodMinutes?.message}
        >
          <Input type="number" min="0" step="1" {...register('gracePeriodMinutes')} />
        </FormField>

        <FormField label="Working Days" required error={errors.workingDays?.message}>
          <Controller
            control={control}
            name="workingDays"
            render={({ field }) => (
              <Select
                isMulti
                unstyled
                options={DAY_OPTIONS}
                value={DAY_OPTIONS.filter((o) => field.value?.includes(o.value))}
                onChange={(selected) =>
                  field.onChange(selected.map((option) => option.value))
                }
                onBlur={field.onBlur}
                placeholder="Select days…"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
                classNames={selectClassNames(Boolean(errors.workingDays))}
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
