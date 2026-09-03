import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useSetLeaveQuota } from '@/hooks/useLeaveBalance'

const schema = z.object({
  totalDays: z.coerce.number().min(0, 'Cannot be negative'),
})

export default function SetQuotaModal({ employeeId, year, defaultTotalDays, onClose }) {
  const mutation = useSetLeaveQuota()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { totalDays: defaultTotalDays ?? 0 },
  })

  const onSubmit = (values) => {
    mutation.mutate(
      { employeeId, year, totalDays: values.totalDays },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Set leave quota (${year})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="set-quota-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Save
          </Button>
        </>
      }
    >
      <form
        id="set-quota-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Total Days" required error={errors.totalDays?.message}>
          <Input type="number" min="0" step="0.5" autoFocus {...register('totalDays')} />
        </FormField>
      </form>
    </Modal>
  )
}
