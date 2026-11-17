import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Table from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Icon } from '@iconify/react'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import {
  useLeaveTypes,
  useCreateLeaveType,
  useUpdateLeaveType,
  useDeleteLeaveType,
} from '@/hooks/useLeaveTypes'

const columns = [
  { key: 'name', header: 'Name', className: 'font-medium' },
  {
    key: 'description',
    header: 'Description',
    className: 'text-fg-muted',
    render: (lt) => lt.description || <span className="text-fg-subtle">—</span>,
  },
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
            variant="primary"
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
          <Input autoFocus placeholder="Annual Leave" {...register('name')} />
        </FormField>
        <FormField label="Description" error={errors.description?.message}>
          <Input
            multiline
            rows={3}
            placeholder="Paid time off for planned personal leave"
            {...register('description')}
          />
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
  // Keeps the name on screen while the delete dialog animates out.
  const [shownDelete, setShownDelete] = useState(null)
  if (deleteTarget && deleteTarget !== shownDelete) setShownDelete(deleteTarget)

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Leave Type
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{newButton()}</div>

      <Table
        caption="Leave types"
        columns={columns}
        rows={leaveTypes}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:tags"
        emptyMessage="No leave types yet — add your first leave type"
        emptyAction={newButton('sm')}
        rowActions={(lt) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit leave type" variant="ghost" size="sm" onClick={() => setFormTarget(lt)} />
            <IconButton
              icon="lucide:trash-2"
              label="Delete leave type"
              variant="ghost-danger"
              size="sm"
              onClick={() => setDeleteTarget(lt)}
            />
          </>
        )}
      />

      {formTarget !== undefined && (
        <LeaveTypeFormModal key={formTarget?.id ?? 'new'} leaveType={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete leave type"
        confirmLabel="Delete"
        tone="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
      >
        <p>
          Delete <strong className="font-semibold text-fg">{shownDelete?.name}</strong>? This can&rsquo;t be undone.
        </p>
      </ConfirmDialog>
    </div>
  )
}
