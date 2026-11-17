import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton, { LoadingRegion } from '@/components/ui/Skeleton'
import { usePageEnter } from '@/hooks/useMotion'
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
  const { currentStep, isLastStep } = wizard
  const stepRef = useRef(null)
  usePageEnter(stepRef, currentStep)

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
      <div className="mx-auto max-w-3xl">
        <Card padding="lg">
          <LoadingRegion label="Loading employee" className="space-y-6">
            <Skeleton className="h-7 w-full max-w-lg" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </LoadingRegion>
        </Card>
      </div>
    )
  }

  if (isEdit && employeeError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <ErrorState message="Could not load this employee to edit." />
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="rounded-lg border border-line bg-surface p-5 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Stepper steps={wizard.stepperSteps(errors)} currentStep={currentStep} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(isEdit ? `/employees/${employeeId}` : `/employees`)}
            disabled={mutation.isPending}
            className="-mr-2 -mt-1"
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={submit} className="mt-8" noValidate>
          <div ref={stepRef}>
            {currentStep === 1 && (
              <AccountStep form={form} mode={mode} roleOptions={roleOptions} roleLocked={roleLocked} />
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
                <OptionalNote />
                <ContactFields register={form.register} control={form.control} />
              </section>
            )}

            {isLastStep && (
              <section className="space-y-6">
                <OptionalNote />
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

function OptionalNote() {
  return (
    <p className="flex items-center gap-2 rounded-md bg-surface-subtle px-3 py-2 text-cell text-fg-muted">
      <Icon icon="lucide:info" width="14" height="14" aria-hidden />
      All fields in this step are optional.
    </p>
  )
}
