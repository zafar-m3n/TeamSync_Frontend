import { useShifts } from '../../../hooks/useShifts'
import { useAssignShift } from '../../../hooks/useEmployee'

export default function ShiftAssignControl({ employeeId, currentShiftId }) {
  const { data: shifts = [], isLoading } = useShifts()
  const assign = useAssignShift()

  return (
    <select
      value={currentShiftId ?? ''}
      disabled={isLoading || assign.isPending}
      onChange={(e) => {
        const shiftId = Number(e.target.value)
        if (shiftId) assign.mutate({ id: employeeId, shiftId })
      }}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
    >
      <option value="" disabled>
        Select a shift…
      </option>
      {shifts.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}
