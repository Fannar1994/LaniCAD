/**
 * LániCAD Construction AI Engine
 *
 * A comprehensive client-side AI assistant for construction equipment CAD.
 * All processing happens in the browser — no paid APIs, no server required.
 *
 * Capabilities:
 * - Construction engineering knowledge (formwork, scaffolding, shoring, fences)
 * - CAD drawing commands (place equipment, draw shapes)
 * - Material estimation and cost calculations
 * - Safety standards and assembly instructions
 * - Product catalog queries with pricing
 */

import { FENCE_PRODUCTS, FENCE_TYPES, MIN_RENTAL_DAYS } from '@/data/fence'
import { SCAFFOLD_ITEMS, SCAFFOLD_SYSTEMS, getScaffoldItems, hasScaffoldPricing } from '@/data/scaffolding'
import {
  NARROW_PRICING, WIDE_PRICING, QUICKLY_PRICING,
  ROLLING_TYPES, HEIGHT_OPTIONS,
} from '@/data/rolling-scaffold'
import { LOFTASTODIR, MOTABITAR } from '@/data/ceiling-props'
import { formatKr } from '@/lib/format'
import { parseIntent, extractDimensions, extractFormworkSystem } from './intent-parser'
import { SAFETY_KNOWLEDGE, ASSEMBLY_KNOWLEDGE, ESTIMATION_RULES, FAQ } from './construction-knowledge'
import type { ChatMessage, CadAction, ParsedIntent } from './types'

export type { ChatMessage, CadAction }

/** Main entry point: process messages and return a reply with optional CAD actions */
export function getLocalReply(messages: ChatMessage[]): { content: string; actions: CadAction[] } {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'user') return { content: 'Ég skil þig ekki. Reyndu aftur.', actions: [] }

  const text = last.content.trim()
  const lower = text.toLowerCase()
  const parsed = parseIntent(text)

  // Check FAQ first
  const faqMatch = checkFAQ(lower)
  if (faqMatch) return { content: faqMatch, actions: [] }

  // Route by intent
  switch (parsed.intent) {
    case 'greet':
      return handleGreeting()
    case 'help':
      return handleHelp()
    case 'draw':
    case 'place_equipment':
      return handleDrawCommand(lower, parsed)
    case 'ask_product':
      return handleProductQuery(lower, parsed)
    case 'ask_price':
      return handlePriceQuery(lower, parsed)
    case 'calculate':
      return handleCalculation(lower, parsed)
    case 'recommend':
      return handleRecommendation(lower, parsed)
    case 'safety':
      return handleSafety(lower, parsed)
    case 'standard':
      return handleStandards(lower, parsed)
    case 'assembly':
      return handleAssembly(lower, parsed)
    case 'navigate':
      return handleNavigation(lower)
    case 'cad_tool':
      return handleCadTool(lower)
    default:
      return handleUnknown(lower, parsed)
  }
}

/** Legacy-compatible wrapper for old API */
export function getLocalReplyLegacy(messages: { role: 'user' | 'assistant'; content: string }[]): string {
  const mapped: ChatMessage[] = messages.map(m => ({ ...m }))
  return getLocalReply(mapped).content
}

// ── Intent Handlers ──

function handleGreeting(): { content: string; actions: CadAction[] } {
  return {
    content: `Hæ! Ég er **LániCAD AI** — byggingarverkfræðiaðstoðarmaður.

Ég get hjálpað þér með:
🏗️ **Teikna búnað** — girðingar, vinnupalla, steypumót og fleira beint á teikniborðið
📐 **Efnisáætlanir** — reikna magn og kostnað
📋 **Tæknilegar upplýsingar** — öryggisreglur, staðlar, uppsetningarleiðbeiningar
💰 **Verð og tilboð** — leiguverð og söluverð á öllum búnaði

Reyndu t.d.: *"teikna girðingu 20m"* eða *"hvernig set ég upp vinnupall?"*`,
    actions: [],
  }
}

function handleHelp(): { content: string; actions: CadAction[] } {
  const actions: CadAction[] = [
    { type: 'navigate', label: '📐 Opna teikningu', params: { path: '/drawing' } },
    { type: 'navigate', label: '🧮 Girðingareiknivél', params: { path: '/calculator/fence' } },
    { type: 'navigate', label: '🏗️ Vinnupallareiknivél', params: { path: '/calculator/scaffolding' } },
    { type: 'navigate', label: '🧱 Steypumótsreiknivél', params: { path: '/calculator/formwork' } },
  ]

  return {
    content: `**LániCAD AI — Byggingarverkfræðiaðstoð**

🔧 **Teikniverkfæri:**
• *"Teikna girðingu 30m"* — teiknar girðingu á CAD borðið
• *"Settu vinnupall 15m x 6m"* — setur vinnupall á teikningu
• *"Bættu steypumóti 8m x 3m Rasto"* — bætir veggmóti

📊 **Reikningar:**
• *"Reikna efni í 20m girðingu"* — reiknar magn og kostnað
• *"Hversu marga palla þarf ég fyrir 50m² vegg?"*
• *"Hvað kostar leiga á hjólapalli 6.5m í 2 vikur?"*

📚 **Tæknileg ráðgjöf:**
• *"Öryggisreglur vinnupalla"* — EN 12811 og tengdir staðlar
• *"Hámarkshæð hjólapalls?"* — tæknilegar takmarkanir
• *"Hvernig set ég upp veggmót?"* — skref-fyrir-skref leiðbeiningar

🔨 **CAD skipanir:**
• *"Teikna rétthyrning 10x5"* — teiknar grunnform
• *"Teikna hring r=3"* — teiknar hring
• *"Teikna línu frá 0,0 til 10,5"*`,
    actions,
  }
}

