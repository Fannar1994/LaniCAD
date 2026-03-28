import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FORMWORK_SYSTEMS, MANTO_HEIGHTS, TIE_BAR_OPTIONS } from '@/data/formwork'
import {
  calculateModeA,
  calculateModeB,
  calcFormworkTotal,
  calcFormworkItemCost,
  type BoQItem,
} from '@/lib/calculations/formwork'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons, TemplateNameDialog } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import { createProject, updateProject, createTemplate } from '@/lib/db'
import { ViewerPanel } from '@/components/viewer/ViewerPanel'
import { createFormworkDrawing } from '@/components/viewer/drawings/FormworkDrawing2D'
import { FormworkModel3D } from '@/components/viewer/models/FormworkModel3D'
import { useCanvas2D, type CanvasObject } from '@/hooks/useCanvas2D'
import { EQUIPMENT_COLORS } from '@/lib/geometry-config'
import type { ClientInfo, LineItem as SharedLineItem } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

type SystemKey = 'manto' | 'rasto'

const WALL_SYSTEMS = FORMWORK_SYSTEMS.filter(s => s.key === 'manto' || s.key === 'rasto')

export function FormworkCalculator() {
  const location = useLocation()
  const navigate = useNavigate()
  const loadedProject = location.state?.project as { id: string; name: string; data: Record<string, unknown>; client: ClientInfo } | undefined
  const loadedTemplate = location.state?.template as { id: string; name: string; config: Record<string, unknown> } | undefined
  const initData = loadedProject?.data ?? loadedTemplate?.config ?? {}

  const [system, setSystem] = useState<SystemKey>(initData.system as SystemKey ?? 'manto')
  const [rentalDays, setRentalDays] = useState(initData.rentalDays as number ?? 14)
  const [discount, setDiscount] = useState(initData.discount as number ?? 0)
  const [client, setClient] = useState<ClientInfo>(loadedProject?.client ?? emptyClient)
  const [startDate, setStartDate] = useState(initData.startDate as string ?? '')
  const [endDate, setEndDate] = useState(initData.endDate as string ?? '')
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(loadedProject?.id ?? null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  // Mode A (Rasto/Takko)
  const [aWallLength, setAWallLength] = useState(initData.aWallLength as number ?? 12)
  const [aSubSystem, setASubSystem] = useState<'rasto' | 'takko'>(initData.aSubSystem as 'rasto' | 'takko' ?? 'rasto')
  const [aInsideCorners, setAInsideCorners] = useState(initData.aInsideCorners as number ?? 0)
  const [aOutsideCorners, setAOutsideCorners] = useState(initData.aOutsideCorners as number ?? 0)
  const [aOpenEnds, setAOpenEnds] = useState(initData.aOpenEnds as number ?? 0)
  const [aTieBar, setATieBar] = useState(initData.aTieBar as string ?? TIE_BAR_OPTIONS[0].id)

  // Mode B (Manto)
  const [bWallLength, setBWallLength] = useState(initData.bWallLength as number ?? 12)
  const [bHeight, setBHeight] = useState(initData.bHeight as number ?? 300)
  const [bInsideCorners, setBInsideCorners] = useState(initData.bInsideCorners as number ?? 0)
  const [bOutsideCorners, setBOutsideCorners] = useState(initData.bOutsideCorners as number ?? 0)
  const [bOpenEnds, setBOpenEnds] = useState(initData.bOpenEnds as number ?? 0)
  const [bTieBar, setBTieBar] = useState(initData.bTieBar as string ?? TIE_BAR_OPTIONS[0].id)

  // Interactive 2D canvas
  const canvas = useCanvas2D()
  const canvasInitRef = useRef(false)

  // Current wall dimensions for canvas objects
  const drawDims = useMemo(() => {
    if (system === 'rasto') return { w: aWallLength, h: aSubSystem === 'rasto' ? 3.0 : 1.2 }
    return { w: bWallLength, h: bHeight / 100 }
  }, [system, aWallLength, aSubSystem, bWallLength, bHeight])

  useEffect(() => {
    if (!canvasInitRef.current) {
      canvasInitRef.current = true
      const saved = initData.canvasObjects as CanvasObject[] | undefined
      if (saved && saved.length > 0) {
        canvas.setObjects(saved)
        return
      }
    }
    const objs: CanvasObject[] = [{
      id: 'wall_0',
      type: 'panel',
      label: WALL_SYSTEMS.find(s => s.key === system)?.name ?? 'Mót',
      x: 0.5,
      y: 0.5,
      width: drawDims.w,
      height: drawDims.h,
      rotation: 0,
      color: EQUIPMENT_COLORS.formwork,
    }]
    canvas.setObjects(objs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawDims.w, drawDims.h, system])

  const result = useMemo(() => {
    if (system === 'rasto') {
      return calculateModeA(aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar)
    } else {
      return calculateModeB(bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar)
    }
  }, [system, aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar,
      bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar])

  const totalCost = calcFormworkTotal(result.boq, rentalDays, discount)

  // Group BoQ by category
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
    title: 'Steypumótareiknivél',
    calculatorType: 'Steypumót',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [
      ['Kerfi', result.modeLabel],
      ['Leigudagar', `${rentalDays}`],
      ['Efnisliðir', `${result.boq.length}`],
      ...(discount > 0 ? [['Afsláttur', `${discount}%`] as [string, string]] : []),
    ] as [string, string][],
    tableHeaders: ['Vörunúmer', 'Lýsing', 'Flokkur', 'Magn', 'Leiga'],
    tableRows: result.boq.map(item => [item.id, item.desc, item.cat, item.qty, formatKr(calcFormworkItemCost(item, rentalDays))]),
    totalLabel: 'Samtals:',
    totalValue: formatKr(totalCost),
  }), [client, startDate, endDate, rentalDays, discount, result, totalCost])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Steypumót — ${client.name}`
      : `Steypumót — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = result.boq.map(item => ({
      rentalNo: item.id,
      description: item.desc,
      quantity: item.qty,
      rentalCost: calcFormworkItemCost(item, rentalDays),
    }))
    const data: Record<string, unknown> = {
      system, rentalDays, discount, startDate, endDate,
      aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar,
      bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar,
      canvasObjects: canvas.objects,
    }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'formwork', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, result.boq, rentalDays, system, discount, startDate, endDate,
      aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar,
      bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar, projectId])

  const handleSaveTemplate = useCallback(async (name: string) => {
    const config: Record<string, unknown> = {
      system, rentalDays, discount, startDate, endDate,
      aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar,
      bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar,
    }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'formwork', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
      setTemplateDialogOpen(false)
    }
  }, [system, rentalDays, discount, startDate, endDate,
      aWallLength, aSubSystem, aInsideCorners, aOutsideCorners, aOpenEnds, aTieBar,
      bWallLength, bHeight, bInsideCorners, bOutsideCorners, bOpenEnds, bTieBar])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Steypumótareiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={() => setTemplateDialogOpen(true)} savingTemplate={savingTemplate} />
      </div>

      {/* Client info + Date range */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      {/* System tabs */}
      <div className="flex gap-2">
        {WALL_SYSTEMS.map(s => (
          <button
            key={s.key}
            onClick={() => setSystem(s.key as SystemKey)}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">

          {/* MODE A: Rasto / Takko */}
          {system === 'rasto' && (
            <>
              <h2 className="font-condensed text-lg font-semibold text-brand-dark">Rasto / Takko veggmót</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kerfisgerð</label>
                <div className="mt-1 flex gap-3">
                  <label className="inline-flex items-center text-sm">
                    <input type="radio" value="rasto" checked={aSubSystem === 'rasto'} onChange={() => setASubSystem('rasto')} className="text-brand-accent focus:ring-brand-accent" />
                    <span className="ml-2">Rasto (3 m hæð)</span>
                  </label>
                  <label className="inline-flex items-center text-sm">
                    <input type="radio" value="takko" checked={aSubSystem === 'takko'} onChange={() => setASubSystem('takko')} className="text-brand-accent focus:ring-brand-accent" />
                    <span className="ml-2">Takko (1,2 m hæð)</span>
                  </label>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vegglengd (m)</label>
                  <input type="number" min={0.3} step={0.1} value={aWallLength} onChange={e => setAWallLength(Math.max(0.3, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Vegglengd" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mótateinar</label>
                  <select value={aTieBar} onChange={e => setATieBar(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                    title="Mótateinar">
                    {TIE_BAR_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Innhorn</label>
                  <input type="number" min={0} value={aInsideCorners} onChange={e => setAInsideCorners(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Innhorn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Úthorn</label>
                  <input type="number" min={0} value={aOutsideCorners} onChange={e => setAOutsideCorners(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Úthorn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opnir endar</label>
                  <input type="number" min={0} value={aOpenEnds} onChange={e => setAOpenEnds(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Opnir endar" />
                </div>
              </div>
            </>
          )}

          {/* MODE B: Manto */}
          {system === 'manto' && (
            <>
              <h2 className="font-condensed text-lg font-semibold text-brand-dark">Manto kranamót</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vegglengd (m)</label>
                  <input type="number" min={0.3} step={0.1} value={bWallLength} onChange={e => setBWallLength(Math.max(0.3, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Vegglengd" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vegghæð</label>
                  <select value={bHeight} onChange={e => setBHeight(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                    title="Vegghæð">
                    {MANTO_HEIGHTS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mótateinar</label>
                <select value={bTieBar} onChange={e => setBTieBar(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                  title="Mótateinar">
                  {TIE_BAR_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Innhorn</label>
                  <input type="number" min={0} value={bInsideCorners} onChange={e => setBInsideCorners(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Innhorn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Úthorn</label>
                  <input type="number" min={0} value={bOutsideCorners} onChange={e => setBOutsideCorners(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Úthorn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opnir endar</label>
                  <input type="number" min={0} value={bOpenEnds} onChange={e => setBOpenEnds(Math.max(0, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" title="Opnir endar" />
                </div>
              </div>
            </>
          )}

        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Samantekt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Kerfi</dt>
                <dd className="font-medium">{result.modeLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Leigutímabil</dt>
                <dd className="font-medium">{rentalDays} dagar</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fjöldi efnisliða</dt>
                <dd className="font-medium">{result.boq.length}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Afsláttur</dt>
                  <dd className="font-medium text-green-600">-{discount}%</dd>
                </div>
              )}
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
              {formatKr(totalCost)}
            </div>
          </div>
        </div>
      </div>

      {/* 2D/3D Viewer */}
      {(() => {
        let drawSystem: 'Rasto' | 'Takko' | 'Manto'
        let drawLength: number
        let drawHeight: number
        if (system === 'rasto') {
          drawSystem = aSubSystem === 'rasto' ? 'Rasto' : 'Takko'
          drawLength = aWallLength
          drawHeight = aSubSystem === 'rasto' ? 3.0 : 1.2
        } else {
          drawSystem = 'Manto'
          drawLength = bWallLength
          drawHeight = bHeight / 100
        }
        return (
          <ViewerPanel
            svgContent={createFormworkDrawing({ wallLength: drawLength, wallHeight: drawHeight, system: drawSystem })}
            model3D={
              <FormworkModel3D wallLength={drawLength} wallHeight={drawHeight} system={drawSystem} />
            }
            canvas={canvas}
            placementType="panel"
            placementDefaults={{ width: drawLength, height: drawHeight, color: EQUIPMENT_COLORS.formwork }}
            onOpenInDrawing={() => navigate('/drawing', { state: { equipmentType: 'formwork', params: { length: drawLength, height: drawHeight, system: drawSystem } } })}
          />
        )
      })()}

      {/* BoQ table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">
            Efnislisti — {result.modeLabel}
          </h2>
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
              {Array.from(groupedBoq.entries()).map(([cat, items]) => (
                items.map((item, i) => (
                  <tr key={`${cat}-${i}`}>
                    <td className="px-5 py-2 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="px-5 py-2">{item.desc}</td>
                    <td className="px-5 py-2 text-xs text-gray-400">{item.cat}</td>
                    <td className="px-5 py-2 text-right">{item.qty}</td>
                    <td className="px-5 py-2 text-right font-medium">{formatKr(calcFormworkItemCost(item, rentalDays))}</td>
                  </tr>
                ))
              ))}
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
      <TemplateNameDialog open={templateDialogOpen} defaultName={`Steypumót — ${system}`} onConfirm={handleSaveTemplate} onCancel={() => setTemplateDialogOpen(false)} />
    </div>
  )
}
