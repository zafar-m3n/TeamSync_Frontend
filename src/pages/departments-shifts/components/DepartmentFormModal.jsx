import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from 'react-select'
import clsx from 'clsx'
import Modal from '../../../components/ui/Modal'
import FormField from '../../../components/form/FormField'
import Input from '../../../components/form/Input'
import Button from '../../../components/ui/Button'
import { useCreateDepartment, useUpdateDepartment } from '../../../hooks/useDepartments'
import { useEmployees } from '../../../hooks/useEmployees'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  departmentHeadId: z.number().int().positive().nullable(),
})

const selectClassNames = {
  control: ({ isFocused }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
      isFocused ? 'border-accent ring-2 ring-accent' : 'border-gray-300',
    ),
  valueContainer: () => 'px-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  dropdownIndicator: () => 'px-1.5 text-gray-400',
  clearIndicator: () => 'px-1.5 text-gray-400 hover:text-text',
  indicatorSeparator: () => 'mx-1 w-px self-stretch bg-gray-200',
  menu: () => 'mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
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
                unstyled
                isClearable
                classNames={selectClassNames}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
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