function handleDrawCommand(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  const dims = extractDimensions(text)
  const actions: CadAction[] = []

  // ── Equipment placement ──
  if (parsed.equipment) {
    switch (parsed.equipment) {
      case 'fence': {
        const totalLength = dims.length || 20
        const panelWidth = text.includes('2.5') ? 2.5 : text.includes('2.1') ? 2.1 : 3.5
        const panels = Math.ceil(totalLength / panelWidth)
        const height = dims.height || 2.0
        const includeGate = text.includes('hlið') || text.includes('gate')

        actions.push({
          type: 'place_fence',
          label: `Setja girðingu (${panels} panela × ${panelWidth}m)`,
          params: { panels, panelWidth, panelHeight: height, includeGate },
        })
        actions.push({
          type: 'set_equipment',
          label: '🧮 Opna girðingareiknivél',
          params: { equipment: 'fence', navigate: '/calculator/fence' },
        })

        return {
          content: `**Girðing — ${totalLength}m:**

| Lýsing | Gildi |
|---|---|
| Heildarleingd | ${totalLength}m |
| Paneli | ${panels} stk (${panelWidth}m breiðir) |
| Hæð | ${height}m |
| Steinar | ${panels + 1} stk |
| Klemmur | ${Math.max(0, panels - 1)} stk |
${includeGate ? '| Hlið | 1 stk |\n' : ''}
Smelltu á hnappana hér að neðan til að setja girðinguna á teikniborðið.`,
          actions,
        }
      }

      case 'scaffold': {
        const length = dims.length || 10
        const height = dims.height || 6
        const levels2m = Math.floor(height / 2)
        const levels07m = Math.round((height - levels2m * 2) / 0.7)

        actions.push({
          type: 'place_scaffold',
          label: `Setja vinnupall (${length}m × ${height}m)`,
          params: { length, levels2m, levels07m: Math.max(0, levels07m), legType: '50cm' },
        })
        actions.push({
          type: 'set_equipment',
          label: '🧮 Opna vinnupallareiknivél',
          params: { equipment: 'scaffold', navigate: '/calculator/scaffolding' },
        })

        const bays = Math.ceil(length / ESTIMATION_RULES.scaffold.bayWidth)
        const r = ESTIMATION_RULES.scaffold.perBay
        return {
          content: `**Vinnupallur — ${length}m × ${height}m:**

| Lýsing | Gildi |
|---|---|
| Lengd | ${length}m (${bays} reitir) |
| Hæð | ${height}m (${levels2m}× 2.0m hæðir) |
| Rammar | ~${bays * levels2m * r.standards} stk |
| Gólfborð | ~${bays * levels2m * r.platforms} stk |
| Handriði | ~${bays * r.guardrails} stk |
| X-styrkingar | ~${bays * levels2m * r.braces} stk |

Smelltu á hnappana til að setja pallinn á teikniborðið.`,
          actions,
        }
      }

      case 'formwork': {
        const wallLength = dims.length || 6
        const wallHeight = dims.height || 3
        const system = extractFormworkSystem(text) || 'Rasto'

        actions.push({
          type: 'place_formwork',
          label: `Setja steypumót (${wallLength}m × ${wallHeight}m ${system})`,
          params: { wallLength, wallHeight, system },
        })
        actions.push({
          type: 'set_equipment',
          label: '🧮 Opna steypumótsreiknivél',
          params: { equipment: 'formwork', navigate: '/calculator/formwork' },
        })

        const area = wallLength * wallHeight
        const ties = Math.ceil(wallLength / ESTIMATION_RULES.formwork.tieSpacingH) *
                     Math.ceil(wallHeight / ESTIMATION_RULES.formwork.tieSpacingV)
        const props = Math.ceil(wallLength / ESTIMATION_RULES.formwork.propSpacing)

        return {
          content: `**Steypumót — ${system} kerfi (${wallLength}m × ${wallHeight}m):**

| Lýsing | Gildi |
|---|---|
| Veggflatarmál | ${area.toFixed(1)} m² |
| Kerfi | ${system} |
| Stáltiestöngur | ~${ties} stk |
| Push-pull stoðir | ~${props * 2} stk (báðar hliðar) |
| Mótaflekar | ~${Math.ceil(area / 2.5)} stk (áætlað) |

Smelltu á hnappana til að setja mótið á teikniborðið.`,
          actions,
        }
      }

      case 'rolling': {
        const height = dims.height || 6
        const isNarrow = text.includes('mjó') || text.includes('narrow') || text.includes('0.75') || text.includes('0,75')
        const width = isNarrow ? 'narrow' : 'wide'
        const widthLabel = width === 'narrow' ? 'Mjór (0.75m)' : 'Breiður (1.35m)'

        actions.push({
          type: 'place_rolling',
          label: `Setja hjólapall (${height}m ${widthLabel})`,
          params: { height, width },
        })

        return {
          content: `**Hjólapallur — ${height}m ${widthLabel}:**

| Lýsing | Gildi |
|---|---|
| Vinnuhæð | ${height}m |
| Breidd | ${widthLabel} |
| Hámark innanhúss | 12m |
| Hámark útanhúss | 8m |
${height > 8 ? '\n⚠️ **Athugið:** Yfir 8m hæð — aðeins innanhúss notkun!' : ''}
${height > 12 ? '\n🚫 **Viðvörun:** Yfir 12m — hjólapallur er ekki viðeigandi. Íhugaðu vinnupall.' : ''}

Smelltu á hnappinn til að setja pallinn á teikniborðið.`,
          actions,
        }
      }

      case 'ceiling': {
        const height = dims.height || 3
        const roomWidth = dims.length || 6
        const propCount = dims.count || Math.ceil((roomWidth / 1.2) * 2)
        const beamCount = Math.ceil(roomWidth / 2.0)

        actions.push({
          type: 'place_ceiling',
          label: `Setja loftastoðir (${propCount} stoðir, ${height}m)`,
          params: { propCount, propHeight: height, beamCount, roomWidth },
        })

        return {
          content: `**Loftastoðir — ${roomWidth}m herbergi, ${height}m hæð:**

| Lýsing | Gildi |
|---|---|
| Loftastoðir | ${propCount} stk |
| HT-20 bitar | ${beamCount} stk |
| Herbergisbreidd | ${roomWidth}m |
| Hæð stoða | ${height}m |

Smelltu á hnappinn til að setja stoðirnar á teikniborðið.`,
          actions,
        }
      }
    }
  }

  // ── Basic shape drawing ──
  if (text.includes('rétthyrning') || text.includes('rect') || text.includes('kassa')) {
    const w = dims.length || 10
    const h = dims.height || 5
    actions.push({ type: 'draw_rect', label: `Teikna rétthyrning ${w}×${h}`, params: { width: w, height: h, x: 0, y: 0 } })
    return { content: `Teikna rétthyrning ${w}m × ${h}m. Smelltu á hnappinn til að setja á teikniborðið.`, actions }
  }

  if (text.includes('hring') || text.includes('circle')) {
    const r = dims.length || 3
    actions.push({ type: 'draw_circle', label: `Teikna hring r=${r}`, params: { radius: r, cx: 0, cy: 0 } })
    return { content: `Teikna hring með radíus ${r}m. Smelltu á hnappinn til að setja á teikniborðið.`, actions }
  }

  if (text.includes('línu') || text.includes('line') || text.includes('linu')) {
    const len = dims.length || 10
    actions.push({ type: 'draw_line', label: `Teikna línu ${len}m`, params: { length: len } })
    return { content: `Teikna ${len}m línu. Smelltu á hnappinn til að setja á teikniborðið.`, actions }
  }

  if (text.includes('texta') || text.includes('text')) {
    const content = text.replace(/teikna|bættu við|settu|texta|text/gi, '').trim() || 'LániCAD'
    actions.push({ type: 'draw_text', label: `Bæta við texta`, params: { text: content } })
    return { content: `Bæti við texta: "${content}". Smelltu á hnappinn.`, actions }
  }

  // Generic draw command
  return {
    content: `Ég get teiknað ýmsa hluti á teikniborðið:

🏗️ **Búnaður:**
• *"Teikna girðingu 30m"* — girðing með réttum fjölda panela
• *"Settu vinnupall 20m x 8m"* — vinnupallur
• *"Bættu steypumóti 10m x 3m Rasto"* — veggmót
• *"Teikna hjólapall 6m"* — hjólapallur

📐 **Grunnform:**
• *"Teikna rétthyrning 10x5"*
• *"Teikna hring r=3"*
• *"Teikna línu 15m"*

Hvaða búnað viltu setja á teikninguna?`,
    actions: [],
  }
}

