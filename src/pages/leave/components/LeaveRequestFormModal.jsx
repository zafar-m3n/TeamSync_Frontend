import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FormField from '@/components/form/FormField'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { DateField, DateRangeField, toYmd, parseYmd } from '@/components/form/DatePicker'
import { useLeaveTypes } from '@/hooks/useLeaveTypes'
import { useSubmitLeaveRequest } from '@/hooks/useLeaveRequestMutations'
import { useLeaveDaysPreview } from '@/hooks/useLeaveDaysPreview'
import { useLeaveBalance } from '@/hooks/useLeaveBalance'
import { findBalance } from '@/pages/leave/utils/leaveBalances'

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

  const leaveTypeId = watch('leaveTypeId')
  const balanceYear = startDate ? parseYmd(startDate).getFullYear() : new Date().getFullYear()
  const { data: balances } = useLeaveBalance('me', balanceYear, leaveTypeId != null)
  const typeBalance = findBalance(balances, leaveTypeId)

  const typeOptions = leaveTypes.map((t) => ({ value: t.id, label: t.name }))

  const { data: preview } = useLeaveDaysPreview({ startDate, endDate, isHalfDay })
  const days = startDate && endDate && preview ? preview.days : null
  const years = preview ? Object.entries(preview.byYear) : []

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
            variant="primary"
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
          {typeBalance && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
              <Icon icon="lucide:wallet" width="13" height="13" aria-hidden />
              <span>
                <span className="font-medium tabular-nums text-fg">{typeBalance.remaining}</span> of{' '}
                <span className="tabular-nums">{typeBalance.totalDays}</span> days remaining in {balanceYear}
              </span>
            </p>
          )}
        </FormField>

        <Controller
          control={control}
          name="isHalfDay"
          render={({ field }) => (
            <label className="-ml-1 flex w-fit cursor-pointer items-center gap-1.5 text-sm text-fg">
              <Checkbox
                name={field.name}
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
              />
              Half day
            </label>
          )}
        />

        {isHalfDay ? (
          <FormField label="Date" required error={errors.startDate?.message || errors.endDate?.message}>
            <DateField
              value={startDate}
              placeholder="Select a date"
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
              placeholder="Select a date range"
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
          <div
            role="status"
            className={clsx(
              'flex items-start gap-3 rounded-lg border px-3.5 py-3',
              days === 0 ? 'border-danger/30 bg-danger-soft' : 'border-brand-100 bg-brand-50',
            )}
          >
            <span
              className={clsx(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                days === 0 ? 'bg-surface text-danger' : 'bg-surface text-brand-700',
              )}
            >
              <Icon icon={days === 0 ? 'lucide:calendar-off' : 'lucide:calendar-check'} width="18" height="18" aria-hidden />
            </span>
            {days === 0 ? (
              <p className="pt-2 text-sm text-danger">
                These dates have no working days (weekends and holidays don&apos;t count).
              </p>
            ) : (
              <div className="min-w-0">
                <p className="text-sm text-fg">
                  <span className="font-display text-xl font-semibold tabular-nums">{days}</span> working day
                  {days === 1 ? '' : 's'}
                </p>
                {years.length > 1 && (
                  <p className="text-xs text-fg-muted">{years.map(([year, n]) => `${n} in ${year}`).join(', ')}</p>
                )}
                <p className="text-xs text-fg-muted">Weekends and holidays aren&apos;t counted.</p>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  )
}
