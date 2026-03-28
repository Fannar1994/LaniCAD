import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons, TemplateNameDialog } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import { createProject, updateProject, createTemplate } from '@/lib/db'
import type { ClientInfo, LineItem as SharedLineItem } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

// Topec table/panel sizes — Hünnebeck Topec slab formwork system
// These are representative sizes based on the Topec system catalog
interface TopecPanel {
  id: string
  desc: string
  lengthCm: number
  widthCm: number
  dayRate: number
  weekRate: number
}

const TOPEC_PANELS: TopecPanel[] = [
  { id: '01-MÓT-TP01-200', desc: 'Topec borð 200×50', lengthCm: 200, widthCm: 50, dayRate: 124, weekRate: 560 },
  { id: '01-MÓT-TP01-150', desc: 'Topec borð 150×50', lengthCm: 150, widthCm: 50, dayRate: 100, weekRate: 450 },
  { id: '01-MÓT-TP01-100', desc: 'Topec borð 100×50', lengthCm: 100, widthCm: 50, dayRate: 80, weekRate: 360 },
]

interface TopecAccessory {
  id: string
  desc: string
  dayRate: number
  weekRate: number
}

const TOPEC_ACCESSORIES: TopecAccessory[] = [
  { id: '01-MÓT-TP21-001', desc: 'Topec fótur / base jack', dayRate: 22, weekRate: 99 },
  { id: '01-MÓT-TP21-002', desc: 'Topec dropphöfuð / drop head', dayRate: 34, weekRate: 153 },
  { id: '01-MÓT-TP21-003', desc: 'Topec HT-20 biti 2,65 m', dayRate: 40, weekRate: 180 },
  { id: '01-MÓT-TP21-004', desc: 'Topec HT-20 biti 3,90 m', dayRate: 52, weekRate: 234 },
  { id: '01-MÓT-TP21-010', desc: 'Topec krossband / cross brace', dayRate: 18, weekRate: 81 },
  { id: '01-MÓT-TP21-020', desc: 'Topec PVC kantborð / edge strip', dayRate: 8, weekRate: 36 },
]

interface BoQItem {
  id: string
  desc: string
  qty: number
  dayRate: number
  weekRate: number
  cat: string
}

function calculateTopec(
  slabLengthM: number,
  slabWidthM: number,
  _slabHeightM: number,
): { boq: BoQItem[]; modeLabel: string } {
  const boq: BoQItem[] = []
  const slabL = slabLengthM * 100
  const slabW = slabWidthM * 100

  // Calculate number of tables needed
  // Primary direction: along slab length
  const tablesW = Math.ceil(slabW / 50)

  // Use the best fitting panel
  const panel200 = TOPEC_PANELS[0]
  const panel150 = TOPEC_PANELS[1]
  const panel100 = TOPEC_PANELS[2]

  // Simple panel packing: use 200cm panels as primary, fill remainder
  const fullPanels = Math.floor(slabL / 200) * tablesW
  const remainder = slabL - Math.floor(slabL / 200) * 200
  let remainderPanels = 0
  let remainderPanel = panel100

  if (remainder > 150) {
    remainderPanels = tablesW
    remainderPanel = panel200
  } else if (remainder > 100) {
    remainderPanels = tablesW
    remainderPanel = panel150
  } else if (remainder > 0) {
    remainderPanels = tablesW
    remainderPanel = panel100
  }

  if (fullPanels > 0) {
    boq.push({ id: panel200.id, desc: panel200.desc, qty: fullPanels, dayRate: panel200.dayRate, weekRate: panel200.weekRate, cat: 'Topec borð' })
  }
  if (remainderPanels > 0) {
    boq.push({ id: remainderPanel.id, desc: remainderPanel.desc, qty: remainderPanels, dayRate: remainderPanel.dayRate, weekRate: remainderPanel.weekRate, cat: 'Topec borð' })
  }

  // Props: 1 per 1.5m spacing in both directions
  const propsL = Math.floor(slabL / 150) + 1
  const propsW = Math.floor(slabW / 150) + 1
  const totalProps = propsL * propsW

  // Base jacks
  const baseJack = TOPEC_ACCESSORIES[0]
  boq.push({ id: baseJack.id, desc: baseJack.desc, qty: totalProps, dayRate: baseJack.dayRate, weekRate: baseJack.weekRate, cat: 'Stoðir' })

  // Drop heads
  const dropHead = TOPEC_ACCESSORIES[1]
  boq.push({ id: dropHead.id, desc: dropHead.desc, qty: totalProps, dayRate: dropHead.dayRate, weekRate: dropHead.weekRate, cat: 'Stoðir' })

  // Beams: primary beams along slab width, secondary along length
  const beam265 = TOPEC_ACCESSORIES[2]
  const beam390 = TOPEC_ACCESSORIES[3]
  const primaryBeamLen = beam390.desc.includes('3,90') ? 390 : 265
  const primaryBeams = propsW * Math.ceil(slabL / primaryBeamLen)
  const secondaryBeams = propsL * Math.ceil(slabW / 265)
  boq.push({ id: beam390.id, desc: beam390.desc, qty: primaryBeams, dayRate: beam390.dayRate, weekRate: beam390.weekRate, cat: 'HT-20 Bitar' })
  boq.push({ id: beam265.id, desc: beam265.desc, qty: secondaryBeams, dayRate: beam265.dayRate, weekRate: beam265.weekRate, cat: 'HT-20 Bitar' })

  // Cross braces
  const crossBrace = TOPEC_ACCESSORIES[4]
  const braces = Math.max(propsL, propsW) * 2
  boq.push({ id: crossBrace.id, desc: crossBrace.desc, qty: braces, dayRate: crossBrace.dayRate, weekRate: crossBrace.weekRate, cat: 'Krossbönd' })

  // Edge strips
  const edgeStrip = TOPEC_ACCESSORIES[5]
  const perimeter = 2 * (slabL + slabW)
  boq.push({ id: edgeStrip.id, desc: edgeStrip.desc, qty: Math.ceil(perimeter / 150), dayRate: edgeStrip.dayRate, weekRate: edgeStrip.weekRate, cat: 'PVC kantar' })

  return { boq, modeLabel: `TOPEC Loft (${slabLengthM} × ${slabWidthM} m)` }
}