function handleProductQuery(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  switch (parsed.equipment) {
    case 'fence': {
      const types = FENCE_TYPES.map(t => {
        const p = FENCE_PRODUCTS[t.productKey]
        return `| ${t.label} | ${formatKr(p.rates[0])}/dag | ${formatKr(p.salePrice)} |`
      }).join('\n')

      return {
        content: `**Iðnaðargirðingar — yfirlit:**

| Tegund | Leiga (1. mán.) | Söluverð |
|---|---|---|
${types}

**Aukabúnaður:** steinar, klemmur, gönguhliðar, hjól, lás
**Lágmarksleigu:** ${MIN_RENTAL_DAYS} dagar
**Leiguformúla:** 12 tímabil, 30 dagar hvert, lækkandi verð

Spurðu um einstaka vöru eða notaðu reiknivélina.`,
        actions: [
          { type: 'navigate', label: '🧮 Opna girðingareiknivél', params: { path: '/calculator/fence' } },
        ],
      }
    }

    case 'scaffold': {
      const systems = SCAFFOLD_SYSTEMS.map(s =>
        `| ${s.name} | ${hasScaffoldPricing(s.key) ? 'Já ✅' : 'Vantar ⚠️'} | ${getScaffoldItems(s.key).length} vörur |`
      ).join('\n')

      const mainItems = SCAFFOLD_ITEMS.slice(0, 8).map(i =>
        `| ${i.name} | ${formatKr(i.dailyRate)}/dag | ${i.weight} kg |`
      ).join('\n')

      return {
        content: `**Vinnupallakerfi:**

| Kerfi | Verðskrá | Vörur |
|---|---|---|
${systems}

**Mercury kerfi — helstu vörur:**
| Vara | Leiguverð | Þyngd |
|---|---|---|
${mainItems}

Alls ${SCAFFOLD_ITEMS.length} vörur í Mercury kerfinu.`,
        actions: [
          { type: 'navigate', label: '🧮 Opna vinnupallareiknivél', params: { path: '/calculator/scaffolding' } },
        ],
      }
    }

    case 'rolling': {
      const heights = ['2.5', '4.5', '6.5', '8.5', '10.5'] as const
      const rows = heights.map(h => {
        const n = NARROW_PRICING[h]
        const w = WIDE_PRICING[h]
        return `| ${h}m | ${formatKr(n['24h'])} | ${formatKr(w['24h'])} | ${formatKr(QUICKLY_PRICING?.['24h'] || 0)} |`
      }).join('\n')

      return {
        content: `**Hjólapallar — ${ROLLING_TYPES.map(t => t.label).join(', ')}:**

| Hæð | Mjór (0.75m) | Breiður (1.35m) | Quickly |
|---|---|---|---|
${rows}

**Verð:** Sólarhring / Aukadagur / Vikuverð
**Hæðir:** ${HEIGHT_OPTIONS.join(', ')}m
**Hámark:** 12m innanhúss, 8m útanhúss (EN 1004)`,
        actions: [
          { type: 'navigate', label: '🧮 Opna hjólapallareiknivél', params: { path: '/calculator/rolling' } },
        ],
      }
    }

    case 'ceiling': {
      const rows = LOFTASTODIR.slice(0, 6).map(p =>
        `| ${p.name} | ${p.minHeight}-${p.maxHeight}m | ${p.classLabel} | ${formatKr(p.dayRate)}/dag |`
      ).join('\n')
      const beamRows = MOTABITAR.map(b =>
        `| ${b.name} | ${formatKr(b.dayRate)}/dag | ${formatKr(b.salePrice)} |`
      ).join('\n')

      return {
        content: `**Loftastoðir — Villalta (EN 1065):**

| Tegund | Hæð | Flokkur | Dagverð |
|---|---|---|---|
${rows}

**HT-20 Mótabitar:**
| Tegund | Dagverð | Söluverð |
|---|---|---|
${beamRows}

**Aukabúnaður:** þrífætur, framlengingar, gafflhaus, rennari`,
        actions: [
          { type: 'navigate', label: '🧮 Opna loftastoðareiknivél', params: { path: '/calculator/ceiling' } },
        ],
      }
    }

    case 'formwork': {
      const system = extractFormworkSystem(text)
      if (system) {
        const info = SAFETY_KNOWLEDGE.formwork.systems[system.toLowerCase() as keyof typeof SAFETY_KNOWLEDGE.formwork.systems]
        return {
          content: `**${system} kerfi:**
${info || 'Upplýsingar ekki tiltækar.'}

**Tæknilegar forsendur:**
• Hámarks steypuþrýstingur: ${SAFETY_KNOWLEDGE.formwork.maxPourRate}
• Stáltiebil: ${ESTIMATION_RULES.formwork.tieSpacingH}m lárétt, ${ESTIMATION_RULES.formwork.tieSpacingV}m lóðrétt
• Lágmarks afmótunarstími: 12 klst (veggir), 7 dagar (plötur)`,
          actions: [
            { type: 'navigate', label: '🧮 Opna steypumótsreiknivél', params: { path: '/calculator/formwork' } },
          ],
        }
      }

      return {
        content: `**Steypumót — 6 kerfi í boði:**

| Kerfi | Notkun | Tegund |
|---|---|---|
| **Rasto** | Veggir | Staðalmót (30-240cm × 300cm) |
| **Takko** | Undirstöður | Lárvegar (30-90cm × 120cm) |
| **Manto** | Veggir/súlur | Stórmót (45-240cm × 330cm) |
| **Alufort** | Loftplötur | Álplötur (37.5-75cm) |
| **ID-15** | Stoðturn | Þungaburðar (150×120cm rammi) |
| **Robusto** | Veggir | Þungaburðar veggmót |

Spurðu um einstakt kerfi til að fá nánari upplýsingar.`,
        actions: [
          { type: 'navigate', label: '🧮 Opna steypumótsreiknivél', params: { path: '/calculator/formwork' } },
        ],
      }
    }

    default:
      return {
        content: `**LániCAD vöruflokkar:**

| Flokkur | Lýsing |
|---|---|
| 🚧 **Girðingar** | Iðnaðargirðingar 2.1-3.5m, steinar, klemmur |
| 🏗️ **Vinnupallar** | Mercury, Layher AR, SpeedyScaf kerfi |
| 🧱 **Steypumót** | Rasto, Takko, Manto, Alufort, ID-15, Robusto |
| 🛞 **Hjólapallar** | Mjóir, breiðir, Quickly — 2.5-12.5m |
| 🏛️ **Loftastoðir** | Villalta EN 1065, HT-20 mótabitar |

Spurðu um einstakan flokk til að fá nánari upplýsingar.`,
        actions: [],
      }
  }
}

