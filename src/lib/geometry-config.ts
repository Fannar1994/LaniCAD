/**
 * Centralized geometry configuration for all equipment types.
 * Shared between 2D drawings, 3D models, and interactive canvas.
 *
 * ALL geometry constants (dimensions, colors, spacing) live here —
 * individual model/drawing files import from this single source of truth.
 */

// ── Brand / Design Tokens ──
export const BRAND = {
  dark: '#404042',
  accent: '#f5c800',
  white: '#ffffff',
} as const

// ── Shared Metal Colors ──
export const COLORS = {
  steel: '#888',
  steelLight: '#aaa',
  steelDark: '#666',
  steelVeryDark: '#444',
  chrome: '#777',
  basePlate: '#555',
  concrete: '#999',
  rubber: '#222',
  red: '#cc0000',
  wire: '#aaa',
  tie: '#333',
} as const

// ── Grid / Snap ──
export const GRID = {
  snapIncrement: 0.1,       // 10 cm snap for interactive placement
  translationSnap: 0.5,     // 3D transform controls snap (m)
  rotationSnap: Math.PI / 12, // 15° rotation snap
  cellSize: 0.5,            // grid visual cell size (m)
  sectionSize: 5,           // grid visual section size (m)
} as const

// ── Ceiling Props (Loftastoðir) ──
export const CEILING = {
  propOuterRadius: 0.030,   // ~60mm outer tube
  propInnerRadius: 0.024,   // ~48mm inner tube
  beamWebWidth: 0.08,       // HT-20 beam web width
  beamHeight: 0.20,         // HT-20 beam height
  flangeWidth: 0.12,        // flange width for I-shape
  flangeThickness: 0.008,   // flange thickness
  basePlateSize: 0.15,      // square base plate side
  headPlateWidth: 0.12,     // U-fork width at top
  splitRatio: 0.45,         // where outer meets inner tube
  drawingScale: 50,         // 2D drawing: 1m = 50 units
  colors: {
    outerTube: COLORS.steel,
    innerTube: COLORS.steelLight,
    collar: COLORS.steelDark,
    basePlate: COLORS.basePlate,
  },
} as const

// ── Fence (Girðingar) ──
export const FENCE = {
  frameRadius: 0.021,       // 42mm OD frame tube
  wireRadius: 0.002,        // 4mm wire diameter
  wireMeshHSpacing: 0.05,   // 50mm horizontal wire spacing
  wireMeshVSpacing: 0.20,   // 200mm vertical wire spacing
  frameInsetX: 0.03,        // inset from frame edge
  frameInsetY: 0.05,        // inset from top/bottom frames
  stoneWidth: 0.35,
  stoneHeight: 0.15,
  stoneDepth: 0.22,
  drawingScale: 100,        // 2D drawing: 1m = 100 units
  drawingStoneSize: 20,     // stone symbol size in drawing units
  colors: {
    frame: COLORS.steel,
    wire: COLORS.wire,
  },
} as const

// ── Scaffolding (Vinnupallar) ──
export const SCAFFOLD = {
  tubeRadius: 0.024,        // 48.3mm OD Layher standard tube
  thinRadius: 0.016,        // thinner braces / rails
  bayLength: 1.8,           // bay length (m)
  bayWidth: 0.73,           // standard bay depth (m)
  boardThickness: 0.04,     // deck board thickness
  rosetteRadius: 0.06,      // rosette disc radius
  rosetteThickness: 0.012,  // rosette disc thickness
  drawingScale: 30,         // 2D drawing scale
  colors: {
    tube: COLORS.chrome,
    board: BRAND.accent,
    base: COLORS.basePlate,
    rail: COLORS.red,
    brace: COLORS.steelLight,
    rosette: COLORS.basePlate,
  },
} as const

// ── Rolling Scaffold (Hjólapallar) ──
export const ROLLING = {
  tubeRadius: 0.024,        // 48.3mm OD
  braceRadius: 0.016,       // thin brace tubes
  wheelRadius: 0.075,       // castor wheel radius
  wheelWidth: 0.035,        // castor wheel width
  frameHeights: { full: 2.1, half: 1.05 },
  widths: { narrow: 0.75, wide: 1.35 },
  platformLength: 2.5,      // platform length (m)
  outriggerLength: 0.8,
  drawingScale: 30,
  colors: {
    tube: COLORS.steel,
    brake: COLORS.red,
  },
} as const

// ── Formwork (Steypumót) ──
export const FORMWORK = {
  panelThickness: 0.12,
  wallThickness: 0.20,      // concrete wall gap between panel faces
  propRadius: 0.015,        // push-pull prop tube
  panelWidths: {
    manto: [240, 120, 90, 60, 50, 30],
    default: [240, 120, 90, 60, 45, 30],
  },
  drawingScale: 20,
  colors: {
    prop: COLORS.steelDark,
    tie: COLORS.tie,
    panelManto: '#c4a882',
    panelRasto: '#d4a76a',
    panelTakko: '#b89070',
    panelAlufort: '#bbb',
    steelFrame: COLORS.steelVeryDark,
  },
} as const

// ── Interactive Canvas (shared) ──
export const CANVAS = {
  gridColor: '#e0e0e0',
  gridMajorColor: '#bbb',
  selectionColor: BRAND.accent,
  hoverColor: '#ffe066',
  deleteColor: '#ff4444',
  handleSize: 8,
  minZoom: 0.1,
  maxZoom: 5,
  defaultZoom: 1,
} as const

// ── Equipment kind configurations (for interactive mode) ──
export type EquipmentKind = 'fence' | 'scaffold' | 'rolling' | 'formwork' | 'ceiling'

export const EQUIPMENT_LABELS: Record<EquipmentKind, string> = {
  fence: 'Girðing',
  scaffold: 'Vinnupallur',
  rolling: 'Hjólapallur',
  formwork: 'Steypumót',
  ceiling: 'Loftastoðir',
}

export const EQUIPMENT_COLORS: Record<EquipmentKind, string> = {
  fence: COLORS.steel,
  scaffold: BRAND.accent,
  rolling: COLORS.steel,
  formwork: FORMWORK.colors.panelManto,
  ceiling: COLORS.steelDark,
}
