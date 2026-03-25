import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { SCAFFOLD_SYSTEMS, getScaffoldItems, hasScaffoldPricing } from '@/data/scaffolding'
import type { ScaffoldSystemKey } from '@/data/scaffolding'
import { calculateLevelsFromHeight, calculateFacadeMaterials, calculateRacks, calculateAccessoryGrids } from '@/lib/calculations/geometry'
import { calcScaffoldingRental } from '@/lib/calculations/rental'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons, TemplateNameDialog } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import { createProject, updateProject, createTemplate } from '@/lib/db'
import { ViewerPanel } from '@/components/viewer/ViewerPanel'
import { createScaffoldDrawing } from '@/components/viewer/drawings/ScaffoldDrawing2D'
import { ScaffoldModel3D } from '@/components/viewer/models/ScaffoldModel3D'
import type { ClientInfo, LineItem as SharedLineItem } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

interface Facade {
  id: number
  name: string
  length: number
  height: number
  endcaps: number
}

export function ScaffoldCalculator() {
  const location = useLocation()
  const loadedProject = location.state?.project as { id: string; name: string; data: Record<string, unknown>; client: ClientInfo } | undefined
  const loadedTemplate = location.state?.template as { id: string; name: string; config: Record<string, unknown> } | undefined
  const initData = loadedProject?.data ?? loadedTemplate?.config ?? {}

  const [system, setSystem] = useState<ScaffoldSystemKey>(initData.system as ScaffoldSystemKey ?? 'mercury')
  const [rentalDays, setRentalDays] = useState(initData.rentalDays as number ?? 30)
  const [facades, setFacades] = useState<Facade[]>(
    (initData.facades as Facade[] | undefined) ?? [{ id: 1, name: 'Hlið 1', length: 20, height: 8, endcaps: 2 }]
  )
  const [client, setClient] = useState<ClientInfo>(loadedProject?.client ?? emptyClient)
  const [startDate, setStartDate] = useState(initData.startDate as string ?? '')
  const [endDate, setEndDate] = useState(initData.endDate as string ?? '')
  const [discount, setDiscount] = useState(initData.discount as number ?? 0)
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(loadedProject?.id ?? null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  const addFacade = () => {
    const id = Math.max(0, ...facades.map(f => f.id)) + 1
    setFacades([...facades, { id, name: `Hlið ${id}`, length: 20, height: 8, endcaps: 0 }])
  }

  const removeFacade = (id: number) => {
    if (facades.length > 1) setFacades(facades.filter(f => f.id !== id))
  }

  const updateFacade = (id: number, field: keyof Facade, value: string | number) => {
    setFacades(facades.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  // Calculate all materials across facades
  const combinedMaterials = useMemo(() => {
    const totals: Record<string, number> = {}
    facades.forEach((f, i) => {
      const levels = calculateLevelsFromHeight(f.height)
      const mats = calculateFacadeMaterials(f.length, levels.levels2m, levels.levels07m, f.endcaps, i === 0)
      const legsTotal = mats['LEGS_TOTAL'] || 0
      // Default: all legs as 50cm (user can adjust in future)
      const perFacade: Record<string, number> = { ...mats, 'Lappir 50cm': legsTotal, 'Lappir 100cm': 0 }
      delete perFacade['LEGS_TOTAL']
      for (const [key, qty] of Object.entries(perFacade)) {
        totals[key] = (totals[key] || 0) + qty
      }
    })
    // Add racks and accessory grids
    calculateRacks(totals)
    calculateAccessoryGrids(totals, facades.length > 0)
    return totals
  }, [facades])

  const systemItems = useMemo(() => getScaffoldItems(system), [system])

  // Map material names to scaffold items for pricing
  const lineItems = useMemo(() => {
    return Object.entries(combinedMaterials)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => {
        const item = systemItems.find(si => si.name === name)
        const dailyRate = item?.dailyRate ?? 0
        const rentalCost = calcScaffoldingRental(dailyRate, rentalDays, qty)
        return { name, qty, dailyRate, rentalCost, itemNo: item?.itemNo ?? '', weight: (item?.weight ?? 0) * qty }
      })
  }, [combinedMaterials, rentalDays, systemItems])

  const subtotalRental = lineItems.reduce((s, l) => s + l.rentalCost, 0)
  const totalRental = Math.round(subtotalRental * (1 - discount / 100))
  const totalWeight = lineItems.reduce((s, l) => s + l.weight, 0)

  const primaryLevels = useMemo(() => calculateLevelsFromHeight(facades[0].height), [facades])

  const getExportData = useCallback(() => ({
    title: 'Vinnupallareiknivél',
    calculatorType: 'Vinnupallar',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [
      ['Hliðar', `${facades.length}`],
      ['Leigudagar', `${rentalDays}`],
      ['Heildarþyngd', `${Math.round(totalWeight)} kg`],
      ...(discount > 0 ? [['Afsláttur', `${discount}%`] as [string, string]] : []),
    ] as [string, string][],
    tableHeaders: ['Vörunúmer', 'Lýsing', 'Magn', 'Þyngd (kg)', 'Leiga'],
    tableRows: lineItems.map(l => [l.itemNo, l.name, l.qty, Math.round(l.weight), formatKr(l.rentalCost)]),
    totalLabel: 'Samtals:',
    totalValue: formatKr(totalRental),
  }), [client, startDate, endDate, rentalDays, facades.length, totalWeight, lineItems, totalRental, discount])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Vinnupallar — ${client.name}`
      : `Vinnupallar — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = lineItems.map(l => ({
      rentalNo: l.itemNo,
      description: l.name,
      quantity: l.qty,
      dailyRate: l.dailyRate,
      rentalCost: l.rentalCost,
      weight: l.weight,
    }))
    const data: Record<string, unknown> = { system, rentalDays, facades, startDate, endDate, discount }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'scaffolding', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, lineItems, rentalDays, facades, startDate, endDate, projectId, system, discount])

  const handleSaveTemplate = useCallback(async (name: string) => {
    const config: Record<string, unknown> = { system, rentalDays, facades, startDate, endDate, discount }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'scaffolding', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
      setTemplateDialogOpen(false)
    }
  }, [rentalDays, facades, startDate, endDate, system, discount])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Vinnupalla&shy;reiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={() => setTemplateDialogOpen(true)} savingTemplate={savingTemplate} />
      </div>

      {/* System tabs */}
      <div className="flex flex-wrap gap-2">
        {SCAFFOLD_SYSTEMS.map(s => (
          <button
            key={s.key}
            onClick={() => setSystem(s.key)}
            className={`rounded-md border px-4 py-2 text-sm transition ${
              system === s.key
                ? 'border-brand-accent bg-brand-accent/10 font-medium text-brand-dark'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-gray-400">{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Warning for systems without pricing data */}
      {!hasScaffoldPricing(system) && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Athugið:</strong> Verðskrá hefur ekki verið skráð fyrir {SCAFFOLD_SYSTEMS.find(s => s.key === system)?.name}. Verðútreikningar sýna 0 kr.
        </div>
      )}

      {/* Client info + Date range */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Facades input */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Hliðar</h2>
            <button onClick={addFacade} className="rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover">
              + Bæta við hlið
            </button>
          </div>
          {facades.map((f) => (
            <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <input
                  type="text"
                  value={f.name}
                  onChange={e => updateFacade(f.id, 'name', e.target.value)}
                  className="border-0 bg-transparent font-condensed text-base font-semibold text-brand-dark focus:ring-0"
                  title="Nafn hliðar"
                />
                {facades.length > 1 && (
                  <button onClick={() => removeFacade(f.id)} className="text-xs text-red-400 hover:text-red-600">
                    Eyða
                  </button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Lengd (m)</label>
                  <input
                    type="number" min={1} value={f.length}
                    onChange={e => updateFacade(f.id, 'length', Math.max(1, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                    title="Lengd"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Hæð (m)</label>
                  <input
                    type="number" min={2} step={0.5} value={f.height}
                    onChange={e => updateFacade(f.id, 'height', Math.max(2, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                    title="Hæð"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Endalokur</label>
                  <input
                    type="number" min={0} max={2} value={f.endcaps}
                    onChange={e => updateFacade(f.id, 'endcaps', Math.max(0, Math.min(2, Number(e.target.value))))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                    title="Endalokur"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Þök: {Math.ceil(f.length / 1.8)} stk — Borðlengd: 1.8m
              </div>
            </div>
          ))}

          {/* Rental days note */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">
              Leigudagar: <span className="font-medium text-brand-dark">{rentalDays}</span> (stillt í leigutímabili hér að ofan)
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Samantekt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Hliðar</dt>
                <dd className="font-medium">{facades.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Leigudagar</dt>
                <dd className="font-medium">{rentalDays}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Heildarþyngd</dt>
                <dd className="font-medium">{Math.round(totalWeight)} kg</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm text-gray-500">Afsláttur</label>
              <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))} title="Afsláttur %" className="w-16 rounded-md border-gray-300 text-sm text-right focus:border-brand-accent focus:ring-brand-accent" />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          <div className="rounded-lg border-2 border-brand-accent bg-brand-accent/5 p-5">
            <div className="text-sm font-medium text-gray-500">Heildarkostnaður leigu</div>
            <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
              {formatKr(totalRental)}
            </div>
            {discount > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Afsláttur {discount}%: −{formatKr(subtotalRental - totalRental)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2D/3D Viewer */}
      <ViewerPanel
        svgContent={createScaffoldDrawing({
          length: facades[0].length,
          levels2m: primaryLevels.levels2m,
          levels07m: primaryLevels.levels07m,
          legType: primaryLevels.legType,
          endcaps: facades[0].endcaps,
        })}
        model3D={
          <ScaffoldModel3D
            length={facades[0].length}
            levels2m={primaryLevels.levels2m}
            levels07m={primaryLevels.levels07m}
            legType={primaryLevels.legType}
          />
        }
        cameraPosition={[facades[0].length / 2, facades[0].height, facades[0].length]}
      />

      {/* Materials table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Efnislisti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Vörunúmer</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Lýsing</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Magn</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Þyngd (kg)</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Leiga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((line, i) => (
                <tr key={i}>
                  <td className="px-5 py-2 font-mono text-xs text-gray-500">{line.itemNo}</td>
                  <td className="px-5 py-2">{line.name}</td>
                  <td className="px-5 py-2 text-right">{line.qty}</td>
                  <td className="px-5 py-2 text-right text-gray-500">{Math.round(line.weight)}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatKr(line.rentalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-dark bg-gray-50">
                <td colSpan={3} className="px-5 py-2 text-right font-condensed font-bold text-brand-dark">Samtals:</td>
                <td className="px-5 py-2 text-right font-bold text-gray-500">{Math.round(totalWeight)} kg</td>
                <td className="px-5 py-2 text-right font-condensed font-bold text-brand-dark">{formatKr(totalRental)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <TemplateNameDialog
        open={templateDialogOpen}
        defaultName="Vinnupallar"
        onConfirm={handleSaveTemplate}
        onCancel={() => setTemplateDialogOpen(false)}
      />
    </div>
  )
}
