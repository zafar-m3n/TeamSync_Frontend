import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { DateField } from '@/components/form/DatePicker'
import { useMyTeam } from '@/hooks/useMyTeam'
import { useCreateGoal } from '@/hooks/useCreateGoal'
import { useUpdateGoal } from '@/hooks/useUpdateGoal'

function buildSchema(mode) {
  return z.object({
    ...(mode === 'create'
      ? {
          employeeId: z
            .number({ message: 'Choose an employee' })
            .int()
            .positive('Choose an employee'),
        }
      : {}),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    numericTarget: z.coerce.number().positive('Must be greater than 0'),
    targetDate: z.string().min(1, 'Pick a target date'),
  })
}

export default function GoalFormModal({ goal, onClose }) {
  const isEdit = Boolean(goal)
  const mode = isEdit ? 'edit' : 'create'

  const { data: team = [] } = useMyTeam()
  const teamOptions = team.map((e) => ({ value: e.id, label: e.fullName }))

  const createMutation = useCreateGoal()
  const updateMutation = useUpdateGoal()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      ...(mode === 'create' ? { employeeId: undefined } : {}),
      title: goal?.title ?? '',
      description: goal?.description ?? '',
      numericTarget: goal?.numericTarget ?? '',
      targetDate: (goal?.targetDate ?? '').slice(0, 10),
    },
  })

  const onSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: goal.id,
          data: {
            title: values.title,
            ...(values.description ? { description: values.description } : {}),
            numericTarget: values.numericTarget,
            targetDate: values.targetDate,
          },
        },
        { onSuccess: onClose },
      )
    } else {
      createMutation.mutate(
        {
          employeeId: values.employeeId,
          title: values.title,
          ...(values.description ? { description: values.description } : {}),
          numericTarget: values.numericTarget,
          targetDate: values.targetDate,
        },
        { onSuccess: onClose },
      )
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit goal' : 'New goal'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="goal-form"
            variant="accent"
            isLoading={mutation.isPending}
          >
            {isEdit ? 'Save changes' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form
        id="goal-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {mode === 'create' && (
          <FormField label="Employee" required error={errors.employeeId?.message}>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select
                  options={teamOptions}
                  placeholder="Select a direct report…"
                  value={teamOptions.find((o) => o.value === field.value) ?? null}
                  onChange={(opt) => field.onChange(opt?.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>
        )}

        <FormField label="Title" required error={errors.title?.message}>
          <Input
            autoFocus
            placeholder="Close 50 enterprise deals this quarter"
            {...register('title')}
          />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Input
            multiline
            rows={3}
            placeholder="Focus on accounts above $25k ARR in the west region"
            {...register('description')}
          />
        </FormField>

        <FormField label="Numeric Target" required error={errors.numericTarget?.message}>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="50"
            {...register('numericTarget')}
          />
        </FormField>

        <FormField label="Target Date" required error={errors.targetDate?.message}>
          <Controller
            control={control}
            name="targetDate"
            render={({ field }) => (
              <DateField
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a date"
              />
            )}
          />
        </FormField>
      </form>
    </Modal>
  )
}
