// Formwork calculation logic — ported from original HTML calculator
import {
  HM01, HM02, HM21, KM01, KM21, LM02, LM22, LM81, LM51, LM71, AH21,
  type FormworkPanel, type FormworkAccessory, type FormworkProp, type FormworkBeam,
  type FormworkIDFrame,
} from '@/data/formwork'

export interface BoQItem {
  id: string
  desc: string
  qty: number
  dayRate: number
  weekRate: number
  cat: string
}

export interface FormworkResult {
  boq: BoQItem[]
  modeLabel: string
}

// ---- helpers ----

function pushBoQ(boq: BoQItem[], item: FormworkAccessory | FormworkPanel | FormworkProp | FormworkBeam | FormworkIDFrame | undefined, qty: number, cat: string) {
  if (item && qty > 0) {
    boq.push({ id: item.id, desc: item.desc, qty, dayRate: item.dayRate, weekRate: item.weekRate, cat })
  }
}

export function packPanels(lengthCm: number, panels: FormworkPanel[]): { used: Map<string, number>; gap: number } {
  const available = panels
    .filter(p => !p.corner && !p.comp && !p.mp && !p.special && p.w > 0)
    .sort((a, b) => b.w - a.w)

  let remaining = lengthCm
  const used = new Map<string, number>()

  while (remaining > 0) {
    let placed = false
    for (const p of available) {
      if (p.w <= remaining) {
        used.set(p.id, (used.get(p.id) || 0) + 1)
        remaining -= p.w
        placed = true
        break
      }
    }
    if (!placed) {
      const compPanel = panels.find(p => p.comp)
      if (compPanel && remaining >= compPanel.w) {
        const strips = Math.floor(remaining / compPanel.w)
        used.set(compPanel.id, (used.get(compPanel.id) || 0) + strips)
        remaining -= strips * compPanel.w
      }
      break
    }
  }
  return { used, gap: remaining }
}

function getTieRows(heightCm: number, system: string): number {
  if (system === 'takko') return 2
  if (system === 'rasto') return 3
  if (heightCm <= 60) return 1
  if (heightCm <= 120) return 2
  if (heightCm <= 240) return 2
  if (heightCm <= 300) return 3
  return 4
}

function getClampsPerJoint(heightCm: number): number {
  if (heightCm <= 120) return 2
  if (heightCm <= 300) return 3
  return 4
}

function getMaxStrutSpacing(system: string): number {
  return system === 'takko' ? 270 : 225
}

function getOuterCornerClamps(heightCm: number, system: string): number {
  if (system === 'takko') return 2
  if (heightCm <= 120) return 3
  if (heightCm <= 300) return 6
  if (heightCm <= 450) return 7
  return 9
}

