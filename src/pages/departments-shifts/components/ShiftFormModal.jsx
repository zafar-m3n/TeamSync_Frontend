import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MultiSelect from '@/components/ui/MultiSelect'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useCreateShift, useUpdateShift } from '@/hooks/useShift'

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
              <MultiSelect
                error={Boolean(errors.workingDays)}
                options={DAY_OPTIONS}
                value={DAY_OPTIONS.filter((o) => field.value?.includes(o.value))}
                onChange={(selected) =>
                  field.onChange(selected.map((option) => option.value))
                }
                onBlur={field.onBlur}
                placeholder="Select days…"
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