function handlePriceQuery(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  const dims = extractDimensions(text)

  if (parsed.equipment === 'fence') {
    const types = FENCE_TYPES.map(t => {
      const p = FENCE_PRODUCTS[t.productKey]
      return `| ${t.label} | ${formatKr(p.rates[0])}/dag | ${formatKr(p.salePrice)} | ${formatKr(p.discountPrice)} |`
    }).join('\n')

    return {
      content: `**Verð á girðingum:**

| Tegund | Leiga (1. mán.) | Grunnverð | Spariverð |
|---|---|---|---|
${types}

Leiguverð lækkar í 12 tímabilum (30 dagar hvert). Lágmarksleigu: ${MIN_RENTAL_DAYS} dagar.`,
      actions: [{ type: 'navigate', label: '🧮 Reikna nákvæmt verð', params: { path: '/calculator/fence' } }],
    }
  }

  if (parsed.equipment === 'rolling') {
    const h = String(dims.height || 6.5)
    const narrow = NARROW_PRICING[h] || NARROW_PRICING['6.5']
    const wide = WIDE_PRICING[h] || WIDE_PRICING['6.5']
    const days = (dims as Record<string, number>).days || 7

    return {
      content: `**Verð á hjólapöllum (${h}m hæð, ${days} dagar):**

| | Mjór (0.75m) | Breiður (1.35m) |
|---|---|---|
| Sólarhringur | ${formatKr(narrow['24h'])} | ${formatKr(wide['24h'])} |
| Aukadagur | ${formatKr(narrow.extra)} | ${formatKr(wide.extra)} |
| Vika | ${formatKr(narrow.week)} | ${formatKr(wide.week)} |

**Áætlaður kostnaður (${days} dagar):**
• Mjór: ~${formatKr(days <= 1 ? narrow['24h'] : days < 7 ? narrow['24h'] + narrow.extra * (days - 1) : narrow.week * Math.ceil(days / 7))}
• Breiður: ~${formatKr(days <= 1 ? wide['24h'] : days < 7 ? wide['24h'] + wide.extra * (days - 1) : wide.week * Math.ceil(days / 7))}`,
      actions: [{ type: 'navigate', label: '🧮 Reikna nákvæmt verð', params: { path: '/calculator/rolling' } }],
    }
  }

  if (parsed.equipment === 'scaffold') {
    const mainItems = SCAFFOLD_ITEMS.slice(0, 10).map(i =>
      `| ${i.name} | ${formatKr(i.dailyRate)}/dag | ${formatKr(i.salePrice)} |`
    ).join('\n')

    return {
      content: `**Verð á vinnupöllum (Mercury kerfi):**

| Vara | Leiguverð | Söluverð |
|---|---|---|
${mainItems}

Leiguformúla: dagverð × fjöldi daga × magn.
Notaðu reiknivélina til að fá nákvæmt verð fyrir ákveðna uppbyggingu.`,
      actions: [{ type: 'navigate', label: '🧮 Reikna nákvæmt verð', params: { path: '/calculator/scaffolding' } }],
    }
  }

  if (parsed.equipment === 'ceiling') {
    const rows = LOFTASTODIR.map(p =>
      `| ${p.name} | ${formatKr(p.dayRate)}/dag | ${formatKr(p.weekRate)}/viku | ${formatKr(p.salePrice)} |`
    ).join('\n')

    return {
      content: `**Verð á loftastoðum:**

| Tegund | Dagverð | Vikuverð | Söluverð |
|---|---|---|---|
${rows}`,
      actions: [{ type: 'navigate', label: '🧮 Reikna nákvæmt verð', params: { path: '/calculator/ceiling' } }],
    }
  }

  return {
    content: `Til að sýna verð, segðu hvaða búnað þú hefur áhuga á:

• **Girðingar** — *"verð á girðingum"*
• **Vinnupallar** — *"verð á vinnupöllum"*
• **Hjólapallar** — *"hvað kostar hjólapallur 6.5m?"*
• **Steypumót** — *"verð á Rasto mótum"*
• **Loftastoðir** — *"verð á loftastoðum"*`,
    actions: [],
  }
}

