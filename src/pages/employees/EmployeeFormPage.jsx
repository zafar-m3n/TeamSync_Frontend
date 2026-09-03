import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from 'react-select'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/store/AuthContext'
import { toast } from '@/hooks/useToast'
import { useRoles } from '@/hooks/useRoles'
import { useDepartments } from '@/hooks/useDepartments'
import { useEmployees, useCreateEmployee } from '@/hooks/useEmployees'
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployee'
import ContactFields from '@/pages/employees/components/ContactFields'
import BankingFields from '@/pages/employees/components/BankingFields'

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Probation']

// NOTE: field names below are inferred (camelCase, YYYY-MM-DD dates); reconcile
// against the backend createEmployee/updateEmployee zod schemas once available.
const optionalStr = z.string().trim().optional()

const contactSchema = z.object({
  addressLine1: optionalStr,
  addressLine2: optionalStr,
  state: optionalStr,
  country: optionalStr,
  postalCode: optionalStr,
  emergencyContactName: optionalStr,
  emergencyContactRelationship: optionalStr,
  emergencyContactPhone: optionalStr,
})

const bankingSchema = z.object({
  bankName: optionalStr,
  accountHolderName: optionalStr,
  accountNumber: optionalStr,
  bankBranch: optionalStr,
})

function buildSchema(mode) {
  return z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    ...(mode === 'create'
      ? { initialPassword: z.string().min(8, 'At least 8 characters') }
      : {}),
    roleId: z
      .number({ message: 'Role is required' })
      .int()
      .positive('Role is required'),
    fullName: z.string().trim().min(1, 'Full name is required'),
    employeeCode: z.string().trim().min(1, 'Employee code is required'),
    dateOfBirth: optionalStr,
    gender: optionalStr,
    phone: optionalStr,
    departmentId: z.number().int().positive().nullable().optional(),
    designation: optionalStr,
    dateOfJoining: optionalStr,
    employmentType: optionalStr,
    managerId: z.number().int().positive().nullable().optional(),
    contact: contactSchema,
    banking: bankingSchema,
  })
}

const EMPTY_CONTACT = {
  addressLine1: '',
  addressLine2: '',
  state: '',
  country: '',
  postalCode: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
}
const EMPTY_BANKING = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  bankBranch: '',
}

function toFormValues(emp) {
  return {
    email: emp.email ?? '',
    roleId: emp.role?.id ?? emp.roleId ?? undefined,
    fullName: emp.fullName ?? '',
    employeeCode: emp.employeeCode ?? '',
    dateOfBirth: (emp.dateOfBirth ?? '').slice(0, 10),
    gender: emp.gender ?? '',
    phone: emp.phone ?? '',
    departmentId: emp.department?.id ?? emp.departmentId ?? null,
    designation: emp.designation ?? '',
    dateOfJoining: (emp.dateOfJoining ?? '').slice(0, 10),
    employmentType: emp.employmentType ?? '',
    managerId: emp.manager?.id ?? emp.managerId ?? null,
    contact: { ...EMPTY_CONTACT, ...(emp.contact ?? {}) },
    banking: { ...EMPTY_BANKING, ...(emp.banking ?? {}) },
  }
}

function cleanObject(obj) {
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue
    out[key] = value
  }
  return out
}

function toYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseYmd(value) {
  if (!value) return undefined
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

const YEAR_NOW = new Date().getFullYear()

function DateField({ id, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = parseYmd(value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={selected ? 'text-text' : 'text-gray-400'}>
          {selected ? format(selected, 'PP') : 'Select a date'}
        </span>
        <span className="flex items-center gap-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  onChange('')
                }
              }}
              className="text-xs text-gray-400 hover:text-text"
            >
              Clear
            </span>
          )}
          <Icon icon="lucide:calendar" width="16" height="16" className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 z-40 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          style={{ '--rdp-accent-color': '#059c99', '--rdp-accent-background-color': '#e6f4f3' }}
        >
          <DayPicker
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(1950, 0)}
            endMonth={new Date(YEAR_NOW + 1, 11)}
            defaultMonth={selected}
            selected={selected}
            onSelect={(d) => {
              onChange(d ? toYmd(d) : '')
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

const rsClassNames = {
  control: ({ isFocused }) =>
    clsx(
      'flex min-h-[38px] items-center rounded-md border bg-white pl-2 pr-1 text-sm transition-colors',
      isFocused ? 'border-accent ring-2 ring-accent' : 'border-gray-300',
    ),
  valueContainer: () => 'flex flex-wrap gap-1 py-1',
  placeholder: () => 'text-gray-400',
  singleValue: () => 'text-text',
  input: () => 'text-sm text-text',
  indicatorsContainer: () => 'flex items-center',
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

function RSelect(props) {
  return (
    <Select
      unstyled
      classNames={rsClassNames}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
      {...props}
    />
  )
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SectionHeading({ children, hint }) {
  return (
    <div className="border-b border-gray-200 pb-2">
      <h2 className="text-lg text-primary">{children}</h2>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export default function EmployeeFormPage({ mode }) {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const roleSeg = user.roleName.toLowerCase()
  const isEdit = mode === 'edit'

  const { data: employee, isLoading: loadingEmployee, isError: employeeError } =
    useEmployee(isEdit ? employeeId : undefined)

  const { data: roles = [] } = useRoles()
  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departments = deptData?.rows ?? []

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const mutation = isEdit ? updateMutation : createMutation

  const [managerQuery, setManagerQuery] = useState('')
  const debouncedManagerQuery = useDebouncedValue(managerQuery.trim(), 300)
  const { data: managerData } = useEmployees({
    page: 1,
    limit: 20,
    ...(debouncedManagerQuery ? { search: debouncedManagerQuery } : {}),
  })
  const managerOptions = (managerData?.rows ?? []).map((e) => ({
    value: e.id,
    label: e.fullName,
  }))
  const [managerSelected, setManagerSelected] = useState(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      email: '',
      ...(mode === 'create' ? { initialPassword: '' } : {}),
      roleId: undefined,
      fullName: '',
      employeeCode: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      departmentId: null,
      designation: '',
      dateOfJoining: '',
      employmentType: '',
      managerId: null,
      contact: EMPTY_CONTACT,
      banking: EMPTY_BANKING,
    },
  })

  useEffect(() => {
    if (isEdit && employee) {
      reset(toFormValues(employee))
      if (employee.manager) {
        setManagerSelected({
          value: employee.manager.id,
          label: employee.manager.fullName,
        })
      }
    }
  }, [isEdit, employee, reset])

  const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }))
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const employmentOptions = EMPLOYMENT_TYPES.map((t) => ({ value: t, label: t }))

  const onSubmit = (values) => {
    const payload = cleanObject({
      email: values.email,
      ...(mode === 'create' ? { initialPassword: values.initialPassword } : {}),
      roleId: values.roleId,
      fullName: values.fullName,
      employeeCode: values.employeeCode,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      phone: values.phone,
      departmentId: values.departmentId ?? undefined,
      designation: values.designation,
      dateOfJoining: values.dateOfJoining,
      employmentType: values.employmentType,
      managerId: values.managerId ?? undefined,
    })
    const contact = cleanObject(values.contact)
    const banking = cleanObject(values.banking)
    if (Object.keys(contact).length) payload.contact = contact
    if (Object.keys(banking).length) payload.banking = banking

    const onError = (error) => {
      if (error?.code === 'EMAIL_TAKEN') {
        setError('email', { message: error.message })
      } else if (error?.code === 'EMPLOYEE_CODE_TAKEN') {
        setError('employeeCode', { message: error.message })
      } else {
        toast.error(error?.message || 'Something went wrong. Please try again.')
      }
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: employeeId, data: payload },
        {
          onSuccess: () => {
            toast.success('Employee updated')
            navigate(`/${roleSeg}/employees/${employeeId}`)
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          toast.success('Employee created')
          navigate(`/${roleSeg}/employees/${res.data.id}`)
        },
        onError,
      })
    }
  }

  if (isEdit && loadingEmployee) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-accent" />
      </div>
    )
  }

  if (isEdit && employeeError) {
    return (
      <p className="text-sm text-gray-600">Could not load this employee to edit.</p>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <h1 className="text-2xl text-primary">
        {isEdit ? 'Edit Employee' : 'New Employee'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
        {/* Account */}
        <section className="space-y-4">
          <SectionHeading>Account</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" autoComplete="off" {...register('email')} />
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
                  {...register('initialPassword')}
                />
              </FormField>
            )}
            <FormField label="Role" required error={errors.roleId?.message}>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <RSelect
                    options={roleOptions}
                    placeholder="Select a role…"
                    value={roleOptions.find((o) => o.value === field.value) ?? null}
                    onChange={(opt) => field.onChange(opt?.value ?? undefined)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
          </div>
        </section>

        {/* Basic Information */}
        <section className="space-y-4">
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" required error={errors.fullName?.message}>
              <Input {...register('fullName')} />
            </FormField>
            <FormField
              label="Employee Code"
              required
              error={errors.employeeCode?.message}
            >
              <Input {...register('employeeCode')} />
            </FormField>
            <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DateField
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
            <FormField label="Gender" error={errors.gender?.message}>
              <Input {...register('gender')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
          </div>
        </section>

        {/* Employment Details */}
        <section className="space-y-4">
          <SectionHeading>Employment Details</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Department" error={errors.departmentId?.message}>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <RSelect
                    isClearable
                    options={departmentOptions}
                    placeholder="Select a department…"
                    value={
                      departmentOptions.find((o) => o.value === field.value) ?? null
                    }
                    onChange={(opt) => field.onChange(opt?.value ?? null)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
            <FormField label="Designation" error={errors.designation?.message}>
              <Input {...register('designation')} />
            </FormField>
            <FormField label="Date of Joining" error={errors.dateOfJoining?.message}>
              <Controller
                control={control}
                name="dateOfJoining"
                render={({ field }) => (
                  <DateField
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
            <FormField label="Employment Type" error={errors.employmentType?.message}>
              <Controller
                control={control}
                name="employmentType"
                render={({ field }) => (
                  <RSelect
                    isClearable
                    options={employmentOptions}
                    placeholder="Select a type…"
                    value={
                      employmentOptions.find((o) => o.value === field.value) ?? null
                    }
                    onChange={(opt) => field.onChange(opt?.value ?? '')}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
            <FormField label="Manager" error={errors.managerId?.message}>
              <Controller
                control={control}
                name="managerId"
                render={({ field }) => (
                  <RSelect
                    isClearable
                    options={managerOptions}
                    placeholder="Search employees…"
                    filterOption={() => true}
                    onInputChange={(v) => setManagerQuery(v)}
                    value={managerSelected}
                    onChange={(opt) => {
                      setManagerSelected(opt ?? null)
                      field.onChange(opt?.value ?? null)
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-4">
          <SectionHeading hint="Optional">Contact Information</SectionHeading>
          <ContactFields register={register} />
        </section>

        {/* Banking Information */}
        <section className="space-y-4">
          <SectionHeading hint="Optional">Banking Information</SectionHeading>
          <BankingFields register={register} />
        </section>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                isEdit ? `/${roleSeg}/employees/${employeeId}` : `/${roleSeg}/employees`,
              )
            }
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Create employee'}
          </Button>
        </div>
      </form>
    </div>
  )
}
