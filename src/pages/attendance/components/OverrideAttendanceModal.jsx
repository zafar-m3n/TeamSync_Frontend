import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Button from '@/components/ui/Button'
import { useOverrideAttendance } from '@/hooks/useOverrideAttendance'

// Absent is intentionally excluded — this endpoint can only move a record
// out of Absent, never back into it.
const STATUS_OPTIONS = ['Present', 'Late', 'Half-day'].map((s) => ({
  value: s,
  label: s,
}))

const schema = z.object({
  status: z.enum(['Present', 'Late', 'Half-day'], { message: 'Choose a status' }),
})

export default function OverrideAttendanceModal({ record, onClose }) {
  const mutation = useOverrideAttendance()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: undefined },
  })

  const onSubmit = (values) => {
    mutation.mutate(
      { id: record.id, status: values.status },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Correct attendance"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="attendance-override-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Confirm
          </Button>
        </>
      }
    >
      <form
        id="attendance-override-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <p className="text-sm text-gray-500">
          Change this record from <span className="font-medium text-text">Absent</span> to
          the correct status.
        </p>
        <FormField label="Status" required error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                options={STATUS_OPTIONS}
                placeholder="Select a status…"
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