function handleCalculation(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  const dims = extractDimensions(text)

  if (parsed.equipment === 'fence' || text.includes('girðing')) {
    const totalLen = dims.length || 30
    const panelWidth = 3.5
    const panels = Math.ceil(totalLen / panelWidth)
    const stones = panels + 1
    const clamps = panels - 1
    const p = FENCE_PRODUCTS['fence-3.5m']
    const dailyCost = p.rates[0] * panels + FENCE_PRODUCTS['stone-concrete'].rates[0] * stones + FENCE_PRODUCTS['clamps'].rates[0] * clamps

    return {
      content: `**Efnisáætlun — ${totalLen}m girðing (3.5m paneli):**

| Vara | Magn | Dagverð/stk | Samtals/dag |
|---|---|---|---|
| Girðingapaneli 3.5m | ${panels} stk | ${formatKr(p.rates[0])} | ${formatKr(p.rates[0] * panels)} |
| Steinsteypa | ${stones} stk | ${formatKr(FENCE_PRODUCTS['stone-concrete'].rates[0])} | ${formatKr(FENCE_PRODUCTS['stone-concrete'].rates[0] * stones)} |
| Klemmur | ${clamps} stk | ${formatKr(FENCE_PRODUCTS['clamps'].rates[0])} | ${formatKr(FENCE_PRODUCTS['clamps'].rates[0] * clamps)} |
| **Samtals/dag** | | | **${formatKr(dailyCost)}** |`,
      actions: [
        { type: 'place_fence', label: `📐 Teikna ${panels}-panela girðingu`, params: { panels, panelWidth, panelHeight: 2.0, includeGate: false } },
        { type: 'navigate', label: '🧮 Opna reiknivél', params: { path: '/calculator/fence' } },
      ],
    }
  }

  if (parsed.equipment === 'scaffold' || text.includes('vinnupall')) {
    const length = dims.length || 15
    const height = dims.height || 6
    const bays = Math.ceil(length / ESTIMATION_RULES.scaffold.bayWidth)
    const levels = Math.floor(height / 2)
    const r = ESTIMATION_RULES.scaffold.perBay
    const wallTies = Math.ceil(length * height * ESTIMATION_RULES.scaffold.wallTiesPerM2)

    return {
      content: `**Efnisáætlun — ${length}m × ${height}m vinnupallur:**

| Íhlutur | Magn (áætlun) |
|---|---|
| Reitir | ${bays} (${ESTIMATION_RULES.scaffold.bayWidth}m breiðir) |
| Hæðir | ${levels} × 2.0m |
| Rammar (lóðréttir) | ~${bays * levels * r.standards} stk |
| Láréttrekkur | ~${bays * levels * r.ledgers} stk |
| Gólfborð | ~${bays * levels * r.platforms} stk |
| X-styrkingar | ~${bays * levels * r.braces} stk |
| Handriði | ~${bays * levels * r.guardrails} stk |
| Tástoðir | ~${bays * levels * r.toeboards} stk |
| Veggfestar | ~${wallTies} stk |
| Grunnplötur | ~${(bays + 1) * 2} stk |

⚠️ Þetta er gróf áætlun. Notaðu reiknivélina fyrir nákvæmari útreikning.`,
      actions: [
        { type: 'place_scaffold', label: `📐 Teikna ${length}m×${height}m pall`, params: { length, levels2m: levels, levels07m: 0, legType: '50cm' } },
        { type: 'navigate', label: '🧮 Opna reiknivél', params: { path: '/calculator/scaffolding' } },
      ],
    }
  }

  if (parsed.equipment === 'ceiling' || text.includes('loftastoð')) {
    const area = (dims.length || 6) * (dims.height || 6)
    const propSpacing = 1.2
    const propsX = Math.ceil(Math.sqrt(area) / propSpacing) + 1
    const propsY = Math.ceil(Math.sqrt(area) / propSpacing) + 1
    const totalProps = propsX * propsY

    return {
      content: `**Efnisáætlun — ${area}m² loftplata:**

| Lýsing | Gildi |
|---|---|
| Flatarmál | ${area}m² |
| Stoðabil | ${propSpacing}m |
| Loftastoðir | ~${totalProps} stk |
| HT-20 bitar | ~${propsX * 2} stk |

**Tillaga:** Notaðu B- eða C-flokks stoðir fyrir 2.5-3.5m lofthæð.`,
      actions: [
        { type: 'navigate', label: '🧮 Opna reiknivél', params: { path: '/calculator/ceiling' } },
      ],
    }
  }

  return {
    content: `Ég get reiknað efnisþörf fyrir:

• *"Reikna efni í 30m girðingu"*
• *"Reikna efni í 20m × 8m vinnupall"*
• *"Reikna efni í 50m² loftplötu"*
• *"Hvað kostar hjólapallur 6.5m í 2 vikur?"*

Tilgreindu búnað og stærðir.`,
    actions: [],
  }
}

