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
            variant="accent"
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
        <p className="text-sm text-gray-500">
          Target: <span className="font-medium text-text">{goal.numericTarget}</span>
        </p>
        <FormField label="Actual Value" required error={errors.actualValue?.message}>
          <Input type="number" min="0" step="any" autoFocus {...register('actualValue')} />
        </FormField>
      </form>
    </Modal>
  )
}
