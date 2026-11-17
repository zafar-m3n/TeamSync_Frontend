import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useRecordActual } from '@/hooks/useRecordActual'

const schema = z.object({
  actualValue: z.coerce.number().min(0, 'Cannot be negative'),
})

export default function RecordActualModal({ goal, onClose }) {
  const mutation = useRecordActual()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { actualValue: goal.actualValue ?? 0 },
  })

  const onSubmit = (values) => {
    mutation.mutate(
      { id: goal.id, actualValue: values.actualValue },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Record progress"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="record-actual-form"
            variant="primary"
            isLoading={mutation.isPending}
          >
            Save
          </Button>
        </>
      }
    >
      <form
        id="record-actual-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="rounded-lg border border-line bg-surface-subtle px-4 py-3">
          <p className="truncate text-sm font-medium text-fg">{goal.title}</p>
          <dl className="mt-2 flex gap-6 text-sm">
            <div>
              <dt className="text-xs text-fg-muted">Target</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-fg">{goal.numericTarget}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Current</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-fg">{goal.actualValue ?? '—'}</dd>
            </div>
          </dl>
        </div>
        <FormField label="Actual Value" required error={errors.actualValue?.message}>
          <Input
            type="number"
            min="0"
            step="any"
            autoFocus
            placeholder="35"
            {...register('actualValue')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
