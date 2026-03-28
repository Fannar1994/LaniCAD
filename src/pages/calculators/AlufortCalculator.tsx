import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  calculateModeC,
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

export function AlufortCalculator() {
  const location = useLocation()
  const navigate = useNavigate()
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
  const [concreteThickness, setConcreteThickness] = useState(initData.concreteThickness as number ?? 0.2)
  const [spacingL, setSpacingL] = useState(initData.spacingL as number ?? 1.5)
  const [spacingW, setSpacingW] = useState(initData.spacingW as number ?? 1.5)
  const [useID, setUseID] = useState(initData.useID as boolean ?? false)

  const canvas = useCanvas2D()
  const canvasInitRef = useRef(false)

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
      id: 'slab_0',
      type: 'panel',
      label: 'Alufort',
      x: 0.5, y: 0.5,
      width: slabLength, height: slabWidth,
      rotation: 0,
      color: EQUIPMENT_COLORS.formwork,
    }]
    canvas.setObjects(objs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slabLength, slabWidth])

  const result = useMemo(() =>
    calculateModeC(slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID),
    [slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID])

  const totalCost = calcFormworkTotal(result.boq, rentalDays, discount)

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
    title: 'Alufort reiknivél',
    calculatorType: 'Alufort',
    client,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    rentalDays,
    summaryRows: [
      ['Kerfi', 'Alufort Loft'],
      ['Loft', `${slabLength} × ${slabWidth} m`],
      ['Lofthæð / Steypuþykkt', `${slabHeight} m / ${concreteThickness} m`],
      ['Leigudagar', `${rentalDays}`],
      ['Efnisliðir', `${result.boq.length}`],
      ...(discount > 0 ? [['Afsláttur', `${discount}%`] as [string, string]] : []),
    ] as [string, string][],
    tableHeaders: ['Vörunúmer', 'Lýsing', 'Flokkur', 'Magn', 'Leiga'],
    tableRows: result.boq.map(item => [item.id, item.desc, item.cat, item.qty, formatKr(calcFormworkItemCost(item, rentalDays))]),
    totalLabel: 'Samtals:',
    totalValue: formatKr(totalCost),
  }), [client, startDate, endDate, rentalDays, discount, result, totalCost, slabLength, slabWidth, slabHeight, concreteThickness])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Alufort — ${client.name}`
      : `Alufort — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = result.boq.map(item => ({
      rentalNo: item.id,
      description: item.desc,
      quantity: item.qty,
      rentalCost: calcFormworkItemCost(item, rentalDays),
    }))
    const data: Record<string, unknown> = {
      rentalDays, discount, startDate, endDate,
      slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID,
      canvasObjects: canvas.objects,
    }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'alufort', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, result.boq, rentalDays, discount, startDate, endDate, slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID, projectId, canvas.objects])

  const handleSaveTemplate = useCallback(async (name: string) => {
    const config: Record<string, unknown> = {
      rentalDays, discount, startDate, endDate,
      slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID,
    }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'alufort', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
      setTemplateDialogOpen(false)
    }
  }, [rentalDays, discount, startDate, endDate, slabLength, slabWidth, slabHeight, concreteThickness, spacingL, spacingW, useID])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Alufort reiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={() => setTemplateDialogOpen(true)} savingTemplate={savingTemplate} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Alufort loftamót</h2>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Lofthæð (m)</label>
              <input type="number" min={0.5} step={0.1} value={slabHeight} title="Lofthæð"
                onChange={e => setSlabHeight(Math.max(0.5, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Steypuþykkt (m)</label>
              <input type="number" min={0.05} step={0.01} value={concreteThickness} title="Steypuþykkt"
                onChange={e => setConcreteThickness(Math.max(0.05, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stoðabil lengd (m)</label>
              <input type="number" min={0.5} step={0.1} value={spacingL} title="Stoðabil lengd"
                onChange={e => setSpacingL(Math.max(0.5, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stoðabil breidd (m)</label>
              <input type="number" min={0.5} step={0.1} value={spacingW} title="Stoðabil breidd"
                onChange={e => setSpacingW(Math.max(0.5, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useID} onChange={e => setUseID(e.target.checked)} className="rounded text-brand-accent focus:ring-brand-accent" />
            Nota ID-ramma (shoring towers)
          </label>
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

      <ViewerPanel
        svgContent={createFormworkDrawing({ wallLength: slabLength, wallHeight: slabHeight / 100, system: 'Alufort' })}
        model3D={<FormworkModel3D wallLength={slabLength} wallHeight={slabHeight / 100} system="Alufort" />}
        canvas={canvas}
        placementType="panel"
        placementDefaults={{ width: slabLength, height: slabWidth, color: EQUIPMENT_COLORS.formwork }}
        onOpenInDrawing={() => navigate('/drawing', { state: { equipmentType: 'formwork', params: { length: slabLength, height: slabHeight / 100, system: 'Alufort' } } })}
      />

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
                    <td className="px-5 py-2 text-right font-medium">{formatKr(calcFormworkItemCost(item, rentalDays))}</td>
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
      <TemplateNameDialog open={templateDialogOpen} defaultName="Alufort" onConfirm={handleSaveTemplate} onCancel={() => setTemplateDialogOpen(false)} />
    </div>
  )
}
