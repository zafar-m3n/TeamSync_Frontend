import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'
import Button from '../../../components/ui/Button'
import { useCreateDepartment, useUpdateDepartment } from '../../../hooks/useDepartments'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
})

export default function DepartmentFormModal({ department, onClose }) {
  const isEdit = Boolean(department)
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: department?.name ?? '' },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate({ id: department.id, data: values }, { onSuccess: onClose })
    } else {
      createMutation.mutate(values, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit department' : 'New department'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="department-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create department'}
          </Button>
        </>
      }
    >
      <form
        id="department-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="e.g. Engineering" {...register('name')} />
        </FormField>
      </form>
    </Modal>
  )
}
