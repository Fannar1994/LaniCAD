import { useState, useMemo } from 'react'
import { SCAFFOLD_ITEMS, BOARD_LENGTH_M } from '@/data/scaffolding'
import { calculateLevelsFromHeight, calculateFacadeMaterials } from '@/lib/calculations/geometry'
import { calcScaffoldingRental } from '@/lib/calculations/rental'
import { formatKr } from '@/lib/format'

interface Facade {
  id: number
  name: string
  length: number
  height: number
  endcaps: number
}

export function ScaffoldCalculator() {
  const [rentalDays, setRentalDays] = useState(30)
  const [facades, setFacades] = useState<Facade[]>([
    { id: 1, name: 'Hlið 1', length: 20, height: 8, endcaps: 2 }
  ])

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
      for (const [key, qty] of Object.entries(mats)) {
        totals[key] = (totals[key] || 0) + qty
      }
    })
    return totals
  }, [facades])

  // Map material names to scaffold items for pricing
  const lineItems = useMemo(() => {
    return Object.entries(combinedMaterials)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => {
        const item = SCAFFOLD_ITEMS.find(si => si.name === name)
        const dailyRate = item?.dailyRate ?? 0
        const rentalCost = calcScaffoldingRental(dailyRate, rentalDays, qty)
        return { name, qty, dailyRate, rentalCost, itemNo: item?.itemNo ?? '', weight: (item?.weight ?? 0) * qty }
      })
  }, [combinedMaterials, rentalDays])

  const totalRental = lineItems.reduce((s, l) => s + l.rentalCost, 0)
  const totalWeight = lineItems.reduce((s, l) => s + l.weight, 0)

  return (
    <div className="space-y-6">
      <h1 className="font-condensed text-2xl font-bold text-brand-dark">Vinnupalla&shy;reiknivél</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Facades input */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Hliðar</h2>
            <button onClick={addFacade} className="rounded-md bg-brand-accent px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-accent-hover">
              + Bæta við hlið
            </button>
          </div>
          {facades.map((f, i) => (
            <div key={f.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <input
                  type="text"
                  value={f.name}
                  onChange={e => updateFacade(f.id, 'name', e.target.value)}
                  className="border-0 bg-transparent font-condensed text-base font-semibold text-brand-dark focus:ring-0"
                />
                {facades.length > 1 && (
                  <button onClick={() => removeFacade(f.id)} className="text-xs text-red-400 hover:text-red-600">
                    Eyða
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Lengd (m)</label>
                  <input
                    type="number" min={1} value={f.length}
                    onChange={e => updateFacade(f.id, 'length', Math.max(1, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Hæð (m)</label>
                  <input
                    type="number" min={2} step={0.5} value={f.height}
                    onChange={e => updateFacade(f.id, 'height', Math.max(2, Number(e.target.value)))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Endalokur</label>
                  <input
                    type="number" min={0} max={2} value={f.endcaps}
                    onChange={e => updateFacade(f.id, 'endcaps', Math.max(0, Math.min(2, Number(e.target.value))))}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Þök: {Math.ceil(f.length / BOARD_LENGTH_M)} stk — Borðlengd: {BOARD_LENGTH_M}m
              </div>
            </div>
          ))}

          {/* Rental days */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700">Leigudagar</label>
            <input
              type="number" min={1} value={rentalDays}
              onChange={e => setRentalDays(Math.max(1, Number(e.target.value)))}
              className="mt-1 block w-48 rounded-md border-gray-300 text-sm focus:border-brand-accent focus:ring-brand-accent"
            />
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
          </div>
          <div className="rounded-lg border-2 border-brand-accent bg-brand-accent/5 p-5">
            <div className="text-sm font-medium text-gray-500">Heildarkostnaður leigu</div>
            <div className="mt-1 font-condensed text-3xl font-bold text-brand-dark">
              {formatKr(totalRental)}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  )
}