function calcTotal(boq: BoQItem[], days: number, discount: number): number {
  let total = 0
  for (const item of boq) {
    total += days < 7
      ? item.dayRate * days * item.qty
      : item.weekRate * Math.ceil(days / 7) * item.qty
  }
  return total * (1 - discount / 100)
}

function calcItemCost(item: BoQItem, days: number): number {
  return days < 7
    ? item.dayRate * days * item.qty
    : item.weekRate * Math.ceil(days / 7) * item.qty
}

export function TopecCalculator() {
  const location = useLocation()
  const loadedProject = location.state?.project as { id: string; name: string; data: Record<string, unknown>; client: ClientInfo } | undefined
  const loadedTemplate = location.state?.template as { id: string; name: string; config: Record<string, unknown> } | undefined
  const initData = loadedProject?.data ?? loadedTemplate?.config ?? {}

  const [rentalDays, setRentalDays] = useState(initData.rentalDays as number ?? 14)
  const [discount, setDiscount] = useState(initData.discount as number ?? 0)
  const [client, setClient] = useState<ClientInfo>(loadedProject?.client ?? emptyClient)
  const [startDate, setStartDate] = useState(initData.startDate as string ?? '')
  const [endDate, setEndDate] = useState(initData.endDate as string ?? '')
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(loadedProject?.id ?? null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  const [slabLength, setSlabLength] = useState(initData.slabLength as number ?? 6)
  const [slabWidth, setSlabWidth] = useState(initData.slabWidth as number ?? 5)
  const [slabHeight, setSlabHeight] = useState(initData.slabHeight as number ?? 2.8)

  const result = useMemo(() =>
    calculateTopec(slabLength, slabWidth, slabHeight),
    [slabLength, slabWidth, slabHeight])

  const totalCost = calcTotal(result.boq, rentalDays, discount)

  const groupedBoq = useMemo(() => {
    const groups = new Map<string, BoQItem[]>()
    for (const item of result.boq) {
      const existing = groups.get(item.cat) || []
      existing.push(item)
      groups.set(item.cat, existing)
    }
    return groups
  }, [result.boq])

  const getExportData = useCallback(() => ({
    title: 'Topec reiknivél',
    calculatorType: 'Topec',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [
      ['Kerfi', 'Topec Loft'],
      ['Loft', `${slabLength} × ${slabWidth} m`],
      ['Lofthæð', `${slabHeight} m`],
      ['Leigudagar', `${rentalDays}`],
      ['Efnisliðir', `${result.boq.length}`],
      ...(discount > 0 ? [['Afsláttur', `${discount}%`] as [string, string]] : []),
    ] as [string, string][],
    tableHeaders: ['Vörunúmer', 'Lýsing', 'Flokkur', 'Magn', 'Leiga'],
    tableRows: result.boq.map(item => [item.id, item.desc, item.cat, item.qty, formatKr(calcItemCost(item, rentalDays))]),
    totalLabel: 'Samtals:',
    totalValue: formatKr(totalCost),
  }), [client, startDate, endDate, rentalDays, discount, result, totalCost, slabLength, slabWidth, slabHeight])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Topec — ${client.name}`
      : `Topec — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = result.boq.map(item => ({
      rentalNo: item.id,
      description: item.desc,
      quantity: item.qty,
      rentalCost: calcItemCost(item, rentalDays),
    }))
    const data: Record<string, unknown> = {
      rentalDays, discount, startDate, endDate,
      slabLength, slabWidth, slabHeight,
    }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'topec', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, result.boq, rentalDays, discount, startDate, endDate, slabLength, slabWidth, slabHeight, projectId])

  const handleSaveTemplate = useCallback(async (name: string) => {
    const config: Record<string, unknown> = {
      rentalDays, discount, startDate, endDate,
      slabLength, slabWidth, slabHeight,
    }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'topec', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
      setTemplateDialogOpen(false)
    }
  }, [rentalDays, discount, startDate, endDate, slabLength, slabWidth, slabHeight])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Topec reiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={() => setTemplateDialogOpen(true)} savingTemplate={savingTemplate} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Athugið:</strong> Topec vöruverð eru bráðabirgðaverð. Uppfært verðskrá verður sett inn síðar.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Topec loftamót</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Loftlengd (m)</label>
              <input type="number" min={0.5} step={0.1} value={slabLength} title="Loftlengd"
                onChange={e => setSlabLength(Math.max(0.5, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loftbreidd (m)</label>
              <input type="number" min={0.5} step={0.1} value={slabWidth} title="Loftbreidd"
                onChange={e => setSlabWidth(Math.max(0.5, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lofthæð (m)</label>
            <input type="number" min={0.5} step={0.1} value={slabHeight} title="Lofthæð"
              onChange={e => setSlabHeight(Math.max(0.5, Number(e.target.value)))}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Samantekt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Kerfi</dt><dd className="font-medium">{result.modeLabel}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Loft</dt><dd className="font-medium">{slabLength} × {slabWidth} m</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Leigutímabil</dt><dd className="font-medium">{rentalDays} dagar</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Fjöldi efnisliða</dt><dd className="font-medium">{result.boq.length}</dd></div>
              {discount > 0 && <div className="flex justify-between"><dt className="text-gray-500">Afsláttur</dt><dd className="font-medium text-green-600">-{discount}%</dd></div>}
            </dl>
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm text-gray-500">Afsláttur</label>
              <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))} title="Afsláttur %" className="w-16 rounded-md border-gray-300 text-sm text-right focus:border-brand-accent focus:ring-brand-accent" />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          <div className="rounded-lg border-2 border-brand-accent bg-brand-accent/5 p-5">
            <div className="text-sm font-medium text-gray-500">Heildarkostnaður leigu</div>
            <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">{formatKr(totalCost)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Efnislisti — {result.modeLabel}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Vörunúmer</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Lýsing</th>
                <th className="px-5 py-2 text-left font-medium text-gray-600">Flokkur</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Magn</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Leiga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from(groupedBoq.entries()).map(([cat, items]) =>
                items.map((item, i) => (
                  <tr key={`${cat}-${i}`}>
                    <td className="px-5 py-2 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="px-5 py-2">{item.desc}</td>
                    <td className="px-5 py-2 text-xs text-gray-400">{item.cat}</td>
                    <td className="px-5 py-2 text-right">{item.qty}</td>
                    <td className="px-5 py-2 text-right font-medium">{formatKr(calcItemCost(item, rentalDays))}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="px-5 py-2" colSpan={4}>Samtals leiga</td>
                <td className="px-5 py-2 text-right">{formatKr(totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <TemplateNameDialog open={templateDialogOpen} defaultName="Topec" onConfirm={handleSaveTemplate} onCancel={() => setTemplateDialogOpen(false)} />
    </div>
  )
}
