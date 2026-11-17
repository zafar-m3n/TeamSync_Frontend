import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/store/useAuth'
import { canAssignRole } from '@/lib/permissions'
import { toast } from '@/hooks/useToast'
import { useRoles } from '@/hooks/useRoles'
import { useDepartments } from '@/hooks/useDepartments'
import { useCreateEmployee } from '@/hooks/useEmployees'
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployee'
import ContactFields from '@/pages/employees/components/ContactFields'
import BankingFields from '@/pages/employees/components/BankingFields'
import {
  TOTAL_STEPS,
  buildPayload,
  buildSchema,
  emptyFormValues,
  stepFields,
  toFormValues,
} from '@/pages/employees/form/employeeFormSchema'
import { useEmployeeWizard } from '@/pages/employees/form/useEmployeeWizard'
import Stepper from '@/pages/employees/form/Stepper'
import AccountStep from '@/pages/employees/form/AccountStep'
import EmploymentStep from '@/pages/employees/form/EmploymentStep'
import WizardFooter from '@/pages/employees/form/WizardFooter'

export default function EmployeeFormPage({ mode }) {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = mode === 'edit'

  const { data: employee, isLoading: loadingEmployee, isError: employeeError } =
    useEmployee(isEdit ? employeeId : undefined)

  const { data: roles = [] } = useRoles()
  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const departments = deptData?.rows ?? []

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const mutation = isEdit ? updateMutation : createMutation

  const form = useForm({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: emptyFormValues(mode),
  })
  const {
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors, dirtyFields },
  } = form

  useEffect(() => {
    if (isEdit && employee) reset(toFormValues(employee))
  }, [isEdit, employee, reset])

  // A pick only counts for the employee data it was made against; a reload resets it.
  const [managerPick, setManagerPick] = useState(null)
  const savedManager = employee?.manager
    ? { value: employee.manager.id, label: employee.manager.fullName }
    : null
  const manager =
    managerPick && managerPick.source === employee ? managerPick.option : savedManager

  const wizard = useEmployeeWizard(stepFields(mode))
  // The one derived flag that both the button swap and the last-step content
  // render off of, so they can never disagree.
  const { currentStep, entered, isLastStep } = wizard

  const handleNext = async () => {
    wizard.visit(currentStep)
    const ok = await trigger(wizard.currentFields)
    if (ok) wizard.next()
  }

  // A current role the user can't assign stays visible but locked.
  const currentRole = isEdit ? employee?.role : null
  const roleLocked = Boolean(currentRole) && !canAssignRole(user, currentRole)
  const roleOptions = roles
    .filter((r) => r.id === currentRole?.id || canAssignRole(user, r))
    .map((r) => ({ value: r.id, label: r.name }))
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))

  const onSubmit = (values) => {
    // Hard safety net: the form can never actually submit from a non-final step,
    // no matter what triggers the submit event.
    if (currentStep !== TOTAL_STEPS) return

    const payload = buildPayload(values, { mode, dirtyFields })

    const onError = (error) => {
      if (error?.code === 'EMAIL_TAKEN') {
        setError('email', { message: error.message })
      } else if (error?.code === 'EMPLOYEE_CODE_TAKEN') {
        setError('employeeCode', { message: error.message })
      } else if (error?.code?.startsWith('TERMINATION_')) {
        setError('terminationDate', { message: error.message })
        wizard.goTo(2)
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
            navigate(`/employees/${employeeId}`)
          },
          onError,
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Employee created')
          navigate(`/employees`)
        },
        onError,
      })
    }
  }

  // Final-submit re-validates the whole schema; if an earlier step is at fault,
  // jump to it so the failure is visible.
  const submit = handleSubmit(onSubmit, wizard.showFirstError)

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
                isEdit ? `/employees/${employeeId}` : `/employees`,
              )
            }
            disabled={mutation.isPending}
            className="mt-1 shrink-0 rounded text-sm text-gray-500 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6">
          <Stepper steps={wizard.stepperSteps(errors)} currentStep={currentStep} />
        </div>

        <form onSubmit={submit} className="mt-8" noValidate>
          <div
            className={clsx(
              'transition duration-200 ease-out motion-reduce:transition-none',
              entered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
          >
            {currentStep === 1 && (
              <AccountStep
                form={form}
                mode={mode}
                roleOptions={roleOptions}
                roleLocked={roleLocked}
              />
            )}

            {currentStep === 2 && (
              <EmploymentStep
                form={form}
                departmentOptions={departmentOptions}
                manager={manager}
                onManagerChange={(option) => setManagerPick({ source: employee, option })}
              />
            )}

            {currentStep === 3 && (
              <section className="space-y-6">
                <p className="text-sm text-gray-500">All fields in this step are optional.</p>
                <ContactFields register={form.register} control={form.control} />
              </section>
            )}

            {isLastStep && (
              <section className="space-y-6">
                <p className="text-sm text-gray-500">All fields in this step are optional.</p>
                <BankingFields register={form.register} />
              </section>
            )}
          </div>

          <WizardFooter
            showBack={currentStep > 1}
            isLastStep={isLastStep}
            isPending={mutation.isPending}
            submitLabel={isEdit ? 'Save changes' : 'Create employee'}
            onBack={wizard.back}
            onNext={handleNext}
          />
        </form>
      </div>
    </div>
  )
}
