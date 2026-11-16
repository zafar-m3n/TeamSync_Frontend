import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useCreateRole } from '@/hooks/useCreateRole'
import { useUpdateRole } from '@/hooks/useUpdateRole'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'At most 50 characters'),
  description: z.string().trim().max(255, 'At most 255 characters').optional(),
})

// role: null = create, record = edit. Built-in roles keep their name.
export default function RoleFormModal({ role, onClose }) {
  const isEdit = Boolean(role)
  const nameLocked = isEdit && !role.isCustom
  const createMutation = useCreateRole()
  const updateMutation = useUpdateRole()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // A disabled field submits undefined, so drop the name rule when it's locked.
    resolver: zodResolver(nameLocked ? schema.omit({ name: true }) : schema),
    defaultValues: { name: role?.name ?? '', description: role?.description ?? '' },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      const data = {
        ...(nameLocked ? {} : { name: values.name }),
        description: values.description || null,
      }
      updateMutation.mutate({ id: role.id, data }, { onSuccess: onClose })
      return
    }
    const payload = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
    }
    createMutation.mutate(payload, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit role' : 'New role'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="role-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create role'}
          </Button>
        </>
      }
    >
      <form
        id="role-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <FormField label="Name" required error={errors.name?.message}>
            <Input
              autoFocus={!nameLocked}
              disabled={nameLocked}
              placeholder="Auditor"
              {...register('name')}
            />
          </FormField>
          {nameLocked && (
            <p className="text-xs text-gray-500">Built-in roles cannot be renamed.</p>
          )}
        </div>
        <FormField label="Description" error={errors.description?.message}>
          <Input
            multiline
            rows={3}
            autoFocus={nameLocked}
            placeholder="Read-only access to audit logs and compliance reports"
            {...register('description')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
