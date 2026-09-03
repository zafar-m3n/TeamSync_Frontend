import { Controller, useForm } from 'react-hook-form'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Button from '@/components/ui/Button'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useMyProfile } from '@/hooks/useMyProfile'
import { useDepartments } from '@/hooks/useDepartments'
import { useCreateAssignment } from '@/hooks/useTrainingMutations'

export default function AssignDocumentModal({ document: doc, onClose }) {
  const { data: team = [] } = useMyTeam()
  const { data: profile } = useMyProfile()
  const { data: deptData } = useDepartments({ page: 1, limit: 200 })
  const mutation = useCreateAssignment()

  const employeeOptions = team.map((e) => ({ value: e.id, label: e.fullName }))

  // Only departments this Manager actually heads can be assigned to — the
  // backend enforces the same via Department.departmentHeadId.
  const headedDepartments = (deptData?.rows ?? []).filter(
    (d) => d.departmentHeadId === profile?.id || d.departmentHead?.id === profile?.id,
  )
  const departmentOptions = headedDepartments.map((d) => ({
    value: d.id,
    label: d.name,
  }))
  const noDepartments = departmentOptions.length === 0

  const { control, handleSubmit, watch } = useForm({
    defaultValues: { employeeId: null, departmentId: null },
  })

  const employeeId = watch('employeeId')
  const departmentId = watch('departmentId')
  const hasTarget = Boolean(employeeId || departmentId)

  const onSubmit = (values) => {
    mutation.mutate(
      {
        documentId: doc.id,
        ...(values.employeeId ? { employeeId: values.employeeId } : {}),
        ...(values.departmentId ? { departmentId: values.departmentId } : {}),
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Assign "${doc.title}"`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="assign-document-form"
            variant="accent"
            isLoading={mutation.isPending}
            disabled={!hasTarget}
          >
            Confirm
          </Button>
        </>
      }
    >
      <form
        id="assign-document-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <p className="text-sm text-gray-500">Assign to an employee, a department, or both.</p>

        <FormField label="Employee">
          <Controller
            control={control}
            name="employeeId"
            render={({ field }) => (
              <Select
                isClearable
                options={employeeOptions}
                placeholder="Select a direct report…"
                value={employeeOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value ?? null)}
              />
            )}
          />
        </FormField>

        <FormField label="Department">
          {noDepartments ? (
            <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400">
              You aren&rsquo;t the head of any department
            </div>
          ) : (
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select
                  isClearable
                  options={departmentOptions}
                  placeholder="Select a department you head…"
                  value={
                    departmentOptions.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) => field.onChange(opt?.value ?? null)}
                />
              )}
            />
          )}
        </FormField>
      </form>
    </Modal>
  )
}
