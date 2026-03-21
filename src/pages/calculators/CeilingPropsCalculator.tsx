import { useState, useMemo } from 'react'
import { LOFTASTODIR, MOTABITAR, AUKAHLUTIR, CLASS_INFO } from '@/data/ceiling-props'
import { calcStandardRental } from '@/lib/calculations/rental'
import { formatKr } from '@/lib/format'

interface LineItem {
  id: string
  desc: string
  qty: number
  rentalCost: number
}

export function CeilingPropsCalculator() {
  const [rentalDays, setRentalDays] = useState(14)
  const [selectedPropIdx, setSelectedPropIdx] = useState(3)
  const [propQty, setPropQty] = useState(10)
  const [selectedBeamIdx, setSelectedBeamIdx] = useState(0)
  const [beamQty, setBeamQty] = useState(4)

  // Accessories with quantity state
  const [accessoryQtys, setAccessoryQtys] = useState<number[]>(AUKAHLUTIR.map(() => 0))

  const selectedProp = LOFTASTODIR[selectedPropIdx]
  const selectedBeam = MOTABITAR[selectedBeamIdx]

  const lines = useMemo(() => {
    const items: LineItem[] = []

    // Props
    if (propQty > 0) {
      items.push({
        id: selectedProp.id,
        desc: `${selectedProp.name} (${selectedProp.classLabel})`,
        qty: propQty,
        rentalCost: calcStandardRental(selectedProp.dayRate, selectedProp.weekRate, rentalDays, propQty),
      })
    }

    // Beams
    if (beamQty > 0) {
      items.push({
        id: selectedBeam.id,
        desc: `${selectedBeam.name} (${selectedBeam.length_m}m)`,
        qty: beamQty,
        rentalCost: calcStandardRental(selectedBeam.dayRate, selectedBeam.weekRate, rentalDays, beamQty),
      })
    }

    // Accessories
    AUKAHLUTIR.forEach((acc, i) => {
      if (accessoryQtys[i] > 0) {
        items.push({
          id: acc.id,
          desc: acc.name,
          qty: accessoryQtys[i],
          rentalCost: calcStandardRental(acc.dayRate, acc.weekRate, rentalDays, accessoryQtys[i]),
        })
      }
    })

    return items
  }, [selectedProp, selectedBeam, propQty, beamQty, rentalDays, accessoryQtys])

  const totalRental = lines.reduce((sum, l) => sum + l.rentalCost, 0)

  const classInfo = CLASS_INFO[selectedProp.classKey]

  return (
    <div className="space-y-6">
      <h1 className="font-condensed text-2xl font-bold text-brand-dark">Loftastoðir og mótabitar</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input section */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Loftastoðir</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Veldu stoð</label>
            <select
              value={selectedPropIdx}
              onChange={e => setSelectedPropIdx(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            >
              {LOFTASTODIR.map((p, i) => (
                <option key={p.id} value={i}>
                  {p.name} ({p.minHeight}–{p.maxHeight}m) — {p.classLabel}
                </option>
              ))}
            </select>
          </div>

          {classInfo && (
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
              <span className="font-medium">{classInfo.label}</span>: {classInfo.desc} · {classInfo.kN}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fjöldi stoða</label>
              <input
                type="number"
                min={0}
                value={propQty}
                onChange={e => setPropQty(Math.max(0, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leigudagar</label>
              <input
                type="number"
                min={1}
                value={rentalDays}
                onChange={e => setRentalDays(Math.max(1, Number(e.target.value)))}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
              />
            </div>
          </div>

          <hr className="border-gray-200" />
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Mótabitar HT-20</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Veldu bita</label>
            <select
              value={selectedBeamIdx}
              onChange={e => setSelectedBeamIdx(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            >
              {MOTABITAR.map((b, i) => (
                <option key={b.id} value={i}>
                  {b.name} — {b.weight_kg} kg
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fjöldi bita</label>
            <input
              type="number"
              min={0}
              value={beamQty}
              onChange={e => setBeamQty(Math.max(0, Number(e.target.value)))}
              className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
            />
          </div>

          <hr className="border-gray-200" />
          <h2 className="font-condensed text-lg font-semibold text-brand-dark">Aukahlutir</h2>
          <div className="space-y-2">
            {AUKAHLUTIR.map((acc, i) => (
              <div key={acc.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">{acc.name}</span>
                <input
                  type="number"
                  min={0}
                  value={accessoryQtys[i]}
                  onChange={e => {
                    const next = [...accessoryQtys]
                    next[i] = Math.max(0, Number(e.target.value))
                    setAccessoryQtys(next)
                  }}
                  className="w-20 rounded-md border-gray-300 text-sm shadow-sm focus:border-brand-accent focus:ring-brand-accent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-condensed text-lg font-semibold text-brand-dark">Samantekt</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Stoð</dt>
                <dd className="font-medium">{selectedProp.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Hæðarbil</dt>
                <dd className="font-medium">{selectedProp.minHeight}–{selectedProp.maxHeight} m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Flokkur</dt>
                <dd className="font-medium">{selectedProp.classLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Þyngd</dt>
                <dd className="font-medium">{selectedProp.weight_kg} kg/stk</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fjöldi stoða</dt>
                <dd className="font-medium">{propQty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Bitar</dt>
                <dd className="font-medium">{selectedBeam.name} × {beamQty}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Leigutímabil</dt>
                <dd className="font-medium">{rentalDays} dagar</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Samtals þyngd</dt>
                <dd className="font-medium">
                  {Math.round(propQty * selectedProp.weight_kg + beamQty * selectedBeam.weight_kg)} kg
                </dd>
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
                <th className="px-5 py-2 text-right font-medium text-gray-600">Leiga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.map((line, i) => (
                <tr key={i}>
                  <td className="px-5 py-2 font-mono text-xs text-gray-500">{line.id}</td>
                  <td className="px-5 py-2">{line.desc}</td>
                  <td className="px-5 py-2 text-right">{line.qty}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatKr(line.rentalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                <td className="px-5 py-2" colSpan={3}>Samtals leiga</td>
                <td className="px-5 py-2 text-right">{formatKr(totalRental)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