function handleRecommendation(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  if (parsed.equipment === 'formwork' || text.includes('mót') || text.includes('steyp')) {
    return {
      content: `**Mæli með steypumóti eftir notkun:**

| Notkun | Kerfi | Ástæða |
|---|---|---|
| Einfaldir veggir (< 3m) | **Rasto** | Létt, hraðsamt, klemmutenging |
| Stórar veggflötur | **Manto** | Kranatöku, stór flekar |
| Undirstöður | **Takko** | Sérhæft í lágum mótatillögum |
| Loftplötur | **Alufort** | Dropatoppur, hraðbreyting |
| Háar veggir / þungir | **Robusto** | Mikill þrýstingsþol |
| Stoðturnar / falsework | **ID-15** | Þungaburðar bekkir |

Bestu mót ráðast af: veggflæði, hæð steypu, endurnotkunarþörf, kranaaðgengi.`,
      actions: [],
    }
  }

  if (parsed.equipment === 'scaffold' || text.includes('pall')) {
    return {
      content: `**Vinnupallaráðgjöf:**

| Aðstæður | Ráðlegging |
|---|---|
| Fasaðavinna < 24m | Vinnupallar (Mercury/Layher) |
| Innivinna < 12m | Hjólapallur — breiður |
| Þröngt svæði < 8m | Hjólapallur — mjór |
| Skammtímavinna < 6m | Quickly pallur |
| Yfir 24m | Sérhönnuð pallastæðu — ráðfærðu við verkfræðing |

Alltaf: tryggðu veggfestingar, handriði og aðgang per EN 12811.`,
      actions: [],
    }
  }

  return {
    content: `Ég get mælt með búnaði. Segðu mér:
• Hvaða verk þú ert að framkvæma?
• Hæð og stærð svæðis?
• Inni eða úti?
• Tímabil (dagar/vikur)?

Dæmi: *"Hvað er best til að steypa 3m háan vegg?"*`,
    actions: [],
  }
}

