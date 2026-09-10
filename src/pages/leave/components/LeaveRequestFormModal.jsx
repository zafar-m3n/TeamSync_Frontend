import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Button from '@/components/ui/Button'
import { DateField, DateRangeField, toYmd, parseYmd } from '@/components/form/DatePicker'
import { useLeaveTypes } from '@/hooks/useLeaveTypes'
import { useSubmitLeaveRequest } from '@/hooks/useLeaveRequestMutations'
import { computeLeaveDays } from '@/pages/leave/utils/computeLeaveDays'

const schema = z
  .object({
    leaveTypeId: z
      .number({ message: 'Choose a leave type' })
      .int()
      .positive('Choose a leave type'),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    isHalfDay: z.boolean(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  })
  .refine((v) => !v.isHalfDay || v.startDate === v.endDate, {
    message: 'A half day must be a single date',
    path: ['endDate'],
  })

export default function LeaveRequestFormModal({ onClose }) {
  const { data: leaveTypes = [] } = useLeaveTypes()
  const submit = useSubmitLeaveRequest()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      leaveTypeId: undefined,
      startDate: '',
      endDate: '',
      isHalfDay: false,
    },
  })

  const isHalfDay = watch('isHalfDay')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // A half day must be a single date — mirror the backend's own rule so an
  // invalid start/end pair never reaches the API.
  useEffect(() => {
    if (isHalfDay && startDate) {
      setValue('endDate', startDate, { shouldValidate: true })
    }
  }, [isHalfDay, startDate, setValue])

  const typeOptions = leaveTypes.map((t) => ({ value: t.id, label: t.name }))

  const days =
    startDate && endDate
      ? computeLeaveDays(startDate, endDate, isHalfDay)
      : null

  const onSubmit = (values) => {
    submit.mutate(
      {
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.isHalfDay ? values.startDate : values.endDate,
        isHalfDay: values.isHalfDay,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Request leave"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submit.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="leave-request-form"
            variant="accent"
            isLoading={submit.isPending}
          >
            Submit request
          </Button>
        </>
      }
    >
      <form
        id="leave-request-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField label="Leave Type" required error={errors.leaveTypeId?.message}>
          <Controller
            control={control}
            name="leaveTypeId"
            render={({ field }) => (
              <Select
                options={typeOptions}
                placeholder="Select a leave type…"
                value={typeOptions.find((o) => o.value === field.value) ?? null}
                onChange={(opt) => field.onChange(opt?.value)}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" className="h-4 w-4 accent-accent" {...register('isHalfDay')} />
          Half day
        </label>

        {isHalfDay ? (
          <FormField label="Date" required error={errors.startDate?.message || errors.endDate?.message}>
            <DateField
              value={startDate}
              placeholder="Pick a date"
              onChange={(ymd) => {
                setValue('startDate', ymd, { shouldValidate: true })
                setValue('endDate', ymd, { shouldValidate: true })
              }}
            />
          </FormField>
        ) : (
          <FormField
            label="Dates"
            required
            error={errors.startDate?.message || errors.endDate?.message}
          >
            <DateRangeField
              value={{ from: parseYmd(startDate), to: parseYmd(endDate) }}
              clearable={false}
              placeholder="Pick a date range"
              onChange={(range) => {
                setValue('startDate', range?.from ? toYmd(range.from) : '', {
                  shouldValidate: true,
                })
                setValue('endDate', range?.to ? toYmd(range.to) : '', {
                  shouldValidate: true,
                })
              }}
            />
          </FormField>
        )}

        {days != null && (
          <p className="text-sm text-gray-500">
            {days} day{days === 1 ? '' : 's'}
          </p>
        )}
      </form>
    </Modal>
  )
}
