import makerjs from 'makerjs'

/* ── Layer names ── */
const L = {
  STANDARD: 'standard',    // vertical uprights (heaviest)
  LEDGER:   'ledger',       // horizontal ledgers
  DECK:     'deck',         // platform deck outlines
  DECKFILL: 'deckfill',     // deck hatching
  BRACE:    'brace',        // diagonal braces
  SAFETY:   'safety',       // guardrails & toeboards (red)
  NODE:     'node',         // rosette connection dots
  GROUND:   'ground',       // ground line
  HATCH:    'ghatch',       // ground hatching
  LEGZONE:  'legzone',      // adjustable leg zone marker
  BASE:     'base',         // base plates
  DIM:      'dim',          // dimension lines
  DIMEXT:   'dimext',       // dimension extension lines
  DIMTXT:   'dimtxt',       // dimension text
  TITLE:    'title',        // title text
  SUBTITLE: 'subtitle',     // subtitle text
  LABEL:    'label',        // component labels
  FRAME:    'frame',        // border frame
} as const

/* ── Helpers ── */
function lp(key: string, layer: string, p: makerjs.IPath, target: Record<string, makerjs.IPath>) {
  (p as any).layer = layer
  target[key] = p
}

function lm(key: string, layer: string, m: makerjs.IModel, target: Record<string, makerjs.IModel>) {
  m.layer = layer
  target[key] = m
}

/**
 * Professional 2D elevation drawing of Layher Allround facade scaffolding.
 * Uses Maker.js layers for visual hierarchy with engineering-grade detailing.
 */
