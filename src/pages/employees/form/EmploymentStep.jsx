import { Controller, useWatch } from 'react-hook-form'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import { DateField } from '@/components/form/DatePicker'
import EmployeeSearchSelect from '@/components/form/EmployeeSearchSelect'
import { isLeaving } from '@/pages/employees/utils/employmentStatus'
import { EMPLOYMENT_OPTIONS, STATUS_OPTIONS } from '@/pages/employees/form/employeeFormSchema'

export default function EmploymentStep({ form, departmentOptions, manager, onManagerChange }) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form
  const leaving = isLeaving(useWatch({ control, name: 'employmentStatus' }))

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Department" error={errors.departmentId?.message}>
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                isClearable
                options={departmentOptions}
                placeholder="Select a department…"
                value={
                  departmentOptions.find((o) => o.value === field.value) ??
                  null
                }
                onChange={(opt) => field.onChange(opt?.value ?? null)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
        <FormField label="Designation" error={errors.designation?.message}>
          <Input placeholder="Enter job title" {...register('designation')} />
        </FormField>
        <FormField
          label="Date of Joining"
          error={errors.dateOfJoining?.message}
        >
          <Controller
            control={control}
            name="dateOfJoining"
            render={({ field }) => (
              <DateField
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                clearable
                withDropdownNav
              />
            )}
          />
        </FormField>
        <FormField
          label="Employment Type"
          error={errors.employmentType?.message}
        >
          <Controller
            control={control}
            name="employmentType"
            render={({ field }) => (
              <Select
                isClearable
                options={EMPLOYMENT_OPTIONS}
                placeholder="Select a type…"
                value={
                  EMPLOYMENT_OPTIONS.find((o) => o.value === field.value) ??
                  null
                }
                onChange={(opt) => field.onChange(opt?.value ?? '')}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
        <FormField label="Status" required error={errors.employmentStatus?.message}>
          <Controller
            control={control}
            name="employmentStatus"
            render={({ field }) => (
              <Select
                options={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => {
                  field.onChange(opt.value)
                  if (!isLeaving(opt.value)) {
                    setValue('terminationDate', '', { shouldValidate: true })
                  }
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
        {leaving && (
          <FormField
            label="Termination Date"
            required
            error={errors.terminationDate?.message}
          >
            <Controller
              control={control}
              name="terminationDate"
              render={({ field }) => (
                <DateField
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  withDropdownNav
                />
              )}
            />
          </FormField>
        )}
        <FormField label="Manager" error={errors.managerId?.message}>
          <Controller
            control={control}
            name="managerId"
            render={({ field }) => (
              <EmployeeSearchSelect
                placeholder="Search for a manager…"
                value={manager}
                onChange={(opt) => {
                  onManagerChange(opt ?? null)
                  field.onChange(opt?.value ?? null)
                }}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>
      </div>
    </section>
  )
}
