import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartments'
import { useEmployees } from '@/hooks/useEmployees'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  departmentHeadId: z.number().int().positive().nullable(),
})

export default function DepartmentFormModal({ department, onClose }) {
  const isEdit = Boolean(department)
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const mutation = isEdit ? updateMutation : createMutation

  const { data: empData } = useEmployees({ page: 1, limit: 200 })
  const headOptions = (empData?.rows ?? []).map((e) => ({
    value: e.id,
    label: e.fullName,
  }))

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: department?.name ?? '',
      departmentHeadId: department?.departmentHead?.id ?? null,
    },
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

        <FormField label="Department Head" error={errors.departmentHeadId?.message}>
          <Controller
            control={control}
            name="departmentHeadId"
            render={({ field }) => (
              <Select
                isClearable
                options={headOptions}
                placeholder="No department head"
                value={headOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value ?? null)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
