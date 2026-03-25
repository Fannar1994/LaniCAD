import { daysBetween } from '@/lib/format'

interface Props {
  startDate: string
  endDate: string
  rentalDays: number
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onRentalDaysChange: (days: number) => void
}

export function DateRangePicker({
  startDate, endDate, rentalDays,
  onStartDateChange, onEndDateChange, onRentalDaysChange,
}: Props) {
  const isInvalid = !!(startDate && endDate && new Date(startDate) > new Date(endDate))

  const handleStartChange = (value: string) => {
    onStartDateChange(value)
    if (value && endDate && new Date(value) <= new Date(endDate)) {
      const days = daysBetween(new Date(value), new Date(endDate))
      onRentalDaysChange(Math.max(1, days))
    }
  }

  const handleEndChange = (value: string) => {
    onEndDateChange(value)
    if (startDate && value && new Date(startDate) <= new Date(value)) {
      const days = daysBetween(new Date(startDate), new Date(value))
      onRentalDaysChange(Math.max(1, days))
    }
  }

  const handleDaysChange = (days: number) => {
    onRentalDaysChange(days)
    if (startDate) {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(start.getDate() + days - 1)
      onEndDateChange(end.toISOString().slice(0, 10))
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-condensed text-lg font-semibold text-brand-dark">Leigutímabil</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-500">Upphafsdagur</label>
          <input
            type="date"
            value={startDate}
            onChange={e => handleStartChange(e.target.value)}
            title="Upphafsdagur"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Lokadagur</label>
          <input
            type="date"
            value={endDate}
            onChange={e => handleEndChange(e.target.value)}
            title="Lokadagur"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">Leigudagar</label>
          <input
            type="number"
            min={1}
            value={rentalDays}
            onChange={e => handleDaysChange(Math.max(1, Number(e.target.value)))}
            title="Leigudagar"
            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
          />
        </div>
      </div>
      {isInvalid && (
        <p className="mt-2 text-sm text-red-600">Upphafsdagur má ekki vera á eftir lokadegi</p>
      )}
    </div>
  )
}