function handleSafety(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  if (parsed.equipment === 'scaffold' || text.includes('pall')) {
    const sk = SAFETY_KNOWLEDGE.scaffolding
    return {
      content: `**Öryggisreglur — Vinnupallar (EN 12811):**

🔒 **Handriði:** ${sk.guardrails}

⚓ **Veggfesting:** ${sk.anchoring}

🌬️ **Vindur:** ${sk.windLimit}

👷 **Skoðun:** ${sk.inspection}

📏 **Grunnstoðir:** ${sk.baseplate}

🔀 **Styrkingar:** ${sk.bracing}

🪜 **Aðgangur:** ${sk.access}

**Staðlar:** ${sk.standards.join(', ')}`,
      actions: [],
    }
  }

  if (parsed.equipment === 'formwork' || text.includes('mót') || text.includes('steyp')) {
    const sk = SAFETY_KNOWLEDGE.formwork
    return {
      content: `**Öryggisreglur — Steypumót (EN 13670):**

🧱 **Steypuþrýstingur:** ${sk.concretePressure}

🔩 **Stáltiestöngur:** ${sk.tieRods}

⏱️ **Afmótunartími:** ${sk.stripping}

🌡️ **Hitastig:** ${sk.temperature}

📏 **Vikmörk:** ${sk.tolerances}

**Staðlar:** ${sk.standards.join(', ')}`,
      actions: [],
    }
  }

  if (parsed.equipment === 'rolling' || text.includes('hjóla')) {
    const sk = SAFETY_KNOWLEDGE.rolling
    return {
      content: `**Öryggisreglur — Hjólapallar (EN 1004):**

📏 **Hámarkshæð:** ${sk.maxHeight.indoor} / ${sk.maxHeight.outdoor}

🔓 **Stöðugleiki:** ${sk.stabilizers}

🚫 **Flutningur:** ${sk.movement}

👷 **Pallur:** ${sk.platform}

🔍 **Skoðun:** ${sk.inspection}

**Staðlar:** ${sk.standards.join(', ')}`,
      actions: [],
    }
  }

  if (parsed.equipment === 'ceiling' || text.includes('loftastoð') || text.includes('stoð')) {
    const sk = SAFETY_KNOWLEDGE.ceiling
    return {
      content: `**Öryggisreglur — Loftastoðir (EN 1065):**

📏 **Flokkar:** 
${sk.classes.map(c => `• ${c}`).join('\n')}

📐 **Stoðabil:** ${sk.spacing}

🔩 **Bitar:** ${sk.beams}

⏱️ **Eftirstoðun:** ${sk.reshoring}

**Staðlar:** ${sk.standards.join(', ')}`,
      actions: [],
    }
  }

  // General
  return {
    content: `**Almennar öryggisreglur á byggingarsvæðum:**

⚠️ Öll tæki skulu skoðuð áður en notkun hefst
👷 Persónuhlífar (hjálmur, öryggisgleraugu, öryggiskór) alltaf
🚧 Merkingar og girðingar utan um hættusvæði
📋 Áhættumat fyrir hvert verk
🌬️ Stöðva vinnu í miklum vindi (> 25 m/s á vinnupöllum)

Spurðu um einstakan búnað til að fá sértækar reglur.`,
    actions: [],
  }
}

function handleStandards(_text: string, _parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  return {
    content: `**Evrópustaðlar sem tengjast LániCAD búnaði:**

| Staðall | Lýsing |
|---|---|
| **EN 12811-1** | Tímabundnar vinnumannvirki — Vinnupallar |
| **EN 12810** | Fasaðapallar — Kerfispallar |
| **EN 1004** | Hjólapallar — Hönnun og notkun |
| **EN 1065** | Stillanlegar stálstoðir (loftastoðir) |
| **EN 12812** | Falsework — Tímabundin stuðningsmannvirki |
| **EN 13670** | Framkvæmd steinsteypu |
| **DIN 18218** | Steypuþrýstingur á lóðrétt mót |
| **EN 13374** | Tímabundin hliðarvörn |

Spurðu um einstakan staðal til að fá nánari upplýsingar.`,
    actions: [],
  }
}

function handleAssembly(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  if (parsed.equipment === 'scaffold' || text.includes('pall') && !text.includes('hjóla')) {
    return {
      content: ASSEMBLY_KNOWLEDGE.scaffold.setup +
        (text.includes('niður') || text.includes('tear') ? '\n\n' + ASSEMBLY_KNOWLEDGE.scaffold.teardown : ''),
      actions: [],
    }
  }

  if (parsed.equipment === 'formwork' || text.includes('mót') || text.includes('steyp')) {
    if (text.includes('plötu') || text.includes('loft') || text.includes('slab') || text.includes('alufort')) {
      return { content: ASSEMBLY_KNOWLEDGE.formwork.slab, actions: [] }
    }
    return { content: ASSEMBLY_KNOWLEDGE.formwork.wall, actions: [] }
  }

  if (parsed.equipment === 'fence' || text.includes('girðing')) {
    return { content: ASSEMBLY_KNOWLEDGE.fence.setup, actions: [] }
  }

  return {
    content: `Ég get aðstoðað með uppsetningarleiðbeiningar:

• *"Hvernig set ég upp vinnupall?"*
• *"Uppsetning veggmóta"*
• *"Hvernig set ég upp girðingu?"*
• *"Uppsetning loftaplötumóta"*
• *"Niðurrif vinnupalla"*`,
    actions: [],
  }
}

