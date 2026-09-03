import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useTrainingCategories } from '@/hooks/useTrainingCategories'
import { useUploadDocument } from '@/hooks/useTrainingMutations'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]
const MAX_BYTES = 5 * 1024 * 1024

function validateFile(file) {
  if (!file) return 'Choose a file to upload.'
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'That file type isn’t supported. Upload a PDF, Word document, or a JPEG/PNG image.'
  }
  if (file.size > MAX_BYTES) {
    return 'That file is over 5 MB. Please choose a smaller file.'
  }
  return null
}

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  categoryId: z
    .number({ message: 'Choose a category' })
    .int()
    .positive('Choose a category'),
})

export default function UploadDocumentModal({ onClose }) {
  const { data: categories = [] } = useTrainingCategories()
  const mutation = useUploadDocument()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', categoryId: undefined },
  })

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  const onFileChange = (e) => {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    setFileError(picked ? validateFile(picked) : null)
  }

  const onSubmit = (values) => {
    const problem = validateFile(file)
    if (problem) {
      setFileError(problem)
      return
    }
    const formData = new FormData()
    formData.append('title', values.title)
    if (values.description) formData.append('description', values.description)
    formData.append('categoryId', String(values.categoryId))
    formData.append('file', file)
    mutation.mutate(formData, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Upload document"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-document-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            Upload
          </Button>
        </>
      }
    >
      <form
        id="upload-document-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Title" required error={errors.title?.message}>
          <Input autoFocus {...register('title')} />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Input multiline rows={3} {...register('description')} />
        </FormField>

        <FormField label="Category" required error={errors.categoryId?.message}>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select
                options={categoryOptions}
                placeholder="Select a category…"
                value={categoryOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>

        <FormField label="File" required error={fileError}>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.doc,.docx,image/jpeg,image/png"
            onChange={onFileChange}
            className="block w-full text-sm text-text file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-text hover:file:bg-gray-50"
          />
        </FormField>
      </form>
    </Modal>
  )
}