// ---- Mode A: Rasto / Takko ----
export function calculateModeA(
  wallLengthM: number,
  system: 'rasto' | 'takko',
  insideCorners: number,
  outsideCorners: number,
  openEnds: number,
  tieBarId: string,
): FormworkResult {
  const wallLength = wallLengthM * 100
  const panels = system === 'rasto' ? HM01 : HM02
  const accessories = HM21
  const netLength = Math.max(30, wallLength)
  const { used } = packPanels(netLength, panels)
  const boq: BoQItem[] = []

  for (const [id, count] of used) {
    const p = panels.find(x => x.id === id)!
    boq.push({ id: p.id, desc: p.desc, qty: count * 2, dayRate: p.dayRate, weekRate: p.weekRate, cat: 'Mótaflekar' })
  }

  const totalPanelsOneFace = Array.from(used.values()).reduce((s, n) => s + n, 0)

  if (insideCorners > 0) {
    const ic = panels.find(p => p.corner === 'inside')
    if (ic) boq.push({ id: ic.id, desc: ic.desc, qty: insideCorners * 2, dayRate: ic.dayRate, weekRate: ic.weekRate, cat: 'Horn' })
  }
  if (outsideCorners > 0) {
    const oc = panels.find(p => p.corner === 'outside')
    if (oc) boq.push({ id: oc.id, desc: oc.desc, qty: outsideCorners * 2, dayRate: oc.dayRate, weekRate: oc.weekRate, cat: 'Horn' })
  }

  const heightCm = system === 'rasto' ? 300 : 120
  const tieRows = getTieRows(heightCm, system)
  const clampsPerJoint = getClampsPerJoint(heightCm)
  const joints = Math.max(0, totalPanelsOneFace - 1)
  const compPanel = panels.find(p => p.comp)
  const compCount = compPanel ? (used.get(compPanel.id) || 0) : 0

  pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-000'), joints * clampsPerJoint * 2, 'Klemmur')

  if (compCount > 0) {
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-910'), compCount * clampsPerJoint * 2, 'Klemmur')
  }

  if (outsideCorners > 0) {
    const perCorner = getOuterCornerClamps(heightCm, system)
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-900'), outsideCorners * perCorner, 'Klemmur')
  }

  const tieRods = joints * tieRows
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-600'), tieRods, 'Mótarær')
  pushBoQ(boq, AH21.find(a => a.id === tieBarId), tieRods, 'Mótateinar')

  const braces = Math.ceil(wallLength / getMaxStrutSpacing(system))
  if (system === 'takko') {
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-110'), braces, 'Skástífur')
  } else {
    pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-093'), braces, 'Skástífur')
  }
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-114'), braces, 'Skástífufestingar')
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-746'), braces * 2, 'Festingar')
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-001'), braces, 'Sökkulskór')

  if (openEnds > 0) {
    const endStopsPerEnd = Math.ceil(heightCm / 100)
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-667'), openEnds * endStopsPerEnd, 'Endar')
  }

  if (system === 'rasto') {
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-810'), Math.ceil(wallLength / 250), 'Vinnupallar')
  }

  const totalPanelArea = (netLength * heightCm / 10000) * 2
  if (totalPanelArea > 5) {
    pushBoQ(boq, accessories.find(a => a.id === '01-MÓT-HM21-167'), Math.ceil(totalPanelArea / 25) * 2, 'Kranakrókar')
  }

  return { boq, modeLabel: system === 'rasto' ? 'RASTO (3 m)' : 'TAKKO (1,2 m)' }
}

// ---- Mode B: Manto ----
export function calculateModeB(
  wallLengthM: number,
  height: number,
  insideCorners: number,
  outsideCorners: number,
  openEnds: number,
  tieBarId: string,
): FormworkResult {
  const wallLength = wallLengthM * 100
  const heightPanels = KM01.filter(p => p.h === height && !p.corner && !p.comp && !p.special)
  const compPanel = KM01.find(p => p.comp && p.h === height)
  const panelSet = [...heightPanels]
  if (compPanel) panelSet.push(compPanel)

  const netLength = Math.max(30, wallLength)
  const { used } = packPanels(netLength, panelSet)
  const boq: BoQItem[] = []

  for (const [id, count] of used) {
    const p = KM01.find(x => x.id === id)!
    boq.push({ id: p.id, desc: p.desc, qty: count * 2, dayRate: p.dayRate, weekRate: p.weekRate, cat: 'Mótaflekar' })
  }

  const totalPanelsOneFace = Array.from(used.values()).reduce((s, n) => s + n, 0)

  if (insideCorners > 0) {
    const ic = KM01.find(p => p.corner === 'inside' && p.h === height)
    if (ic) boq.push({ id: ic.id, desc: ic.desc, qty: insideCorners * 2, dayRate: ic.dayRate, weekRate: ic.weekRate, cat: 'Horn' })
  }
  if (outsideCorners > 0) {
    const oc = KM01.find(p => p.corner === 'outside' && p.h === height)
    if (oc) boq.push({ id: oc.id, desc: oc.desc, qty: outsideCorners * 2, dayRate: oc.dayRate, weekRate: oc.weekRate, cat: 'Horn' })
  }

  const tieRows = getTieRows(height, 'manto')
  const clampsPerJoint = getClampsPerJoint(height)
  const joints = Math.max(0, totalPanelsOneFace - 1)
  const compCount = compPanel ? (used.get(compPanel.id) || 0) : 0

  pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-000'), joints * clampsPerJoint * 2, 'Klemmur')

  if (compCount > 0) {
    pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-898'), compCount * clampsPerJoint * 2, 'Klemmur')
  }

  const flekaCount = totalPanelsOneFace * Math.ceil(tieRows / 2) * 2
  pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-010'), flekaCount, 'Klemmur')

  if (outsideCorners > 0 || insideCorners > 0) {
    const perOuterCorner = getOuterCornerClamps(height, 'manto')
    pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-227'), outsideCorners * perOuterCorner + insideCorners * 2, 'Klemmur')
  }

  const tieRods = joints * tieRows
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-600'), tieRods, 'Mótarær')
  pushBoQ(boq, AH21.find(a => a.id === tieBarId), tieRods, 'Mótateinar')

  const braces = Math.ceil(wallLength / getMaxStrutSpacing('manto'))
  if (height > 300) {
    pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-103'), braces, 'Skástífur')
  } else {
    pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-093'), braces, 'Skástífur')
  }
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-114'), braces, 'Skástífufestingar')
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-746'), braces * 2, 'Festingar')
  pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-001'), braces, 'Sökkulskór')

  if (openEnds > 0) {
    pushBoQ(boq, HM21.find(a => a.id === '01-MÓT-HM21-667'), openEnds * Math.ceil(height / 100), 'Endar')
  }

  if (height >= 270) {
    pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-205'), Math.ceil(wallLength / 250), 'Vinnupallar')
  }

  const totalPanelArea = (netLength * height / 10000) * 2
  if (totalPanelArea > 5) {
    pushBoQ(boq, KM21.find(a => a.id === '01-MÓT-KM21-710'), Math.ceil(totalPanelArea / 25) * 2, 'Kranakrókar')
  }

  if (openEnds > 0) {
    pushBoQ(boq, AH21.find(a => a.id === '01-MÓT-AH21-410'), openEnds * 2, 'Dregarar')
  }

  return { boq, modeLabel: `MANTO (${(height / 100).toFixed(1)} m)` }
}

