import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  NARROW_PRICING, WIDE_PRICING, QUICKLY_PRICING, SUPPORT_LEGS_PRICING,
  NARROW_COMPONENTS, ROLLING_TYPES, HEIGHT_OPTIONS
} from '@/data/rolling-scaffold'
import { calcRollingRental } from '@/lib/calculations/rental'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import { createProject, updateProject, createTemplate } from '@/lib/db'
import type { ClientInfo, LineItem as SharedLineItem } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

export function RollingScaffoldCalculator() {
  const location = useLocation()
  const loadedProject = location.state?.project as { id: string; name: string; data: Record<string, unknown>; client: ClientInfo } | undefined
  const loadedTemplate = location.state?.template as { id: string; name: string; config: Record<string, unknown> } | undefined
  const initData = loadedProject?.data ?? loadedTemplate?.config ?? {}

  const [scaffoldType, setScaffoldType] = useState<'narrow' | 'wide' | 'quickly'>(initData.scaffoldType as 'narrow' | 'wide' | 'quickly' ?? 'narrow')
  const [height, setHeight] = useState(initData.height as string ?? '4.5')
  const [rentalDays, setRentalDays] = useState(initData.rentalDays as number ?? 7)
  const [includeSupportLegs, setIncludeSupportLegs] = useState(initData.includeSupportLegs as boolean ?? false)
  const [client, setClient] = useState<ClientInfo>(loadedProject?.client ?? emptyClient)
  const [startDate, setStartDate] = useState(initData.startDate as string ?? '')
  const [endDate, setEndDate] = useState(initData.endDate as string ?? '')
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(loadedProject?.id ?? null)

  const isQuickly = scaffoldType === 'quickly'

  const pricing = useMemo(() => {
    if (isQuickly) return QUICKLY_PRICING
    return scaffoldType === 'narrow' ? NARROW_PRICING[height] : WIDE_PRICING[height]
  }, [scaffoldType, height, isQuickly])

  const rentalCost = useMemo(() => {
    if (!pricing) return 0
    let cost = calcRollingRental(rentalDays, pricing)
    if (includeSupportLegs) {
      cost += calcRollingRental(rentalDays, SUPPORT_LEGS_PRICING)
    }
    return cost
  }, [pricing, rentalDays, includeSupportLegs])

  // Component breakdown for detailed view
  const components = useMemo(() => {
    if (isQuickly || scaffoldType === 'wide') return []
    return NARROW_COMPONENTS.map(c => ({
      ...c,
      qty: c.quantities[height] ?? 0,
    })).filter(c => c.qty > 0)
  }, [scaffoldType, height, isQuickly])

  const typeLabel = ROLLING_TYPES.find(t => t.key === scaffoldType)?.label ?? scaffoldType

  const getExportData = useCallback(() => ({
    title: 'Hjólapallareiknivél',
    calculatorType: 'Hjólapallar',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [
      ['Tegund', typeLabel],
      ...(!isQuickly ? [['Hæð', `${height} m`] as [string, string]] : []),
      ['Leigudagar', `${rentalDays}`],
      ['Stoðfætur', includeSupportLegs ? 'Já' : 'Nei'],
    ] as [string, string][],
    tableHeaders: ['Lýsing', 'Upphæð'],
    tableRows: [
      ['Leigukostnaður', formatKr(rentalCost)],
      ...(pricing ? [
        ['24 klst verð', formatKr(pricing['24h'])],
        ['Aukadagur', formatKr(pricing.extra)],
        ['Vikuverð', formatKr(pricing.week)],
      ] : []),
    ] as (string | number)[][],
    totalLabel: 'Samtals:',
    totalValue: formatKr(rentalCost),
  }), [client, startDate, endDate, rentalDays, typeLabel, isQuickly, height, includeSupportLegs, rentalCost, pricing])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Hjólapallar — ${client.name}`
      : `Hjólapallar — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = [{
      rentalNo: scaffoldType,
      description: `${typeLabel}${!isQuickly ? ` ${height}m` : ''}`,
      quantity: 1,
      rentalCost,
    }]
    if (includeSupportLegs) {
      sharedLines.push({
        rentalNo: 'support-legs',
        description: 'Stoðfætur',
        quantity: 1,
        rentalCost: calcRollingRental(rentalDays, SUPPORT_LEGS_PRICING),
      })
    }
    const data: Record<string, unknown> = { scaffoldType, height, rentalDays, includeSupportLegs, startDate, endDate }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'rolling', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, scaffoldType, typeLabel, isQuickly, height, rentalDays, rentalCost, includeSupportLegs, startDate, endDate, projectId])

  const handleSaveTemplate = useCallback(async () => {
    const name = prompt('Heiti sniðmáts:', `Hjólapallar — ${typeLabel}`)
    if (!name) return
    const config: Record<string, unknown> = { scaffoldType, height, rentalDays, includeSupportLegs, startDate, endDate }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'rolling', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
    }
  }, [scaffoldType, typeLabel, height, rentalDays, includeSupportLegs, startDate, endDate])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Hjólapalla&shy;reiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={handleSaveTemplate} savingTemplate={savingTemplate} />
      </div>

      {/* Client info + Date range */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Tegund palls</h2>
          <div className="flex flex-wrap gap-2">
            {ROLLING_TYPES.map(rt => (
              <button
                key={rt.key}
                onClick={() => setScaffoldType(rt.key)}
                className={`rounded-md border px-4 py-2 text-sm transition ${
                  scaffoldType === rt.key
                    ? 'border-brand-accent bg-brand-accent/10 font-medium text-brand-dark'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>

          {!isQuickly && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Hæð (m)</label>
              <select
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
              >
                {HEIGHT_OPTIONS.map(h => (
                  <option key={h} value={h}>{h} m</option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox" checked={includeSupportLegs}
              onChange={e => setIncludeSupportLegs(e.target.checked)}
              className="rounded text-brand-accent focus:ring-brand-accent"
            />
            Bæta við stoðfætur
          </label>
        </div>

        {/* Summary + pricing */}
        <div className="space-y-4">
          {pricing && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="font-condensed text-lg font-semibold text-brand-dark">Verðskrá</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">24 klst</dt>
                  <dd className="font-medium">{formatKr(pricing['24h'])}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Aukadagur</dt>
                  <dd className="font-medium">{formatKr(pricing.extra)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Vika</dt>
                  <dd className="font-medium">{formatKr(pricing.week)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Trygging</dt>
                  <dd className="font-medium">{formatKr(pricing.deposit)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="rounded-lg border-2 border-brand-accent bg-brand-accent/5 p-5">
            <div className="text-sm font-medium text-gray-500">Leigukostnaður ({rentalDays} dagar)</div>
            <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
              {formatKr(rentalCost)}
            </div>
            {includeSupportLegs && (
              <div className="mt-1 text-xs text-gray-500">
                (með stoðfótum: {formatKr(calcRollingRental(rentalDays, SUPPORT_LEGS_PRICING))})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component breakdown (narrow scaffolds only) */}
      {components.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-3">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Hlutalisti</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-2 text-left font-medium text-gray-600">Vörunúmer</th>
                  <th className="px-5 py-2 text-left font-medium text-gray-600">Lýsing</th>
                  <th className="px-5 py-2 text-right font-medium text-gray-600">Magn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {components.map((c, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2 font-mono text-xs text-gray-500">{c.itemNo}</td>
                    <td className="px-5 py-2">{c.name}</td>
                    <td className="px-5 py-2 text-right">{c.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
