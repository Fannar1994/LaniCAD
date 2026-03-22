/**
 * Intent & entity parser for LániCAD AI chat.
 * Extracts user intent and entities from natural language messages.
 */

import type { ParsedIntent, Intent } from './types'

interface Pattern {
  intent: Intent
  keywords: string[]
  equipment?: string[]
  weight: number
}

const PATTERNS: Pattern[] = [
  // ── Drawing / CAD commands ──
  { intent: 'draw', keywords: ['teikna', 'draw', 'búa til', 'bættu við', 'settu', 'place', 'add', 'create', 'gera', 'smíða'], weight: 3 },
  { intent: 'place_equipment', keywords: ['setja búnað', 'setja girðing', 'setja pall', 'setja mót', 'bæta búnað', 'place equipment'], weight: 4 },

  // ── Greeting ──
  { intent: 'greet', keywords: ['hæ', 'halló', 'hei', 'hey', 'góðan dag', 'sæl', 'bless', 'hello', 'hi'], weight: 1 },

  // ── Help ──
  { intent: 'help', keywords: ['hjálp', 'help', 'hvað getur', 'hvað get', 'hvaða', 'what can', 'leiðbeiningar', 'guide'], weight: 2 },

  // ── Product info ──
  { intent: 'ask_product', keywords: ['upplýsingar', 'info', 'tegund', 'stærð', 'fjöldi', 'hvað er', 'hvernig virk', 'component', 'íhlut'], weight: 2 },

  // ── Pricing ──
  { intent: 'ask_price', keywords: ['verð', 'hvað kostar', 'leiga', 'leiguverð', 'kostnaður', 'reikna verð', 'price', 'cost', 'rent', 'sala', 'söluverð'], weight: 2 },

  // ── Calculation ──
  { intent: 'calculate', keywords: ['reikna', 'calculate', 'hversu mikið', 'hversu marga', 'hversu margar', 'magn', 'fjöldi', 'efnisáætlun', 'flatarmál', 'area', 'rúmmál', 'volume'], weight: 3 },

  // ── Recommendations ──
  { intent: 'recommend', keywords: ['mæla með', 'recommend', 'hvaða kerfi', 'hvað ætti', 'hvert er best', 'ráðlegging', 'tillaga', 'suggest'], weight: 2 },

  // ── Safety ──
  { intent: 'safety', keywords: ['öryggi', 'safety', 'hætta', 'danger', 'reglur', 'rules', 'varúð', 'caution', 'vindur', 'wind', 'álag', 'load'], weight: 3 },

  // ── Standards ──
  { intent: 'standard', keywords: ['staðall', 'standard', 'EN ', 'DIN ', 'ÍST', 'reglugerð', 'regulation', 'kröfur', 'requirement'], weight: 3 },

  // ── Assembly instructions ──
  { intent: 'assembly', keywords: ['uppsetning', 'assembly', 'setja upp', 'hvernig set', 'niðurrif', 'teardown', 'leiðbeiningar', 'skref', 'step'], weight: 3 },

  // ── Navigation ──
  { intent: 'navigate', keywords: ['fara í', 'opna', 'sýna', 'navigate', 'go to', 'open', 'reiknivél', 'calculator', 'teikning', 'drawing'], weight: 2 },

  // ── CAD tool ──
  { intent: 'cad_tool', keywords: ['línu', 'rétthyrning', 'hring', 'boga', 'texta', 'mál', 'line', 'rect', 'circle', 'polygon', 'tool', 'zoom', 'grid', 'snap'], weight: 2 },
]

const EQUIPMENT_KEYWORDS: Record<string, string[]> = {
  fence: ['girðing', 'gird', 'fence', 'hliðar', 'hlið', 'steinar', 'klemmur', 'iðnaðar'],
  scaffold: ['vinnupall', 'scaffold', 'layher', 'mercury', 'speedy', 'ramm', 'gólfborð', 'stigapall'],
  rolling: ['hjólapall', 'rolling', 'mobile scaffold', 'quickly', 'mjór pall', 'breiður pall'],
  formwork: ['steypumót', 'formwork', 'rasto', 'takko', 'manto', 'alufort', 'id-15', 'robusto', 'mótaflek', 'mót'],
  ceiling: ['loftastoð', 'ceiling', 'villalta', 'mótabit', 'ht-20', 'ht20', 'þrífótur', 'stoðir'],
}

