import Select from '@/components/ui/Select'
import { useShifts } from '@/hooks/useShifts'
import { useAssignShift } from '@/hooks/useEmployee'

export default function ShiftAssignControl({ employeeId, currentShiftId }) {
  const { data: shifts = [], isLoading } = useShifts()
  const assign = useAssignShift()
  const busy = isLoading || assign.isPending
  const options = shifts.map((s) => ({ value: s.id, label: s.name }))

  return (
    <Select
      isDisabled={busy}
      isLoading={busy}
      options={options}
      placeholder="Select a shift…"
      value={options.find((o) => o.value === currentShiftId) ?? null}
      onChange={(opt) => {
        if (opt?.value) assign.mutate({ id: employeeId, shiftId: opt.value })
      }}
    />
  )
}