export function createScaffoldDrawing(params: {
  length: number
  levels2m: number
  levels07m: number
  legType: '50cm' | '100cm'
  endcaps: number
}): string {
  const { length, levels2m, levels07m, legType } = params
  const S = 60                       // scale: 1 m = 60 drawing-units
  const BAY = 1.8                    // standard Layher bay (m)
  const bays = Math.max(1, Math.ceil(length / BAY))
  const legH = legType === '50cm' ? 0.34 : 0.69
  const workH = levels2m * 2 + levels07m * 0.7 + legH
  const totalH = workH + 2.0         // +2 m guardrail zone
  const W = bays * BAY * S
  const H = totalH * S

  // Margins for annotations
  const ML = 90     // left  (level labels)
  const MB = 65     // bottom (width dim + scale bar)

  const paths: Record<string, makerjs.IPath> = {}
  const models: Record<string, makerjs.IModel> = {}
  const model: makerjs.IModel = { paths, models }

  /* ═══════════════════════════════════════════
     GROUND & HATCHING
     ═══════════════════════════════════════════ */
  lp('ground', L.GROUND, new makerjs.paths.Line(
    [ML - 15, MB], [ML + W + 15, MB]), paths)

  // Diagonal ground-hatch below ground line
  for (let i = 0; i * 8 <= W + 30; i++) {
    const x = ML - 15 + i * 8
    lp(`gh${i}`, L.HATCH, new makerjs.paths.Line(
      [x, MB], [x - 10, MB - 10]), paths)
  }

  /* ═══════════════════════════════════════════
     BASE PLATES
     ═══════════════════════════════════════════ */
  for (let b = 0; b <= bays; b++) {
    const cx = ML + b * BAY * S
    const pw = 10, ph = 5
    lm(`bp${b}`, L.BASE, { paths: {
      l: new makerjs.paths.Line([cx - pw, MB], [cx - pw, MB + ph]),
      t: new makerjs.paths.Line([cx - pw, MB + ph], [cx + pw, MB + ph]),
      r: new makerjs.paths.Line([cx + pw, MB], [cx + pw, MB + ph]),
      b: new makerjs.paths.Line([cx - pw, MB], [cx + pw, MB]),
      x1: new makerjs.paths.Line([cx - pw, MB], [cx + pw, MB + ph]),
      x2: new makerjs.paths.Line([cx + pw, MB], [cx - pw, MB + ph]),
    }}, models)
  }

  /* ═══════════════════════════════════════════
     STANDARDS (VERTICAL UPRIGHTS)
     ═══════════════════════════════════════════ */
  for (let b = 0; b <= bays; b++) {
    const x = ML + b * BAY * S
    lp(`std${b}`, L.STANDARD, new makerjs.paths.Line(
      [x, MB], [x, MB + H]), paths)
  }

  /* ═══════════════════════════════════════════
     ADJUSTABLE LEG ZONE (dashed line)
     ═══════════════════════════════════════════ */
  const legTopY = MB + legH * S
  lp('legLine', L.LEGZONE, new makerjs.paths.Line(
    [ML, legTopY], [ML + W, legTopY]), paths)

  // Label the leg
  const legMidY = MB + legH * S * 0.5
  lm('legLbl', L.LABEL, makerjs.model.addCaption({},
    `Fótur ${legType}`,
    [ML + 5, legMidY],
    [ML + BAY * S - 5, legMidY]), models)

  /* ═══════════════════════════════════════════
     LEDGERS, DECKS & LEVEL TRACKING
     ═══════════════════════════════════════════ */
  let curY = legTopY
  const levelYs: { y: number; cumH: number }[] = []

  const drawLevel = (h: number, idx: number, prefix: string) => {
    curY += h * S
    const actualCumH = (curY - MB) / S
    levelYs.push({ y: curY, cumH: actualCumH })

    for (let b = 0; b < bays; b++) {
      const x1 = ML + b * BAY * S
      const x2 = ML + (b + 1) * BAY * S

      // Horizontal ledger
      lp(`lg${prefix}${idx}_${b}`, L.LEDGER, new makerjs.paths.Line(
        [x1, curY], [x2, curY]), paths)

      // Platform deck — top and bottom edges + hatching
      const dt = 5  // deck thickness in units
      lp(`dkT${prefix}${idx}_${b}`, L.DECK, new makerjs.paths.Line(
        [x1 + 3, curY + dt], [x2 - 3, curY + dt]), paths)
      lp(`dkB${prefix}${idx}_${b}`, L.DECK, new makerjs.paths.Line(
        [x1 + 3, curY + 1], [x2 - 3, curY + 1]), paths)
      // Deck end-caps
      lp(`dkL${prefix}${idx}_${b}`, L.DECK, new makerjs.paths.Line(
        [x1 + 3, curY + 1], [x1 + 3, curY + dt]), paths)
      lp(`dkR${prefix}${idx}_${b}`, L.DECK, new makerjs.paths.Line(
        [x2 - 3, curY + 1], [x2 - 3, curY + dt]), paths)
      // Diagonal hatch inside deck (indicating wood planks)
      const span = (x2 - 3) - (x1 + 3)
      const nHatch = Math.floor(span / 12)
      for (let i = 0; i <= nHatch; i++) {
        const hx = x1 + 3 + i * 12
        if (hx + 6 <= x2 - 3) {
          lp(`dkH${prefix}${idx}_${b}_${i}`, L.DECKFILL, new makerjs.paths.Line(
            [hx, curY + 1.5], [hx + 6, curY + dt - 0.5]), paths)
        }
      }
    }
  }

  for (let l = 0; l < levels2m; l++) drawLevel(2, l, '2m')
  for (let l = 0; l < levels07m; l++) drawLevel(0.7, l, '07')

  /* ═══════════════════════════════════════════
     GUARDRAILS & TOEBOARDS (safety – red)
     ═══════════════════════════════════════════ */
  const topRailY = MB + H
  const midRailY = topRailY - 0.5 * S
  const toeboardY = curY + 6

  for (let b = 0; b < bays; b++) {
    const x1 = ML + b * BAY * S
    const x2 = ML + (b + 1) * BAY * S
    lp(`tr${b}`, L.SAFETY, new makerjs.paths.Line([x1, topRailY], [x2, topRailY]), paths)
    lp(`mr${b}`, L.SAFETY, new makerjs.paths.Line([x1, midRailY], [x2, midRailY]), paths)
    lp(`tb${b}`, L.SAFETY, new makerjs.paths.Line([x1 + 3, toeboardY], [x2 - 3, toeboardY]), paths)
  }

  // Safety labels
  lm('lblTR', L.LABEL, makerjs.model.addCaption({},
    'Handriði',
    [ML + W + 5, topRailY],
    [ML + W + 45, topRailY]), models)
  lm('lblMR', L.LABEL, makerjs.model.addCaption({},
    'Millistyng',
    [ML + W + 5, midRailY],
    [ML + W + 45, midRailY]), models)

  /* ═══════════════════════════════════════════
     DIAGONAL BRACES (X-pattern, alternating bays)
     ═══════════════════════════════════════════ */
  const braceLevels = Math.min(levels2m + levels07m, 4)
  let braceY = MB + legH * S
  for (let l = 0; l < braceLevels; l++) {
    const h = l < levels2m ? 2 : 0.7
    const yBot = braceY
    const yTop = braceY + h * S
    for (let b = l % 2; b < bays; b += 2) {
      const x1 = ML + b * BAY * S
      const x2 = ML + (b + 1) * BAY * S
      lp(`brf${l}_${b}`, L.BRACE, new makerjs.paths.Line([x1, yBot], [x2, yTop]), paths)
      lp(`brr${l}_${b}`, L.BRACE, new makerjs.paths.Line([x1, yTop], [x2, yBot]), paths)
    }
    braceY += h * S
  }

  /* ═══════════════════════════════════════════
     ROSETTE NODES (small circles at connections)
     ═══════════════════════════════════════════ */
  for (let b = 0; b <= bays; b++) {
    const x = ML + b * BAY * S
    for (const lv of levelYs) {
      lp(`nd${b}_${lv.y}`, L.NODE, new makerjs.paths.Circle([x, lv.y], 2.5), paths)
    }
  }

  /* ═══════════════════════════════════════════
     LEFT DIMENSION: INDIVIDUAL LEVEL HEIGHTS
     ═══════════════════════════════════════════ */
  const ldx = ML - 20
  let prevY = MB

  // Leg zone
  lp('ldLeg', L.DIM, new makerjs.paths.Line([ldx, MB], [ldx, legTopY]), paths)
  lp('ldLegT', L.DIM, new makerjs.paths.Line([ldx - 4, legTopY], [ldx + 4, legTopY]), paths)
  lp('ldLegB', L.DIM, new makerjs.paths.Line([ldx - 4, MB], [ldx + 4, MB]), paths)
  const legDimY = (MB + legTopY) / 2
  lm('ldLegTxt', L.DIMTXT, makerjs.model.addCaption({},
    `${legH.toFixed(2)}m`,
    [ldx - 38, legDimY],
    [ldx - 5, legDimY]), models)
  prevY = legTopY

  for (let i = 0; i < levelYs.length; i++) {
    const lv = levelYs[i]
    lp(`ld${i}`, L.DIM, new makerjs.paths.Line([ldx, prevY], [ldx, lv.y]), paths)
    lp(`ldt${i}`, L.DIM, new makerjs.paths.Line([ldx - 4, lv.y], [ldx + 4, lv.y]), paths)
    const segH = (lv.y - prevY) / S
    const segMidY = (prevY + lv.y) / 2
    lm(`ldTx${i}`, L.DIMTXT, makerjs.model.addCaption({},
      `${segH.toFixed(1)}m`,
      [ldx - 38, segMidY],
      [ldx - 5, segMidY]), models)
    prevY = lv.y
  }

  // Guardrail zone
  lp('ldG', L.DIM, new makerjs.paths.Line([ldx, prevY], [ldx, topRailY]), paths)
  lp('ldGT', L.DIM, new makerjs.paths.Line([ldx - 4, topRailY], [ldx + 4, topRailY]), paths)
  const guardH = (topRailY - prevY) / S
  const guardMidY = (prevY + topRailY) / 2
  lm('ldGTx', L.DIMTXT, makerjs.model.addCaption({},
    `${guardH.toFixed(1)}m`,
    [ldx - 38, guardMidY],
    [ldx - 5, guardMidY]), models)

  // Extension lines from structure to left dims
  lp('leBot', L.DIMEXT, new makerjs.paths.Line([ML - 3, MB], [ldx + 6, MB]), paths)
  lp('leTop', L.DIMEXT, new makerjs.paths.Line([ML - 3, topRailY], [ldx + 6, topRailY]), paths)

  /* ═══════════════════════════════════════════
     RIGHT DIMENSION: TOTAL HEIGHT
     ═══════════════════════════════════════════ */
  const rdx = ML + W + 45
  lp('rdLine', L.DIM, new makerjs.paths.Line([rdx, MB], [rdx, topRailY]), paths)
  lp('rdT', L.DIM, new makerjs.paths.Line([rdx - 5, topRailY], [rdx + 5, topRailY]), paths)
  lp('rdB', L.DIM, new makerjs.paths.Line([rdx - 5, MB], [rdx + 5, MB]), paths)
  // extension lines
  lp('reT', L.DIMEXT, new makerjs.paths.Line([ML + W + 3, topRailY], [rdx + 8, topRailY]), paths)
  lp('reB', L.DIMEXT, new makerjs.paths.Line([ML + W + 3, MB], [rdx + 8, MB]), paths)
  const rdMidY = (MB + topRailY) / 2
  lm('rdTx', L.DIMTXT, makerjs.model.addCaption({},
    `${totalH.toFixed(2)} m`,
    [rdx + 8, rdMidY - 20],
    [rdx + 8, rdMidY + 20]), models)

  /* ═══════════════════════════════════════════
     BOTTOM DIMENSION: TOTAL WIDTH
     ═══════════════════════════════════════════ */
  const bdy = MB - 35
  lp('bdLine', L.DIM, new makerjs.paths.Line([ML, bdy], [ML + W, bdy]), paths)
  lp('bdL', L.DIM, new makerjs.paths.Line([ML, bdy - 5], [ML, bdy + 5]), paths)
  lp('bdR', L.DIM, new makerjs.paths.Line([ML + W, bdy - 5], [ML + W, bdy + 5]), paths)
  lp('beL', L.DIMEXT, new makerjs.paths.Line([ML, MB - 12], [ML, bdy - 8]), paths)
  lp('beR', L.DIMEXT, new makerjs.paths.Line([ML + W, MB - 12], [ML + W, bdy - 8]), paths)
  lm('bdTx', L.DIMTXT, makerjs.model.addCaption({},
    `${(bays * BAY).toFixed(1)} m  (${bays} fag × ${BAY} m)`,
    [ML + 20, bdy - 13],
    [ML + W - 20, bdy - 13]), models)

  // Single-bay dimension (first bay)
  if (bays >= 2) {
    const sdy = MB - 18
    lp('sdLine', L.DIM, new makerjs.paths.Line([ML, sdy], [ML + BAY * S, sdy]), paths)
    lp('sdL', L.DIM, new makerjs.paths.Line([ML, sdy - 3], [ML, sdy + 3]), paths)
    lp('sdR', L.DIM, new makerjs.paths.Line([ML + BAY * S, sdy - 3], [ML + BAY * S, sdy + 3]), paths)
    lm('sdTx', L.DIMTXT, makerjs.model.addCaption({},
      `${BAY} m`,
      [ML + 15, sdy - 9],
      [ML + BAY * S - 15, sdy - 9]), models)
  }

  /* ═══════════════════════════════════════════
     SCALE BAR (1 m)
     ═══════════════════════════════════════════ */
  const sby = MB - 55
  const sbl = 1 * S
  lp('sbLine', L.DIM, new makerjs.paths.Line([ML, sby], [ML + sbl, sby]), paths)
  lp('sbL', L.DIM, new makerjs.paths.Line([ML, sby - 4], [ML, sby + 4]), paths)
  lp('sbR', L.DIM, new makerjs.paths.Line([ML + sbl, sby - 4], [ML + sbl, sby + 4]), paths)
  // half mark
  lp('sbM', L.DIM, new makerjs.paths.Line([ML + sbl / 2, sby - 2], [ML + sbl / 2, sby + 2]), paths)
  lm('sbTx', L.DIMTXT, makerjs.model.addCaption({},
    '1.0 m',
    [ML + 10, sby - 10],
    [ML + sbl - 10, sby - 10]), models)
  lm('sbLbl', L.LABEL, makerjs.model.addCaption({},
    'Mælikvarði',
    [ML + sbl + 5, sby],
    [ML + sbl + 50, sby]), models)

  /* ═══════════════════════════════════════════
     TITLE BLOCK
     ═══════════════════════════════════════════ */
  lm('titleMain', L.TITLE, makerjs.model.addCaption({},
    'VINNUPALLUR — Layher Allround',
    [ML, MB + H + 30],
    [ML + W, MB + H + 30]), models)

  lm('titleSub', L.SUBTITLE, makerjs.model.addCaption({},
    `${(bays * BAY).toFixed(1)} m × ${totalH.toFixed(2)} m  |  ${levels2m}×2.0 m + ${levels07m}×0.7 m  |  Fótar: ${legType}  |  Fög: ${bays}`,
    [ML, MB + H + 15],
    [ML + W, MB + H + 15]), models)

  // LániCAD branding (small, bottom-right)
  lm('brand', L.LABEL, makerjs.model.addCaption({},
    'LániCAD  ·  BYKO Leiga',
    [ML + W - 80, sby],
    [ML + W, sby]), models)

  /* ═══════════════════════════════════════════
     COMPONENT LABELS (callouts)
     ═══════════════════════════════════════════ */
  // Standard label
  if (bays >= 2) {
    const labelX = ML + BAY * S / 2
    const labelY = MB + H * 0.3
    lm('lblStd', L.LABEL, makerjs.model.addCaption({},
      'Staðall Ø48 mm',
      [labelX - 25, labelY],
      [labelX + 30, labelY]), models)
  }

  // Deck label
  if (levels2m > 0) {
    const dy = MB + legH * S + 2 * S
    const deckLblY = dy + 10
    lm('lblDeck', L.LABEL, makerjs.model.addCaption({},
      'Pallborð (1.8 m)',
      [ML + BAY * S + 8, deckLblY],
      [ML + 2 * BAY * S - 8, deckLblY]), models)
  }

  /* ═══════════════════════════════════════════
     BORDER FRAME
     ═══════════════════════════════════════════ */
  const fPad = 8   // padding around content
  const fL = ML - 55 - fPad
  const fR = rdx + 30 + fPad
  const fB = sby - 15 - fPad
  const fT = MB + H + 42 + fPad
  lm('frame', L.FRAME, { paths: {
    bl: new makerjs.paths.Line([fL, fB], [fR, fB]),
    br: new makerjs.paths.Line([fR, fB], [fR, fT]),
    tr: new makerjs.paths.Line([fR, fT], [fL, fT]),
    tl: new makerjs.paths.Line([fL, fT], [fL, fB]),
  }}, models)

  /* ═══════════════════════════════════════════
     EXPORT SVG WITH LAYER STYLING
     ═══════════════════════════════════════════ */
  return makerjs.exporter.toSVG(model, {
    stroke: '#404042',
    strokeWidth: '0.8',
    fill: 'none',
    fontSize: '11px',
    units: makerjs.unitType.Millimeter,
    svgAttrs: { style: 'background:#fff' },
    viewBox: true,
    layerOptions: {
      [L.STANDARD]: { stroke: '#1a1a1a', strokeWidth: '2.5' },
      [L.LEDGER]:   { stroke: '#333',    strokeWidth: '1.6' },
      [L.DECK]:     { stroke: '#b8860b', strokeWidth: '1.4' },
      [L.DECKFILL]: { stroke: '#daa520', strokeWidth: '0.5', cssStyle: 'opacity:0.5' },
      [L.BRACE]:    { stroke: '#888',    strokeWidth: '0.9', cssStyle: 'stroke-dasharray:8 3' },
      [L.SAFETY]:   { stroke: '#cc0000', strokeWidth: '2.0' },
      [L.NODE]:     { stroke: '#333',    strokeWidth: '1.0', fill: '#404042' },
      [L.GROUND]:   { stroke: '#222',    strokeWidth: '2.8' },
      [L.HATCH]:    { stroke: '#aaa',    strokeWidth: '0.6' },
      [L.LEGZONE]:  { stroke: '#777',    strokeWidth: '0.7', cssStyle: 'stroke-dasharray:5 3' },
      [L.BASE]:     { stroke: '#333',    strokeWidth: '1.2' },
      [L.DIM]:      { stroke: '#2563eb', strokeWidth: '0.55' },
      [L.DIMEXT]:   { stroke: '#94a3b8', strokeWidth: '0.35', cssStyle: 'stroke-dasharray:3 2' },
      [L.DIMTXT]:   { stroke: '#2563eb', fill: '#2563eb' },
      [L.TITLE]:    { stroke: '#111',    fill: '#111' },
      [L.SUBTITLE]: { stroke: '#555',    fill: '#555' },
      [L.LABEL]:    { stroke: '#666',    fill: '#666' },
      [L.FRAME]:    { stroke: '#222',    strokeWidth: '1.2' },
    },
  })
}
