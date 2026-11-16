import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import { useLeaveBalance, useSetLeaveQuota } from '@/hooks/useLeaveBalance'

const schema = z.object({
  quotas: z.record(z.string(), z.coerce.number().min(0, 'Cannot be negative')),
})

// Field keys are prefixed: a bare numeric key would be read as an array index.
const fieldKey = (leaveTypeId) => `t${leaveTypeId}`

function QuotaForm({ employeeId, year, balances, onClose, mutation }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      quotas: Object.fromEntries(balances.map((b) => [fieldKey(b.leaveTypeId), b.totalDays])),
    },
  })

  const onSubmit = ({ quotas }) => {
    const changed = balances
      .map((b) => ({ leaveTypeId: b.leaveTypeId, totalDays: quotas[fieldKey(b.leaveTypeId)] }))
      .filter((q) => q.totalDays !== balances.find((b) => b.leaveTypeId === q.leaveTypeId).totalDays)
    if (changed.length === 0) {
      onClose()
      return
    }
    mutation.mutate({ employeeId, year, quotas: changed }, { onSuccess: onClose })
  }

  return (
    <form id="set-quota-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="py-2">Leave type</th>
            <th className="py-2 text-right">Used</th>
            <th className="w-32 py-2 pl-4">Total days</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-text">
          {balances.map((b) => {
            const error = errors.quotas?.[fieldKey(b.leaveTypeId)]?.message
            return (
              <tr key={b.leaveTypeId}>
                <td className="py-2">{b.leaveTypeName}</td>
                <td className="py-2 text-right text-gray-500">{b.usedDays}</td>
                <td className="py-2 pl-4">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    aria-label={`${b.leaveTypeName} total days`}
                    {...register(`quotas.${fieldKey(b.leaveTypeId)}`)}
                  />
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </form>
  )
}

export default function SetQuotaModal({ employeeId, year, onClose }) {
  const { data: balances, isLoading } = useLeaveBalance(employeeId, year)
  const mutation = useSetLeaveQuota()

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Set leave quotas (${year})`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="set-quota-form"
            variant="accent"
            isLoading={mutation.isPending}
            disabled={!balances?.length}
          >
            Save
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : !balances?.length ? (
        <p className="text-sm text-gray-500">Create a leave type before setting quotas.</p>
      ) : (
        <QuotaForm
          employeeId={employeeId}
          year={year}
          balances={balances}
          onClose={onClose}
          mutation={mutation}
        />
      )}
    </Modal>
  )
}
