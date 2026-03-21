import { useState, useMemo } from 'react'
import { ViewerPanel } from '@/components/viewer/ViewerPanel'
import { createFenceDrawing } from '@/components/viewer/drawings/FenceDrawing2D'
import { createScaffoldDrawing } from '@/components/viewer/drawings/ScaffoldDrawing2D'
import { createRollingScaffoldDrawing } from '@/components/viewer/drawings/RollingScaffoldDrawing2D'
import { createFormworkDrawing } from '@/components/viewer/drawings/FormworkDrawing2D'
import { createCeilingPropsDrawing } from '@/components/viewer/drawings/CeilingPropsDrawing2D'
import { FenceModel3D } from '@/components/viewer/models/FenceModel3D'
import { ScaffoldModel3D } from '@/components/viewer/models/ScaffoldModel3D'
import { RollingScaffoldModel3D } from '@/components/viewer/models/RollingScaffoldModel3D'
import { FormworkModel3D } from '@/components/viewer/models/FormworkModel3D'
import { CeilingPropsModel3D } from '@/components/viewer/models/CeilingPropsModel3D'

type EquipmentType = 'fence' | 'scaffold' | 'rolling' | 'formwork' | 'ceiling'

const equipmentOptions: { value: EquipmentType; label: string }[] = [
  { value: 'fence', label: 'Girðingar' },
  { value: 'scaffold', label: 'Vinnupallar' },
  { value: 'rolling', label: 'Hjólapallar' },
  { value: 'formwork', label: 'Steypumót' },
  { value: 'ceiling', label: 'Loftastoðir' },
]

