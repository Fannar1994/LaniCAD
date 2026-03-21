import { useState, useCallback } from 'react'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import type { ClientInfo } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

export function TopecCalculator() {
  const [client, setClient] = useState<ClientInfo>(emptyClient)
  const [rentalDays, setRentalDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const getExportData = useCallback(() => ({
    title: 'Topec',
    calculatorType: 'Topec',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [['Leigudagar', `${rentalDays}`]] as [string, string][],
    tableHeaders: ['Vörunúmer', 'Lýsing', 'Magn', 'Leiga'],
    tableRows: [] as (string | number)[][],
    totalLabel: 'Samtals:',
    totalValue: formatKr(0),
  }), [client, startDate, endDate, rentalDays])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Topec</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <h2 className="font-condensed text-xl font-semibold text-gray-400">Topec</h2>
        <p className="mt-2 text-sm text-gray-400">Reiknivél í vinnslu — vöruverð og útreikningar bætast við fljótlega.</p>
      </div>
    </div>
  )
}