function handleNavigation(text: string): { content: string; actions: CadAction[] } {
  const actions: CadAction[] = []

  if (text.includes('teikni') || text.includes('draw') || text.includes('cad')) {
    actions.push({ type: 'navigate', label: '📐 Opna teikningu', params: { path: '/drawing' } })
  }
  if (text.includes('girð') || text.includes('fence')) {
    actions.push({ type: 'navigate', label: '🧮 Girðingareiknivél', params: { path: '/calculator/fence' } })
  }
  if (text.includes('vinnupall') || text.includes('scaffold')) {
    actions.push({ type: 'navigate', label: '🧮 Vinnupallareiknivél', params: { path: '/calculator/scaffolding' } })
  }
  if (text.includes('hjóla') || text.includes('rolling')) {
    actions.push({ type: 'navigate', label: '🧮 Hjólapallareiknivél', params: { path: '/calculator/rolling' } })
  }
  if (text.includes('steypu') || text.includes('formwork') || text.includes('mót')) {
    actions.push({ type: 'navigate', label: '🧮 Steypumótsreiknivél', params: { path: '/calculator/formwork' } })
  }
  if (text.includes('lofta') || text.includes('ceiling') || text.includes('stoð')) {
    actions.push({ type: 'navigate', label: '🧮 Loftastoðareiknivél', params: { path: '/calculator/ceiling' } })
  }
  if (text.includes('still') || text.includes('settings')) {
    actions.push({ type: 'navigate', label: '⚙️ Stillingar', params: { path: '/settings' } })
  }
  if (text.includes('verk') || text.includes('project')) {
    actions.push({ type: 'navigate', label: '📁 Verkefni', params: { path: '/projects' } })
  }

  if (actions.length === 0) {
    actions.push(
      { type: 'navigate', label: '📐 Teikning', params: { path: '/drawing' } },
      { type: 'navigate', label: '📁 Verkefni', params: { path: '/projects' } },
      { type: 'navigate', label: '⚙️ Stillingar', params: { path: '/settings' } },
    )
  }

  return {
    content: actions.length === 1
      ? `Smelltu á hnappinn hér að neðan til að opna.`
      : `Veldu hvert þú vilt fara:`,
    actions,
  }
}

function handleCadTool(_text: string): { content: string; actions: CadAction[] } {
  return {
    content: `**CAD verkfæri — flýtilyklar:**

| Verkfæri | Lykill | Lýsing |
|---|---|---|
| Velja | **V** | Velja, færa og breyta hlutum |
| Skoðun | **P** | Hliðra/panna teikniborðinu |
| Lína | **L** | Teikna beina línu |
| Rétthyrningur | **R** | Teikna rétthyrning |
| Hringur | **C** | Teikna hring |
| Bogi | **A** | Teikna hringboga |
| Marglína | **W** | Teikna fjölpunkta línu |
| Sporbaugur | **E** | Teikna sporbau |
| Marghyrningur | **N** | Teikna reglulegan marghyrning |
| Texti | **T** | Skrifa texta |
| Mál | **D** | Setja málatöku |
| Mæla | **M** | Mæla fjarlægð |
| Offset | **O** | Afrit í ákveðinni fjarlægð |

**Aðrar skipanir:** Ctrl+Z (afturkalla), Ctrl+Y (endurgera), Ctrl+C/V (afrita/líma), Ctrl+D (tvöfalda), Delete (eyða), G (rist), Esc (hætta við)`,
    actions: [{ type: 'navigate', label: '📐 Opna teikniborðið', params: { path: '/drawing' } }],
  }
}

function handleUnknown(text: string, parsed: ParsedIntent): { content: string; actions: CadAction[] } {
  // If we detected equipment, give product info
  if (parsed.equipment) {
    return handleProductQuery(text, parsed)
  }

  return {
    content: `Ég er **LániCAD AI** — byggingarverkfræðiaðstoðarmaður. Ég get aðstoðað með:

🏗️ **Teikna búnað** — *"teikna girðingu 20m"*, *"setja vinnupall 10m x 6m"*
📐 **Efnisáætlanir** — *"reikna efni í 30m girðingu"*
💰 **Verð** — *"hvað kostar hjólapallur 6.5m?"*
📋 **Öryggisreglur** — *"öryggisreglur vinnupalla"*
🔧 **Uppsetning** — *"hvernig set ég upp veggmót?"*
📊 **Staðlar** — *"EN 12811 staðall"*

Hvernig get ég aðstoðað þig?`,
    actions: [],
  }
}

// ── FAQ Check ──

function checkFAQ(text: string): string | null {
  for (const faq of FAQ) {
    if (faq.patterns.some(p => text.includes(p))) {
      return faq.answer
    }
  }
  return null
}