// ---- Mode C: Alufort Slab ----
function packSlabDirection(totalCm: number, sizes: number[]): { pieces: number[]; gap: number } {
  sizes.sort((a, b) => b - a)
  let remaining = totalCm
  const pieces: number[] = []
  while (remaining > 0) {
    let placed = false
    for (const s of sizes) {
      if (s <= remaining + 0.5) {
        pieces.push(s)
        remaining -= s
        placed = true
        break
      }
    }
    if (!placed) break
  }
  return { pieces, gap: remaining }
}

function selectProp(slabH: number, _concreteT: number): FormworkProp | undefined {
  const propH = slabH - 35
  const suitable = LM51.filter(p => propH >= p.minH && propH <= p.maxH)
  if (suitable.length === 0) return LM51[LM51.length - 1]
  suitable.sort((a, b) => a.dayRate - b.dayRate)
  return suitable[0]
}

function selectBeam(spacingCm: number): FormworkBeam | undefined {
  const suitable = LM71.filter(b => b.length >= spacingCm)
  if (suitable.length === 0) return LM71[LM71.length - 1]
  suitable.sort((a, b) => a.length - b.length)
  return suitable[0]
}

export function calculateModeC(
  slabLengthM: number,
  slabWidthM: number,
  slabHeightM: number,
  concreteThicknessM: number,
  spacingLM: number,
  spacingWM: number,
  useID: boolean,
): FormworkResult {
  const slabL = slabLengthM * 100
  const slabW = slabWidthM * 100
  const slabH = slabHeightM * 100
  const concreteT = concreteThicknessM * 100
  const spacingL = spacingLM * 100
  const spacingW = spacingWM * 100

  const panelL = packSlabDirection(slabL, [150, 75])
  const panelW = packSlabDirection(slabW, [75, 37.5])

  const panelCounts = new Map<string, number>()
  for (const pl of panelL.pieces) {
    for (const pw of panelW.pieces) {
      const panel = LM02.find(p => (p.w === pw && p.h === pl) || (p.w === pl && p.h === pw))
      if (panel) panelCounts.set(panel.id, (panelCounts.get(panel.id) || 0) + 1)
    }
  }

  const boq: BoQItem[] = []
  for (const [id, count] of panelCounts) {
    const p = LM02.find(x => x.id === id)
    if (p) boq.push({ id: p.id, desc: p.desc, qty: count, dayRate: p.dayRate, weekRate: p.weekRate, cat: 'Loftaflekar' })
  }

  const propsL = Math.floor(slabL / spacingL) + 1
  const propsW = Math.floor(slabW / spacingW) + 1
  const totalProps = propsL * propsW
  const selectedProp = selectProp(slabH, concreteT)

  if (selectedProp) {
    if (useID) {
      const idFrame = LM81.find(f => f.id === '01-MÓT-LM81-162')
      const idEnd = LM81.find(f => f.id === '01-MÓT-LM81-163')
      pushBoQ(boq, idFrame, totalProps, 'ID-Rammar')
      pushBoQ(boq, idEnd, Math.ceil(totalProps * 0.5), 'ID-Rammar')
      const idHead = LM81.find(f => f.id === '01-MÓT-LM81-530')
      const idLap = LM81.find(f => f.id === '01-MÓT-LM81-552')
      pushBoQ(boq, idHead, totalProps, 'ID-Hlutir')
      pushBoQ(boq, idLap, totalProps, 'ID-Hlutir')
      const idBrace = LM81.find(f => f.id === '01-MÓT-LM81-574')
      pushBoQ(boq, idBrace, propsL * 2, 'ID-Hlutir')
    } else {
      boq.push({ id: selectedProp.id, desc: selectedProp.desc, qty: totalProps, dayRate: selectedProp.dayRate, weekRate: selectedProp.weekRate, cat: 'Loftastoðir' })
    }
  }

  const dropHead = LM22.find(a => a.id === '01-MÓT-LM22-400')
  pushBoQ(boq, dropHead, totalProps, 'Hausar')

  const selBeam1 = selectBeam(spacingL)
  if (selBeam1) {
    const beamsPerLine = Math.ceil(slabL / selBeam1.length)
    boq.push({ id: selBeam1.id, desc: selBeam1.desc, qty: propsW * beamsPerLine, dayRate: selBeam1.dayRate, weekRate: selBeam1.weekRate, cat: 'HT-20 Bitar' })
  }
  const selBeam2 = selectBeam(spacingW)
  if (selBeam2) {
    const beamsPerLine2 = Math.ceil(slabW / selBeam2.length)
    const existing = boq.find(b => b.id === selBeam2.id)
    if (existing) {
      existing.qty += propsL * beamsPerLine2
    } else {
      boq.push({ id: selBeam2.id, desc: selBeam2.desc, qty: propsL * beamsPerLine2, dayRate: selBeam2.dayRate, weekRate: selBeam2.weekRate, cat: 'HT-20 Bitar' })
    }
  }

  const perimeter = 2 * (slabL + slabW)
  pushBoQ(boq, LM22.find(a => a.id === '01-MÓT-LM22-850'), Math.ceil(perimeter / 150), 'PVC')

  pushBoQ(boq, LM22.find(a => a.id === '01-MÓT-LM22-323'), Math.max(propsL, propsW) * 2, 'Dregarar')

  const totalPanels = Array.from(panelCounts.values()).reduce((s, n) => s + n, 0)
  const screws = totalPanels * 4
  pushBoQ(boq, LM22.find(a => a.id === '01-MÓT-LM22-990'), screws, 'Festingar')
  pushBoQ(boq, LM22.find(a => a.id === '01-MÓT-LM22-992'), screws, 'Festingar')

  return { boq, modeLabel: 'ALUFORT Loft' }
}

// ---- Rental cost for a BoQ ----
export function calcFormworkTotal(boq: BoQItem[], days: number, discount: number = 0): number {
  let total = 0
  for (const item of boq) {
    const cost = days < 7
      ? item.dayRate * days * item.qty
      : item.weekRate * Math.ceil(days / 7) * item.qty
    total += cost
  }
  return total * (1 - discount / 100)
}

export function calcFormworkItemCost(item: BoQItem, days: number): number {
  return days < 7
    ? item.dayRate * days * item.qty
    : item.weekRate * Math.ceil(days / 7) * item.qty
}
