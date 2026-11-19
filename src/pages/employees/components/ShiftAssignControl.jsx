import { useState } from 'react'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useShifts } from '@/hooks/useShifts'
import { useAssignShift } from '@/hooks/useEmployee'

// Picking a shift only stages it: a confirmation dialog applies it. Cancel (next to
// the select) closes the control without changing anything.
export default function ShiftAssignControl({ employeeId, employeeName, currentShift, onDone }) {
  const { data: shifts = [], isLoading } = useShifts()
  const assign = useAssignShift()
  const [pending, setPending] = useState(null)
  const options = shifts.map((s) => ({ value: s.id, label: s.name }))
  const currentId = currentShift?.id ?? null

  const confirm = () => {
    assign.mutate(
      { id: employeeId, shiftId: pending.value },
      {
        onSuccess: () => {
          setPending(null)
          onDone?.()
        },
      },
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <Select
            aria-label="Shift"
            autoFocus
            isDisabled={isLoading || assign.isPending}
            isLoading={isLoading}
            options={options}
            isOptionDisabled={(o) => o.value === currentId}
            placeholder="Select a shift…"
            value={pending ?? options.find((o) => o.value === currentId) ?? null}
            onChange={(opt) => {
              if (opt && opt.value !== currentId) setPending(opt)
            }}
          />
        </div>
        <Button variant="secondary" onClick={onDone} disabled={assign.isPending}>
          Cancel
        </Button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={confirm}
        tone="primary"
        title="Change shift?"
        message={
          currentShift?.name ? (
            <>
              Change <strong className="font-semibold text-fg">{employeeName}</strong>&apos;s shift from{' '}
              <strong className="font-semibold text-fg">{currentShift.name}</strong> to{' '}
              <strong className="font-semibold text-fg">{pending?.label}</strong>?
            </>
          ) : (
            <>
              Assign <strong className="font-semibold text-fg">{pending?.label}</strong> to{' '}
              <strong className="font-semibold text-fg">{employeeName}</strong>?
            </>
          )
        }
        confirmLabel={currentShift?.name ? 'Change shift' : 'Assign shift'}
        isLoading={assign.isPending}
      />
    </>
  )
}
