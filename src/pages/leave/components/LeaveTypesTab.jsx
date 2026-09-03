import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from '@/hooks/useLeaveTypes'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'actions', header: 'Actions' },
]

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().optional(),
})

function LeaveTypeFormModal({ leaveType, onClose }) {
  const isEdit = Boolean(leaveType)
  const createMutation = useCreateLeaveType()
  const updateMutation = useUpdateLeaveType()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: leaveType?.name ?? '',
      description: leaveType?.description ?? '',
    },
  })

  const onSubmit = (values) => {
    const payload = {
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
    }
    if (isEdit) {
      updateMutation.mutate({ id: leaveType.id, data: payload }, { onSuccess: onClose })
    } else {
      createMutation.mutate(payload, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit leave type' : 'New leave type'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="leave-type-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create leave type'}
          </Button>
        </>
      }
    >
      <form
        id="leave-type-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="e.g. Annual Leave" {...register('name')} />
        </FormField>
        <FormField label="Description" error={errors.description?.message}>
          <Input multiline rows={3} {...register('description')} />
        </FormField>
      </form>
    </Modal>
  )
}

export default function LeaveTypesTab() {
  const { data: leaveTypes = [], isLoading, isError, error, refetch } = useLeaveTypes()
  const deleteMutation = useDeleteLeaveType()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => setFormTarget(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={openCreate}>
          New Leave Type
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load leave types.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={leaveTypes}
          emptyMessage="No leave types yet — add your first leave type"
          emptyAction={
            <Button variant="accent" size="sm" onClick={openCreate}>
              New Leave Type
            </Button>
          }
          renderRow={(lt) => (
            <tr
              key={lt.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">{lt.name}</td>
              <td className="px-4 py-3 text-text">{lt.description || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormTarget(lt)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(lt)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {formTarget !== undefined && (
        <LeaveTypeFormModal
          key={formTarget?.id ?? 'new'}
          leaveType={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete leave type"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() =>
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          Delete <strong>{deleteTarget?.name}</strong>? This can&rsquo;t be undone.
        </p>
      </Modal>
    </div>
  )
}
