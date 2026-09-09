import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import 'react-day-picker/style.css'
import Select from '@/components/ui/Select'
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

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SectionHeading({ icon, children, hint }) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <div className="flex items-center gap-2">
        {icon && (
          <Icon icon={icon} width="20" height="20" className="shrink-0 text-accent" />
        )}
        <h2 className="text-lg font-medium text-primary">{children}</h2>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

function Subheading({ children }) {
  return (
    <p className="border-b border-gray-100 pb-1.5 text-sm font-semibold text-primary">
      {children}
    </p>
  )
}

// Non-clickable progress display. Trail wraps (flex-wrap, no nowrap / no fixed
// widths) so it can never scroll horizontally; the track fill is a % width.
function Stepper({ steps, currentStep }) {
  return (
    <div>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
        {steps.map((step, i) => (
          <li key={step.label} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <Icon
                icon="lucide:chevron-right"
                width="14"
                height="14"
                className="text-gray-300"
                aria-hidden
              />
            )}
            {step.status === 'complete' && (
              <Icon
                icon="lucide:check"
                width="14"
                height="14"
                className="text-accent"
                aria-hidden
              />
            )}
            {step.status === 'error' && (
              <Icon
                icon="lucide:triangle-alert"
                width="14"
                height="14"
                className="text-red-600"
                aria-hidden
              />
            )}
            <span
              aria-current={step.status === 'current' ? 'step' : undefined}
              className={clsx(
                step.status === 'current' && 'font-semibold text-primary',
                step.status === 'upcoming' && 'text-gray-400',
                step.status === 'complete' && 'text-gray-500',
                step.status === 'error' && 'font-medium text-red-600',
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>
    </div>
  )
}

const STEP_LABELS = {
  1: 'Account & Basic Information',
  2: 'Employment Details',
  3: 'Contact Information',
  4: 'Banking Information',
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
    trigger,
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

  const [currentStep, setCurrentStep] = useState(1)
  const [visitedSteps, setVisitedSteps] = useState(() => new Set())
  const [entered, setEntered] = useState(true)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [currentStep])

  const goToStep = (next) => {
    setEntered(false)
    setCurrentStep(next)
  }

  const STEP_FIELDS = {
    1:
      mode === 'create'
        ? ['email', 'initialPassword', 'roleId', 'fullName', 'employeeCode', 'dateOfBirth', 'gender', 'phone']
        : ['email', 'roleId', 'fullName', 'employeeCode', 'dateOfBirth', 'gender', 'phone'],
    2: ['departmentId', 'designation', 'dateOfJoining', 'employmentType', 'managerId'],
    3: Object.keys(contactSchema.shape).map((k) => `contact.${k}`),
    4: Object.keys(bankingSchema.shape).map((k) => `banking.${k}`),
  }

  const errorKeys = Object.keys(errors)
  const stepHasError = (step) =>
    STEP_FIELDS[step].some((name) => errorKeys.includes(name.split('.')[0]))

  const stepStatus = (step) => {
    if (step === currentStep) return 'current'
    if (!visitedSteps.has(step) && step > currentStep) return 'upcoming'
    return stepHasError(step) ? 'error' : 'complete'
  }

  const stepperSteps = [1, 2, 3, 4].map((n) => ({
    label: STEP_LABELS[n],
    status: stepStatus(n),
  }))

  const handleNext = async () => {
    setVisitedSteps((prev) => new Set(prev).add(currentStep))
    const ok = await trigger(STEP_FIELDS[currentStep])
    if (ok) goToStep((s) => Math.min(4, s + 1))
  }

  const handleBack = () => goToStep((s) => Math.max(1, s - 1))

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

  // Final-submit re-validates the whole schema; if an earlier step is at fault,
  // jump to the lowest-numbered offending step so the failure is visible.
  const onInvalid = (formErrors) => {
    const bad = Object.keys(formErrors)
    setVisitedSteps(new Set([1, 2, 3, 4]))
    for (const step of [1, 2, 3, 4]) {
      if (STEP_FIELDS[step].some((name) => bad.includes(name.split('.')[0]))) {
        goToStep(step)
        return
      }
    }
  }

  const submit = handleSubmit((values) => {
    if (currentStep !== 4) return
    onSubmit(values)
  }, onInvalid)

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
    <div className="mx-auto max-w-3xl pb-16">
      <div className="rounded-lg border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl leading-tight text-primary">
            {isEdit ? 'Edit Employee' : 'New Employee'}
          </h1>
          <button
            type="button"
            onClick={() =>
              navigate(
                isEdit ? `/${roleSeg}/employees/${employeeId}` : `/${roleSeg}/employees`,
              )
            }
            disabled={mutation.isPending}
            className="mt-1 shrink-0 rounded text-sm text-gray-500 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6">
          <Stepper steps={stepperSteps} currentStep={currentStep} />
        </div>

        <form onSubmit={submit} className="mt-8" noValidate>
          <div
            className={clsx(
              'transition duration-200 ease-out motion-reduce:transition-none',
              entered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
          >
            {currentStep === 1 && (
              <section className="space-y-6">
                <SectionHeading icon="lucide:user">
                  Account &amp; Basic Information
                </SectionHeading>

                <div className="space-y-3">
                  <Subheading>Account</Subheading>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Email" required error={errors.email?.message}>
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="jordan.rivera@company.com"
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
                          placeholder="••••••••"
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

                <div className="space-y-3">
                  <Subheading>Personal details</Subheading>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Full Name"
                      required
                      error={errors.fullName?.message}
                    >
                      <Input placeholder="Jordan Rivera" {...register('fullName')} />
                    </FormField>
                    <FormField
                      label="Employee Code"
                      required
                      error={errors.employeeCode?.message}
                    >
                      <Input placeholder="ENG-2024-014" {...register('employeeCode')} />
                    </FormField>
                    <FormField
                      label="Date of Birth"
                      error={errors.dateOfBirth?.message}
                    >
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
                      <Input placeholder="Female" {...register('gender')} />
                    </FormField>
                    <FormField label="Phone" error={errors.phone?.message}>
                      <Input placeholder="+1 415 555 0142" {...register('phone')} />
                    </FormField>
                  </div>
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-6">
                <SectionHeading icon="lucide:briefcase">
                  Employment Details
                </SectionHeading>
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
                    <Input placeholder="Senior Software Engineer" {...register('designation')} />
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
                          options={employmentOptions}
                          placeholder="Select a type…"
                          value={
                            employmentOptions.find((o) => o.value === field.value) ??
                            null
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
                        <Select
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
            )}

            {currentStep === 3 && (
              <section className="space-y-6">
                <SectionHeading icon="lucide:map-pin" hint="Optional">
                  Contact Information
                </SectionHeading>
                <ContactFields register={register} />
              </section>
            )}

            {currentStep === 4 && (
              <section className="space-y-6">
                <SectionHeading icon="lucide:credit-card" hint="Optional">
                  Banking Information
                </SectionHeading>
                <BankingFields register={register} />
              </section>
            )}
          </div>

          <div className="sticky bottom-0 z-10 -mb-6 mt-8 flex items-center justify-end gap-3 border-t border-gray-200 bg-white pb-6 pt-4 sm:-mb-8 sm:pb-8">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={mutation.isPending}
                className="mr-auto"
              >
                Back
              </Button>
            )}
            {currentStep < 4 ? (
              <Button type="button" variant="accent" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="accent" isLoading={mutation.isPending}>
                {isEdit ? 'Save changes' : 'Create employee'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
