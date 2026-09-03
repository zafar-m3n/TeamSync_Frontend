import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'
import Button from '../../../components/ui/Button'
import { useCreateRole } from '../../../hooks/useCreateRole'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
})

export default function NewRoleModal({ onClose }) {
  const mutation = useCreateRole()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = (values) => {
    const payload = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
    }
    mutation.mutate(payload, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New role"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-role-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Create role
          </Button>
        </>
      }
    >
      <form
        id="new-role-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="e.g. Auditor" {...register('name')} />
        </FormField>
        <FormField label="Description" error={errors.description?.message}>
          <Input multiline rows={3} {...register('description')} />
        </FormField>
      </form>
    </Modal>
  )
}