export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase().trim()
  const entities: Record<string, string | number | boolean> = {}

  // ── Detect equipment ──
  let equipment: ParsedIntent['equipment'] = undefined
  let maxEqScore = 0
  for (const [eq, kws] of Object.entries(EQUIPMENT_KEYWORDS)) {
    const score = kws.filter(kw => lower.includes(kw)).length
    if (score > maxEqScore) {
      maxEqScore = score
      equipment = eq as ParsedIntent['equipment']
    }
  }

  // ── Extract numeric entities ──
  const dimMatch = lower.match(/(\d+[,.]?\d*)\s*(m\b|meter|metr)/i)
  if (dimMatch) entities.dimension = parseFloat(dimMatch[1].replace(',', '.'))

  const countMatch = lower.match(/(\d+)\s*(stk|stykki|panela|panel|stoð|pall|mót|bita)/i)
  if (countMatch) entities.count = parseInt(countMatch[1])

  const heightMatch = lower.match(/(\d+[,.]?\d*)\s*(m\b)\s*(hæð|hátt|height)/i)
  if (heightMatch) entities.height = parseFloat(heightMatch[1].replace(',', '.'))

  const lengthMatch = lower.match(/(\d+[,.]?\d*)\s*(m\b)\s*(lengd|langt|lang|length|breitt|breidd)/i)
  if (lengthMatch) entities.length = parseFloat(lengthMatch[1].replace(',', '.'))

  const daysMatch = lower.match(/(\d+)\s*(dag|day|viku|week|mánuð|month)/i)
  if (daysMatch) {
    let days = parseInt(daysMatch[1])
    if (lower.includes('viku') || lower.includes('week')) days *= 7
    if (lower.includes('mánuð') || lower.includes('month')) days *= 30
    entities.days = days
  }

  // ── Score intents ──
  let bestIntent: Intent = 'unknown'
  let bestScore = 0

  for (const pattern of PATTERNS) {
    let score = 0
    for (const kw of pattern.keywords) {
      if (lower.includes(kw)) score += pattern.weight
    }
    // Boost if equipment matches drawing intent
    if (equipment && (pattern.intent === 'draw' || pattern.intent === 'place_equipment')) {
      score += 1
    }
    if (score > bestScore) {
      bestScore = score
      bestIntent = pattern.intent
    }
  }

  // If we detected dimensions/counts with equipment but no clear intent, assume calculation
  if (bestIntent === 'unknown' && equipment && Object.keys(entities).length > 0) {
    bestIntent = 'calculate'
  }

  // If only equipment detected, default to ask_product
  if (bestIntent === 'unknown' && equipment) {
    bestIntent = 'ask_product'
  }

  return {
    intent: bestIntent,
    entities,
    equipment,
    confidence: Math.min(bestScore / 6, 1),
  }
}

/** Extract a formwork system name from text */
export function extractFormworkSystem(text: string): string | null {
  const lower = text.toLowerCase()
  if (lower.includes('rasto')) return 'Rasto'
  if (lower.includes('takko')) return 'Takko'
  if (lower.includes('manto')) return 'Manto'
  if (lower.includes('alufort')) return 'Alufort'
  if (lower.includes('id-15') || lower.includes('id15')) return 'ID-15'
  if (lower.includes('robusto')) return 'Robusto'
  return null
}

/** Extract dimensions from text like "6m x 3m" or "6m lengd 3m hæð" */
export function extractDimensions(text: string): { length?: number; height?: number; width?: number; count?: number } {
  const lower = text.toLowerCase()
  const result: { length?: number; height?: number; width?: number; count?: number } = {}

  // Pattern: NxM or N×M
  const crossMatch = lower.match(/(\d+[,.]?\d*)\s*[x×]\s*(\d+[,.]?\d*)/)
  if (crossMatch) {
    result.length = parseFloat(crossMatch[1].replace(',', '.'))
    result.height = parseFloat(crossMatch[2].replace(',', '.'))
  }

  // Pattern: Nm lengd/langt
  const lenMatch = lower.match(/(\d+[,.]?\d*)\s*m?\s*(lengd|langt|lang|breidd|breitt|breið)/i)
  if (lenMatch) result.length = parseFloat(lenMatch[1].replace(',', '.'))

  // Pattern: Nm hæð/hátt
  const hMatch = lower.match(/(\d+[,.]?\d*)\s*m?\s*(hæð|hátt|há)/i)
  if (hMatch) result.height = parseFloat(hMatch[1].replace(',', '.'))

  // Pattern: N panela/stykki/etc
  const cMatch = lower.match(/(\d+)\s*(panela|panel|stykki|stk|stoð|pall)/i)
  if (cMatch) result.count = parseInt(cMatch[1])

  return result
}
