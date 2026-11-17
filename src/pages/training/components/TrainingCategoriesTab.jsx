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
  useTrainingCategories,
  useCreateTrainingCategory,
  useUpdateTrainingCategory,
  useDeleteTrainingCategory,
} from '@/hooks/useTrainingCategories'

const columns = [{ key: 'name', header: 'Name', className: 'font-medium' }]

const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
})

function CategoryFormModal({ category, onClose }) {
  const isEdit = Boolean(category)
  const createMutation = useCreateTrainingCategory()
  const updateMutation = useUpdateTrainingCategory()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? '' },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate({ id: category.id, data: values }, { onSuccess: onClose })
    } else {
      createMutation.mutate(values, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="training-category-form"
            variant="primary"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create category'}
          </Button>
        </>
      }
    >
      <form
        id="training-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="Compliance" {...register('name')} />
        </FormField>
      </form>
    </Modal>
  )
}

export default function TrainingCategoriesTab() {
  const { data: categories = [], isLoading, isError, error, refetch } = useTrainingCategories()
  const deleteMutation = useDeleteTrainingCategory()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Keeps the name on screen while the delete dialog animates out.
  const [shownDelete, setShownDelete] = useState(null)
  if (deleteTarget && deleteTarget !== shownDelete) setShownDelete(deleteTarget)

  const openCreate = () => setFormTarget(null)
  const newButton = (size) => (
    <Button variant="primary" size={size} onClick={openCreate}>
      <Icon icon="lucide:plus" width={size === 'sm' ? 14 : 16} height={size === 'sm' ? 14 : 16} aria-hidden />
      New Category
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">{newButton()}</div>

      <Table
        caption="Training categories"
        columns={columns}
        rows={categories}
        isLoading={isLoading}
        error={isError ? error?.message || 'Could not load categories.' : null}
        onRetry={() => refetch()}
        emptyIcon="lucide:tags"
        emptyMessage="No training categories yet — add your first category"
        emptyAction={newButton('sm')}
        rowActions={(cat) => (
          <>
            <IconButton icon="lucide:pencil" label="Edit category" variant="ghost" size="sm" onClick={() => setFormTarget(cat)} />
            <IconButton icon="lucide:trash-2" label="Delete category" variant="ghost-danger" size="sm" onClick={() => setDeleteTarget(cat)} />
          </>
        )}
      />

      {formTarget !== undefined && (
        <CategoryFormModal key={formTarget?.id ?? 'new'} category={formTarget} onClose={() => setFormTarget(undefined)} />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete category"
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
