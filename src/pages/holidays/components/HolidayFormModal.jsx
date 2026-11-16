import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import { DateField } from '@/components/form/DatePicker'
import { useCreateHoliday, useUpdateHoliday } from '@/hooks/useHolidays'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  date: z.string().min(1, 'Pick a date'),
})

export default function HolidayFormModal({ holiday, onClose }) {
  const isEdit = Boolean(holiday)
  const createMutation = useCreateHoliday()
  const updateMutation = useUpdateHoliday()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: holiday?.name ?? '', date: holiday?.date ?? '' },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate({ id: holiday.id, data: values }, { onSuccess: onClose })
    } else {
      createMutation.mutate(values, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit holiday' : 'New holiday'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="holiday-form" variant="accent" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add holiday'}
          </Button>
        </>
      }
    >
      <form
        id="holiday-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Name" required error={errors.name?.message}>
          <Input autoFocus placeholder="Independence Day" {...register('name')} />
        </FormField>
        <FormField label="Date" required error={errors.date?.message}>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DateField
                value={field.value}
                onChange={(ymd) => field.onChange(ymd ?? '')}
                placeholder="Pick a date"
                withDropdownNav
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
