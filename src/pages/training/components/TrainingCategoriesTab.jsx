import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Table from '@/components/ui/Table'
import TableSkeleton from '@/components/ui/TableSkeleton'
import Modal from '@/components/ui/Modal'
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

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'actions', header: 'Actions' },
]

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
            variant="accent"
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
          <Input autoFocus placeholder="e.g. Compliance" {...register('name')} />
        </FormField>
      </form>
    </Modal>
  )
}

export default function TrainingCategoriesTab() {
  const { data: categories = [], isLoading, isError, error, refetch } =
    useTrainingCategories()
  const deleteMutation = useDeleteTrainingCategory()

  const [formTarget, setFormTarget] = useState(undefined) // undefined = closed, null = create, record = edit
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => setFormTarget(null)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="accent" onClick={openCreate}>
          New Category
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns} rows={5} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            {error?.message || 'Could not load categories.'}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          rows={categories}
          emptyMessage="No training categories yet — add your first category"
          emptyAction={
            <Button variant="accent" size="sm" onClick={openCreate}>
              New Category
            </Button>
          }
          renderRow={(cat) => (
            <tr
              key={cat.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-text">{cat.name}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <IconButton
                    icon="lucide:pencil"
                    label="Edit category"
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormTarget(cat)}
                  />
                  <IconButton
                    icon="lucide:trash-2"
                    label="Delete category"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(cat)}
                  />
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {formTarget !== undefined && (
        <CategoryFormModal
          key={formTarget?.id ?? 'new'}
          category={formTarget}
          onClose={() => setFormTarget(undefined)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete category"
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
