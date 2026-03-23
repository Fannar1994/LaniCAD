import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { FENCE_PRODUCTS, FENCE_TYPES, MIN_RENTAL_DAYS, type FenceProductData } from '@/data/fence'
import { calcFenceRental } from '@/lib/calculations/rental'
import { calcFenceGeometry } from '@/lib/calculations/geometry'
import { formatKr } from '@/lib/format'
import { ClientInfoPanel, DateRangePicker, ExportButtons } from '@/components/calculator'
import { exportPdf } from '@/lib/export-pdf'
import { exportExcel } from '@/lib/export-excel'
import { createProject, updateProject, createTemplate } from '@/lib/db'
import { ViewerPanel } from '@/components/viewer/ViewerPanel'
import { createFenceDrawing } from '@/components/viewer/drawings/FenceDrawing2D'
import { FenceModel3D } from '@/components/viewer/models/FenceModel3D'
import type { ClientInfo, LineItem as SharedLineItem } from '@/types'

const emptyClient: ClientInfo = { name: '', company: '', kennitala: '', phone: '', email: '', address: '', inspector: '' }

type PriceMode = 'standard' | 'discount'

interface LineItem {
  product: FenceProductData
  qty: number
  rentalCost: number
  saleTotal: number
}

export function FenceCalculator() {
  const location = useLocation()
  const loadedProject = location.state?.project as { id: string; name: string; data: Record<string, unknown>; client: ClientInfo } | undefined
  const loadedTemplate = location.state?.template as { id: string; name: string; config: Record<string, unknown> } | undefined
  const initData = loadedProject?.data ?? loadedTemplate?.config ?? {}

  const [selectedType, setSelectedType] = useState(initData.selectedType as string ?? FENCE_TYPES[0].key)
  const [totalLength, setTotalLength] = useState(initData.totalLength as number ?? 100)
  const [rentalDays, setRentalDays] = useState(initData.rentalDays as number ?? 30)
  const [includeGate, setIncludeGate] = useState(initData.includeGate as boolean ?? false)
  const [includeWheels, setIncludeWheels] = useState(initData.includeWheels as boolean ?? false)
  const [includeLock, setIncludeLock] = useState(initData.includeLock as boolean ?? false)
  const [stoneType, setStoneType] = useState<'concrete' | 'pvc'>(initData.stoneType as 'concrete' | 'pvc' ?? 'concrete')
  const [client, setClient] = useState<ClientInfo>(loadedProject?.client ?? emptyClient)
  const [startDate, setStartDate] = useState(initData.startDate as string ?? '')
  const [endDate, setEndDate] = useState(initData.endDate as string ?? '')
  const [priceMode, setPriceMode] = useState<PriceMode>(initData.priceMode as PriceMode ?? 'standard')
  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(loadedProject?.id ?? null)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [discount, setDiscount] = useState(initData.discount as number ?? 0)

  const fenceType = FENCE_TYPES.find(t => t.key === selectedType)!
  const fenceProduct = FENCE_PRODUCTS[fenceType.productKey]

  const geometry = useMemo(
    () => calcFenceGeometry(totalLength, fenceType.fenceLength),
    [totalLength, fenceType.fenceLength]
  )

  const effectiveDays = Math.max(rentalDays, MIN_RENTAL_DAYS)

  const lines = useMemo(() => {
    const items: LineItem[] = []
    const getPrice = (p: FenceProductData) => priceMode === 'discount' ? p.discountPrice : p.salePrice

    // Mobile fence panels
    items.push({
      product: fenceProduct,
      qty: geometry.panels,
      rentalCost: calcFenceRental(effectiveDays, fenceProduct.rates, geometry.panels),
      saleTotal: getPrice(fenceProduct) * geometry.panels,
    })

    // Stones
    const stoneProduct = FENCE_PRODUCTS[stoneType === 'concrete' ? 'stone-concrete' : 'stone-pvc']
    items.push({
      product: stoneProduct,
      qty: geometry.stones,
      rentalCost: calcFenceRental(effectiveDays, stoneProduct.rates, geometry.stones),
      saleTotal: getPrice(stoneProduct) * geometry.stones,
    })

    // Clamps
    if (geometry.clamps > 0) {
      const clampProduct = FENCE_PRODUCTS['clamps']
      items.push({
        product: clampProduct,
        qty: geometry.clamps,
        rentalCost: calcFenceRental(effectiveDays, clampProduct.rates, geometry.clamps),
        saleTotal: getPrice(clampProduct) * geometry.clamps,
      })
    }

    // Racks — auto-calculated based on fence type
    const fenceTypeKey = FENCE_TYPES.find(t => t.key === selectedType)?.key ?? ''
    if (fenceTypeKey.startsWith('standard')) {
      const rackProduct = FENCE_PRODUCTS['rack-fence']
      const rackQty = Math.ceil(geometry.panels / 25)
      if (rackQty > 0) {
        items.push({
          product: rackProduct,
          qty: rackQty,
          rentalCost: calcFenceRental(effectiveDays, rackProduct.rates, rackQty),
          saleTotal: getPrice(rackProduct) * rackQty,
        })
      }
    } else if (fenceTypeKey === 'queue') {
      const rackProduct = FENCE_PRODUCTS['rack-queue']
      const rackQty = Math.ceil(geometry.panels / 15)
      if (rackQty > 0) {
        items.push({
          product: rackProduct,
          qty: rackQty,
          rentalCost: calcFenceRental(effectiveDays, rackProduct.rates, rackQty),
          saleTotal: getPrice(rackProduct) * rackQty,
        })
      }
    }

    // Gate
    if (includeGate) {
      const gateProduct = FENCE_PRODUCTS['walking-gate']
      items.push({
        product: gateProduct,
        qty: 1,
        rentalCost: calcFenceRental(effectiveDays, gateProduct.rates, 1),
        saleTotal: getPrice(gateProduct) * 1,
      })
    }

    // Wheels
    if (includeWheels) {
      const wheelProduct = FENCE_PRODUCTS['wheels']
      items.push({
        product: wheelProduct,
        qty: 2,
        rentalCost: calcFenceRental(effectiveDays, wheelProduct.rates, 2),
        saleTotal: getPrice(wheelProduct) * 2,
      })
    }

    // Lock
    if (includeLock) {
      const lockProduct = FENCE_PRODUCTS['lock']
      items.push({
        product: lockProduct,
        qty: 1,
        rentalCost: calcFenceRental(effectiveDays, lockProduct.rates, 1),
        saleTotal: getPrice(lockProduct) * 1,
      })
    }

    return items
  }, [fenceProduct, geometry, effectiveDays, stoneType, includeGate, includeWheels, includeLock, priceMode, selectedType])

  const subtotalRental = lines.reduce((sum, l) => sum + l.rentalCost, 0)
  const subtotalSale = lines.reduce((sum, l) => sum + l.saleTotal, 0)
  const totalRental = Math.round(subtotalRental * (1 - discount / 100))
  const totalSale = Math.round(subtotalSale * (1 - discount / 100))

  const getExportData = useCallback(() => {
    const fenceType = FENCE_TYPES.find(t => t.key === selectedType)!
    return {
      title: 'Girðingareiknivél',
      calculatorType: 'Girðingar',
      client,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      rentalDays: effectiveDays,
      summaryRows: [
        ['Tegund', fenceType.label],
        ['Heildarlengd', `${totalLength} m`],
        ['Fjöldi grindar', `${geometry.panels}`],
        ['Fjöldi steina', `${geometry.stones}`],
        ['Leigudagar', `${effectiveDays}`],
        ['Verðflokkur', priceMode === 'discount' ? 'Spariverð' : 'Grunnverð'],
        ...(discount > 0 ? [['Afsláttur', `${discount}%`] as [string, string]] : []),
      ] as [string, string][],
      tableHeaders: ['Vörunúmer', 'Lýsing', 'Magn', priceMode === 'discount' ? 'Spariverð' : 'Grunnverð', 'Leiga'],
      tableRows: lines.map(l => [l.product.saleNo, l.product.description, l.qty, formatKr(l.saleTotal), formatKr(l.rentalCost)]),
      totalLabel: 'Samtals:',
      totalValue: `${formatKr(totalSale)} (sala) / ${formatKr(totalRental)} (leiga)`,
    }
  }, [selectedType, client, startDate, endDate, effectiveDays, totalLength, geometry, lines, totalRental, totalSale, priceMode, discount])

  const handleSave = useCallback(async () => {
    const name = client.name
      ? `Girðingar — ${client.name}`
      : `Girðingar — ${new Date().toLocaleDateString('is-IS')}`
    const sharedLines: SharedLineItem[] = lines.map(l => ({
      rentalNo: l.product.rentalNo,
      description: l.product.description,
      quantity: l.qty,
      rentalCost: l.rentalCost,
    }))
    const data: Record<string, unknown> = {
      selectedType, totalLength, rentalDays: effectiveDays, includeGate, includeWheels, includeLock, stoneType, priceMode, discount, startDate, endDate,
    }
    try {
      setSaving(true)
      if (projectId) {
        await updateProject(projectId, { name, client, data, line_items: sharedLines })
        toast.success('Verkefni uppfært')
      } else {
        const created = await createProject({ name, type: 'fence', client, data, line_items: sharedLines })
        setProjectId(created.id)
        toast.success('Verkefni vistað')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun')
    } finally {
      setSaving(false)
    }
  }, [client, lines, selectedType, totalLength, effectiveDays, includeGate, includeWheels, includeLock, stoneType, priceMode, discount, startDate, endDate, projectId])

  const handleSaveTemplate = useCallback(async () => {
    const name = prompt('Heiti sniðmáts:', `Girðingar — ${selectedType}`)
    if (!name) return
    const config: Record<string, unknown> = {
      selectedType, totalLength, rentalDays: effectiveDays, includeGate, includeWheels, includeLock, stoneType, priceMode, discount, startDate, endDate,
    }
    try {
      setSavingTemplate(true)
      await createTemplate({ type: 'fence', name, config })
      toast.success('Sniðmát vistað')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Villa við vistun sniðmáts')
    } finally {
      setSavingTemplate(false)
    }
  }, [selectedType, totalLength, effectiveDays, includeGate, includeWheels, includeLock, stoneType, priceMode, discount, startDate, endDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-condensed text-2xl font-bold text-brand-dark">Girðingareiknivél</h1>
        <ExportButtons onExportPdf={() => exportPdf(getExportData())} onExportExcel={() => exportExcel(getExportData())} onSave={handleSave} saving={saving} onSaveTemplate={handleSaveTemplate} savingTemplate={savingTemplate} />
      </div>

      {/* Client info + Date range */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClientInfoPanel client={client} onChange={setClient} />
        <DateRangePicker startDate={startDate} endDate={endDate} rentalDays={rentalDays} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onRentalDaysChange={setRentalDays} />
      </div>

      {/* Input section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Tegund girðingar</h2>
          <div className="grid grid-cols-2 gap-2">
            {FENCE_TYPES.map(ft => (
              <button
                key={ft.key}
                onClick={() => setSelectedType(ft.key)}
                className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                  selectedType === ft.key
                    ? 'border-brand-accent bg-brand-accent/10 font-medium text-brand-dark'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heildarlengd (m)
            </label>
            <input
              type="number"
              min={1}
              value={totalLength}
              onChange={e => setTotalLength(Math.max(1, Number(e.target.value)))}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              title="Heildarlengd"
            />
            {rentalDays < MIN_RENTAL_DAYS && (
              <p className="mt-1 text-xs text-amber-600">
                Lágmark {MIN_RENTAL_DAYS} dagar — reiknað sem {MIN_RENTAL_DAYS} dagar
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Steinar</label>
            <div className="mt-1 flex gap-4">
              <label className="inline-flex items-center text-sm">
                <input
                  type="radio"
                  value="concrete"
                  checked={stoneType === 'concrete'}
                  onChange={() => setStoneType('concrete')}
                  className="text-brand-accent focus:ring-brand-accent"
                />
                <span className="ml-2">Steinsteypa</span>
              </label>
              <label className="inline-flex items-center text-sm">
                <input
                  type="radio"
                  value="pvc"
                  checked={stoneType === 'pvc'}
                  onChange={() => setStoneType('pvc')}
                  className="text-brand-accent focus:ring-brand-accent"
                />
                <span className="ml-2">PVC</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Söluverð</label>
            <div className="mt-1 flex gap-4">
              <label className="inline-flex items-center text-sm">
                <input
                  type="radio"
                  value="standard"
                  checked={priceMode === 'standard'}
                  onChange={() => setPriceMode('standard')}
                  className="text-brand-accent focus:ring-brand-accent"
                />
                <span className="ml-2">Grunnverð</span>
              </label>
              <label className="inline-flex items-center text-sm">
                <input
                  type="radio"
                  value="discount"
                  checked={priceMode === 'discount'}
                  onChange={() => setPriceMode('discount')}
                  className="text-brand-accent focus:ring-brand-accent"
                />
                <span className="ml-2">Spariverð</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Aukahlutir</label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeGate} onChange={e => setIncludeGate(e.target.checked)} className="rounded text-brand-accent focus:ring-brand-accent" />
              Gönguhliðar
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeWheels} onChange={e => setIncludeWheels(e.target.checked)} className="rounded text-brand-accent focus:ring-brand-accent" />
              Hjól f/hliðar (2x)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={includeLock} onChange={e => setIncludeLock(e.target.checked)} className="rounded text-brand-accent focus:ring-brand-accent" />
              Lás
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Samantekt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Tegund</dt>
                <dd className="font-medium">{fenceType.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Heildarlengd</dt>
                <dd className="font-medium">{totalLength} m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fjöldi grindar</dt>
                <dd className="font-medium">{geometry.panels}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fjöldi steina</dt>
                <dd className="font-medium">{geometry.stones}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fjöldi klemmur</dt>
                <dd className="font-medium">{geometry.clamps}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Leigutímabil</dt>
                <dd className="font-medium">{effectiveDays} dagar</dd>
              </div>
            </dl>
          </div>

          {/* Discount */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Afsláttur</label>
              <input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={e => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-20 rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                title="Afsláttur %"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          <div className="rounded-lg border-2 border-brand-accent bg-brand-accent/5 p-5">
            <div className="flex justify-between">
              <div>
                <div className="text-sm font-medium text-gray-500">{priceMode === 'discount' ? 'Spariverð sala' : 'Grunnverð sala'}</div>
                <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
                  {formatKr(totalSale)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500">Heildarkostnaður leigu</div>
                <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
                  {formatKr(totalRental)}
                </div>
              </div>
            </div>
            {discount > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Afsláttur: -{discount}% ({formatKr(Math.round(subtotalRental * discount / 100))} af leigu)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2D/3D Viewer */}
      <ViewerPanel
        svgContent={createFenceDrawing({
          panels: geometry.panels,
          panelWidth: fenceType.fenceLength,
          panelHeight: fenceType.key === 'standard-low' ? 1.2 : fenceType.key === 'queue' ? 1.1 : 2.0,
          stones: geometry.stones,
          clamps: geometry.clamps,
          includeGate,
        })}
        model3D={
          <FenceModel3D
            panels={geometry.panels}
            panelWidth={fenceType.fenceLength}
            panelHeight={fenceType.key === 'standard-low' ? 1.2 : fenceType.key === 'queue' ? 1.1 : 2.0}
            includeGate={includeGate}
          />
        }
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
                <th className="px-5 py-2 text-right font-medium text-gray-600">{priceMode === 'discount' ? 'Spariverð' : 'Grunnverð'}</th>
                <th className="px-5 py-2 text-right font-medium text-gray-600">Leiga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="px-5 py-2 font-mono text-xs text-gray-500">{line.product.saleNo}</td>
                  <td className="px-5 py-2">{line.product.description}</td>
                  <td className="px-5 py-2 text-right">{line.qty}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatKr(line.saleTotal)}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatKr(line.rentalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-dark bg-gray-50">
                <td colSpan={3} className="px-5 py-2 text-right font-condensed font-bold text-brand-dark">
                  Samtals:
                </td>
                <td className="px-5 py-2 text-right font-condensed font-bold text-brand-dark">
                  {formatKr(totalSale)}
                </td>
                <td className="px-5 py-2 text-right font-condensed font-bold text-brand-dark">
                  {formatKr(totalRental)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Discount note + period breakdown */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          <span>💡</span>
          <span><strong>Ábending:</strong> Leiguverð lækkar sjálfkrafa eftir leigutíma. Sjá nánar í sundurliðun eftir tímabilum.</span>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 text-sm font-medium text-brand-dark hover:text-brand-accent transition"
        >
          <span>{showBreakdown ? '▲' : '▼'}</span>
          Sjá sundurliðun eftir tímabilum
        </button>

        {showBreakdown && (() => {
          const numPeriods = Math.min(Math.ceil(effectiveDays / 30), 12)
          const CHUNK = 6

          // Pre-calculate period data
          const dailyTotals: number[] = []
          const periodCosts: number[] = []
          for (let p = 0; p < numPeriods; p++) {
            let dailyTotal = 0
            for (const line of lines) {
              dailyTotal += line.product.rates[p] * line.qty
            }
            dailyTotals.push(dailyTotal)
            const remaining = effectiveDays - p * 30
            const pDays = remaining > 0 ? Math.min(remaining, 30) : 0
            periodCosts.push(dailyTotal * pDays)
          }

          const numChunks = Math.ceil(numPeriods / CHUNK)

          return (
            <div className="space-y-4 overflow-x-auto">
              {Array.from({ length: numChunks }, (_, c) => {
                const pFrom = c * CHUNK
                const pTo = Math.min(pFrom + CHUNK, numPeriods)
                return (
                  <table key={c} className="w-full text-xs border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600 border border-gray-200">Vara</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600 border border-gray-200">Magn</th>
                        {Array.from({ length: pTo - pFrom }, (_, pi) => {
                          const p = pFrom + pi
                          const pStart = p * 30 + 1
                          const pEnd = Math.min((p + 1) * 30, effectiveDays)
                          return (
                            <th key={p} className="px-3 py-2 text-right font-medium text-gray-600 border border-gray-200">
                              Dagar {pStart}–{pEnd}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 border border-gray-200">{line.product.description}</td>
                          <td className="px-3 py-1.5 text-right border border-gray-200">{line.qty}</td>
                          {Array.from({ length: pTo - pFrom }, (_, pi) => {
                            const p = pFrom + pi
                            const dailyCost = line.product.rates[p] * line.qty
                            return (
                              <td key={p} className="px-3 py-1.5 text-right border border-gray-200">
                                {formatKr(dailyCost)} <span className="text-gray-400">({line.product.rates[p]} kr/d)</span>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={2} className="px-3 py-1.5 border border-gray-200">Samtals dagleiga</td>
                        {Array.from({ length: pTo - pFrom }, (_, pi) => (
                          <td key={pi} className="px-3 py-1.5 text-right border border-gray-200">
                            {formatKr(dailyTotals[pFrom + pi])} kr
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={2} className="px-3 py-1.5 border border-gray-200">Samt.kostn.pr.mán</td>
                        {Array.from({ length: pTo - pFrom }, (_, pi) => (
                          <td key={pi} className="px-3 py-1.5 text-right border border-gray-200">
                            {formatKr(periodCosts[pFrom + pi])} kr
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-brand-accent/10 font-bold">
                        <td colSpan={2} className="px-3 py-1.5 border border-gray-200">Heildarkostnaður</td>
                        {Array.from({ length: pTo - pFrom }, (_, pi) => {
                          const p = pFrom + pi
                          let cumulative = 0
                          for (let pp = 0; pp <= p; pp++) cumulative += periodCosts[pp]
                          return (
                            <td key={pi} className="px-3 py-1.5 text-right border border-gray-200">
                              {formatKr(cumulative)} kr
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