export function DrawingPage() {
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('fence')

  // Fence params
  const [fencePanels, setFencePanels] = useState(6)
  const [fencePanelWidth, setFencePanelWidth] = useState(3.5)
  const [fencePanelHeight, setFencePanelHeight] = useState(2.0)
  const [fenceIncludeGate, setFenceIncludeGate] = useState(false)

  // Scaffold params
  const [scaffoldLength, setScaffoldLength] = useState(10)
  const [scaffoldLevels2m, setScaffoldLevels2m] = useState(3)
  const [scaffoldLevels07m, setScaffoldLevels07m] = useState(0)
  const [scaffoldLegType, setScaffoldLegType] = useState<'50cm' | '100cm'>('50cm')

  // Rolling scaffold params
  const [rollingHeight, setRollingHeight] = useState(6)
  const [rollingWidth, setRollingWidth] = useState<'narrow' | 'wide'>('wide')

  // Formwork params
  const [formworkLength, setFormworkLength] = useState(6)
  const [formworkHeight, setFormworkHeight] = useState(3)
  const [formworkSystem, setFormworkSystem] = useState<'Rasto' | 'Takko' | 'Manto'>('Rasto')

  // Ceiling props params
  const [ceilingPropCount, setCeilingPropCount] = useState(4)
  const [ceilingPropHeight, setCeilingPropHeight] = useState(3)
  const [ceilingBeamCount, setCeilingBeamCount] = useState(3)
  const [ceilingRoomWidth, setCeilingRoomWidth] = useState(6)

  const svgContent = useMemo(() => {
    switch (equipmentType) {
      case 'fence':
        return createFenceDrawing({
          panels: fencePanels,
          panelWidth: fencePanelWidth,
          panelHeight: fencePanelHeight,
          stones: fencePanels + 1,
          clamps: fencePanels - 1,
          includeGate: fenceIncludeGate,
        })
      case 'scaffold':
        return createScaffoldDrawing({
          length: scaffoldLength,
          levels2m: scaffoldLevels2m,
          levels07m: scaffoldLevels07m,
          legType: scaffoldLegType,
          endcaps: 0,
        })
      case 'rolling':
        return createRollingScaffoldDrawing({
          height: rollingHeight,
          width: rollingWidth,
        })
      case 'formwork':
        return createFormworkDrawing({
          wallLength: formworkLength,
          wallHeight: formworkHeight,
          system: formworkSystem,
        })
      case 'ceiling':
        return createCeilingPropsDrawing({
          propCount: ceilingPropCount,
          propHeight: ceilingPropHeight,
          beamCount: ceilingBeamCount,
          roomWidth: ceilingRoomWidth,
        })
    }
  }, [
    equipmentType,
    fencePanels, fencePanelWidth, fencePanelHeight, fenceIncludeGate,
    scaffoldLength, scaffoldLevels2m, scaffoldLevels07m, scaffoldLegType,
    rollingHeight, rollingWidth,
    formworkLength, formworkHeight, formworkSystem,
    ceilingPropCount, ceilingPropHeight, ceilingBeamCount, ceilingRoomWidth,
  ])

  const model3D = useMemo(() => {
    switch (equipmentType) {
      case 'fence':
        return <FenceModel3D panels={fencePanels} panelWidth={fencePanelWidth} panelHeight={fencePanelHeight} includeGate={fenceIncludeGate} />
      case 'scaffold':
        return <ScaffoldModel3D length={scaffoldLength} levels2m={scaffoldLevels2m} levels07m={scaffoldLevels07m} legType={scaffoldLegType} />
      case 'rolling':
        return <RollingScaffoldModel3D height={rollingHeight} width={rollingWidth} />
      case 'formwork':
        return <FormworkModel3D wallLength={formworkLength} wallHeight={formworkHeight} system={formworkSystem} />
      case 'ceiling':
        return <CeilingPropsModel3D propCount={ceilingPropCount} propHeight={ceilingPropHeight} beamCount={ceilingBeamCount} roomWidth={ceilingRoomWidth} />
    }
  }, [
    equipmentType,
    fencePanels, fencePanelWidth, fencePanelHeight, fenceIncludeGate,
    scaffoldLength, scaffoldLevels2m, scaffoldLevels07m, scaffoldLegType,
    rollingHeight, rollingWidth,
    formworkLength, formworkHeight, formworkSystem,
    ceilingPropCount, ceilingPropHeight, ceilingBeamCount, ceilingRoomWidth,
  ])

  const cameraPosition: [number, number, number] = useMemo(() => {
    switch (equipmentType) {
      case 'fence': return [fencePanels * fencePanelWidth * 0.6, 4, 8]
      case 'scaffold': return [scaffoldLength * 0.6, scaffoldLevels2m * 2, scaffoldLength * 0.8]
      case 'rolling': return [4, rollingHeight * 0.7, 6]
      case 'formwork': return [formworkLength * 0.6, formworkHeight, formworkLength * 0.8]
      case 'ceiling': return [ceilingRoomWidth * 0.6, ceilingPropHeight, ceilingRoomWidth * 0.8]
    }
  }, [equipmentType, fencePanels, fencePanelWidth, scaffoldLength, scaffoldLevels2m, rollingHeight, formworkLength, formworkHeight, ceilingRoomWidth, ceilingPropHeight])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-condensed font-bold text-brand-dark">Teikning</h1>
        <p className="text-sm text-gray-500 mt-1">2D og 3D teikningar af búnaði</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tegund búnaðar</label>
              <select
                value={equipmentType}
                onChange={e => setEquipmentType(e.target.value as EquipmentType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                {equipmentOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Dynamic parameter inputs */}
            {equipmentType === 'fence' && (
              <>
                <NumberInput label="Fjöldi panela" value={fencePanels} onChange={setFencePanels} min={1} max={50} />
                <SelectInput label="Panelabreidd" value={String(fencePanelWidth)} onChange={v => setFencePanelWidth(Number(v))} options={[
                  { value: '3.5', label: '3.5m (Iðnaðar)' },
                  { value: '2.5', label: '2.5m' },
                  { value: '2.1', label: '2.1m' },
                ]} />
                <SelectInput label="Hæð" value={String(fencePanelHeight)} onChange={v => setFencePanelHeight(Number(v))} options={[
                  { value: '2.0', label: '2.0m' },
                  { value: '1.8', label: '1.8m' },
                ]} />
                <CheckboxInput label="Hlið (gátt)" checked={fenceIncludeGate} onChange={setFenceIncludeGate} />
              </>
            )}

            {equipmentType === 'scaffold' && (
              <>
                <NumberInput label="Lengd (m)" value={scaffoldLength} onChange={setScaffoldLength} min={1.8} max={100} step={1.8} />
                <NumberInput label="2m hæðir" value={scaffoldLevels2m} onChange={setScaffoldLevels2m} min={1} max={10} />
                <NumberInput label="0.7m hæðir" value={scaffoldLevels07m} onChange={setScaffoldLevels07m} min={0} max={5} />
                <SelectInput label="Fótar" value={scaffoldLegType} onChange={v => setScaffoldLegType(v as '50cm' | '100cm')} options={[
                  { value: '50cm', label: '50cm fótur' },
                  { value: '100cm', label: '100cm fótur' },
                ]} />
              </>
            )}

            {equipmentType === 'rolling' && (
              <>
                <NumberInput label="Pallhæð (m)" value={rollingHeight} onChange={setRollingHeight} min={2} max={14} step={1} />
                <SelectInput label="Breidd" value={rollingWidth} onChange={v => setRollingWidth(v as 'narrow' | 'wide')} options={[
                  { value: 'narrow', label: 'Mjór (0.75m)' },
                  { value: 'wide', label: 'Breiður (1.35m)' },
                ]} />
              </>
            )}

            {equipmentType === 'formwork' && (
              <>
                <NumberInput label="Vegglengd (m)" value={formworkLength} onChange={setFormworkLength} min={1} max={30} step={0.5} />
                <NumberInput label="Vegghæð (m)" value={formworkHeight} onChange={setFormworkHeight} min={1} max={6} step={0.5} />
                <SelectInput label="Kerfi" value={formworkSystem} onChange={v => setFormworkSystem(v as 'Rasto' | 'Takko' | 'Manto')} options={[
                  { value: 'Rasto', label: 'Rasto' },
                  { value: 'Takko', label: 'Takko' },
                  { value: 'Manto', label: 'Manto' },
                ]} />
              </>
            )}

            {equipmentType === 'ceiling' && (
              <>
                <NumberInput label="Fjöldi stoða" value={ceilingPropCount} onChange={setCeilingPropCount} min={1} max={20} />
                <NumberInput label="Stoðhæð (m)" value={ceilingPropHeight} onChange={setCeilingPropHeight} min={1.5} max={5.5} step={0.1} />
                <NumberInput label="Fjöldi bita (HT-20)" value={ceilingBeamCount} onChange={setCeilingBeamCount} min={1} max={10} />
                <NumberInput label="Herbergisbreidd (m)" value={ceilingRoomWidth} onChange={setCeilingRoomWidth} min={2} max={15} step={0.5} />
              </>
            )}
          </div>
        </div>

        {/* Viewer area */}
        <div className="lg:col-span-3">
          <ViewerPanel
            svgContent={svgContent}
            model3D={model3D}
            cameraPosition={cameraPosition}
          />
        </div>
      </div>
    </div>
  )
}

/* ---- Reusable input components ---- */

function NumberInput({ label, value, onChange, min, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />
    </div>
  )
}

function SelectInput({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function CheckboxInput({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
      />
      {label}
    </label>
  )
}
