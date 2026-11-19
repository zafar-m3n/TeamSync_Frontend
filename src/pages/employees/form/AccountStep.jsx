import { Controller } from 'react-hook-form'
import Select from '@/components/ui/Select'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import { DateField } from '@/components/form/DatePicker'
import { DOB_FROM_YEAR, DOB_TO_YEAR, GENDER_OPTIONS } from '@/pages/employees/form/employeeFormSchema'
import Subheading from '@/pages/employees/form/Subheading'

export default function AccountStep({ form, mode, roleOptions, roleLocked }) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Subheading>Account</Subheading>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="off"
              placeholder="name@company.com"
              {...register('email')}
            />
          </FormField>
          {mode === 'create' && (
            <FormField
              label="Initial Password"
              required
              error={errors.initialPassword?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...register('initialPassword')}
              />
            </FormField>
          )}
          <FormField label="Role" required error={errors.roleId?.message}>
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <Select
                  options={roleOptions}
                  placeholder="Select a role…"
                  isDisabled={roleLocked}
                  value={
                    roleOptions.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) => field.onChange(opt?.value ?? undefined)}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <Subheading>Personal details</Subheading>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Full Name"
            required
            error={errors.fullName?.message}
          >
            <Input placeholder="Enter full name" {...register('fullName')} />
          </FormField>
          <FormField
            label="Employee Code"
            required
            error={errors.employeeCode?.message}
          >
            <Input placeholder="Enter employee code, e.g. EMP-001" {...register('employeeCode')} />
          </FormField>
          <FormField
            label="Date of Birth"
            error={errors.dob?.message}
          >
            <Controller
              control={control}
              name="dob"
              render={({ field }) => (
                <DateField
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  clearable
                  withDropdownNav
                  fromYear={DOB_FROM_YEAR}
                  toYear={DOB_TO_YEAR}
                />
              )}
            />
          </FormField>
          <FormField label="Gender" error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  isClearable
                  options={GENDER_OPTIONS}
                  placeholder="Select a gender…"
                  value={
                    GENDER_OPTIONS.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) => field.onChange(opt?.value ?? '')}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input placeholder="Enter phone number, e.g. +94 77 123 4567" {...register('phone')} />
          </FormField>
        </div>
      </div>
    </section>
  )
}
