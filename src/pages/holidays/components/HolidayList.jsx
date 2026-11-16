import { useHolidays } from '@/hooks/useHolidays'
import { formatHolidayDate } from '@/pages/holidays/utils/formatHolidayDate'

// Read-only list for anyone with holidays.view.
export default function HolidayList({ year }) {
  const { data: holidays = [], isLoading, isError } = useHolidays(year)

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-text">Holidays in {year}</h2>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading holidays…</p>
      ) : isError ? (
        <p className="text-sm text-gray-500">Could not load holidays.</p>
      ) : holidays.length === 0 ? (
        <p className="text-sm text-gray-500">No holidays listed for {year}.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white text-sm">
          {holidays.map((h) => (
            <li key={h.id} className="flex justify-between gap-4 px-4 py-2">
              <span className="text-text">{h.name}</span>
              <span className="whitespace-nowrap text-gray-500">{formatHolidayDate(h.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
