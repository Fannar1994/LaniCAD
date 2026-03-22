/**
 * Client-side AI chat engine for LániCAD.
 * Uses keyword matching against product data — no server or paid API needed.
 */

import { FENCE_PRODUCTS, FENCE_TYPES, MIN_RENTAL_DAYS } from '@/data/fence'
import { SCAFFOLD_ITEMS } from '@/data/scaffolding'
import {
  NARROW_PRICING, WIDE_PRICING, QUICKLY_PRICING,
  ROLLING_TYPES, HEIGHT_OPTIONS,
} from '@/data/rolling-scaffold'
import { LOFTASTODIR, MOTABITAR, AUKAHLUTIR } from '@/data/ceiling-props'
import { formatKr } from '@/lib/format'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Process user messages and return a helpful reply */
export function getLocalReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'user') return 'Ég skil þig ekki. Reyndu aftur.'

  const text = last.content.toLowerCase().trim()

  // Greeting
  if (matchesAny(text, ['hæ', 'halló', 'hei', 'hey', 'góðan dag', 'sæl', 'bless'])) {
    return 'Hæ! Ég er LániCAD aðstoðarmaður. Ég get hjálpað þér með upplýsingar um tækjaleigu og sölu á girðingum, vinnupöllum, steypumótum, hjólapöllum og loftastoðum. Hvernig get ég aðstoðað þig?'
  }

  // Help / what can you do
  if (matchesAny(text, ['hjálp', 'help', 'hvað getur', 'hvað get', 'hvaða', 'what can'])) {
    return `Ég get hjálpað þér með:

• **Girðingar** — verð, tegundir og leiguverð á iðnaðargirðingum
• **Vinnupallar** — Layher Allround kerfi, verð og íhlutir
• **Steypumót** — Rasto, Takko, Manto og Alufort kerfi
• **Hjólapallar** — mjóir, breiðir og Quickly pallar, verð eftir hæð
• **Loftastoðir** — Villalta stoðir (EN 1065), HT-20 mótabitar

Spurðu mig um verð, tegundir eða leigukjör!`
  }

  // ── FENCE queries ──
  if (matchesAny(text, ['girðing', 'gird', 'fence', 'hliðar', 'hlið', 'steinar', 'klemmur', 'biðraða', 'biðröð', 'plast'])) {
    return handleFenceQuery(text)
  }

  // ── SCAFFOLDING queries ──
  if (matchesAny(text, ['vinnupall', 'vinnupallar', 'scaffold', 'layher', 'ramm', 'gólfborð', 'stigapall', 'rekkur', 'stiga'])) {
    return handleScaffoldQuery(text)
  }

  // ── ROLLING SCAFFOLD queries ──
  if (matchesAny(text, ['hjólapall', 'hjólapallar', 'rolling', 'mjór pallur', 'breiður pallur', 'quickly', 'mobile scaffold'])) {
    return handleRollingQuery(text)
  }

  // ── CEILING PROPS queries ──
  if (matchesAny(text, ['loftastoð', 'loftastod', 'ceiling', 'villalta', 'mótabit', 'motabit', 'ht-20', 'ht20', 'þrífótur', 'stoðir', 'stoð'])) {
    return handleCeilingQuery(text)
  }

  // ── FORMWORK queries ──
  if (matchesAny(text, ['steypumót', 'steypumot', 'formwork', 'rasto', 'takko', 'manto', 'alufort', 'mótaflek', 'motaflek'])) {
    return handleFormworkQuery(text)
  }

  // ── Price / cost queries ──
  if (matchesAny(text, ['verð', 'hvað kostar', 'leiga', 'leiguverð', 'kostnaður', 'reikna', 'sala', 'price', 'cost', 'rent'])) {
    return `Til að hjálpa þér nákvæmlega, vinsamlega tilgreindu hvaða vöruflokk:

• **Girðingar** — iðnaðargirðingar, steinar, klemmur, hliðar
• **Vinnupallar** — Layher Allround rammar, gólfborð, stigar
• **Steypumót** — Rasto, Takko, Manto, Alufort kerfi
• **Hjólapallar** — mjóir (0,75m), breiðir (1,35m), Quickly
• **Loftastoðir** — Villalta EN 1065, HT-20 mótabitar

Dæmi: "Hvað kostar girðing 3,5m?" eða "Verð á hjólapalli 6,5m"`
  }

  // ── Calculator guidance ──
  if (matchesAny(text, ['reiknivél', 'reikni', 'calculator', 'hvernig nota', 'hvernig reikna'])) {
    return `LániCAD er með 5 reiknivélar:

1. **Girðingar** — veldu tegund, lengd svæðis, tímabil → reiknar fjölda og leigukostnað
2. **Vinnupallar** — veldu fjölda hæða og hliðar → reiknar alla íhluti
3. **Steypumót** — veldu kerfi og flekastærðir → reiknar dag/vikuverð
4. **Hjólapallar** — veldu tegund og hæð → reiknar sólarhrings/vikuverð
5. **Loftastoðir** — veldu stærð og fjölda → reiknar dag/vikuverð

Farðu í viðeigandi reiknivél í vinstri valmynd til að byrja.`
  }

  // Fallback
  return `Ég er ekki viss um hvað þú meinar. Ég get aðstoðað með:

• Verðupplýsingar á tækjum (girðingar, pallar, steypumót, loftastoðir)
• Leiðbeiningar um reiknivélar
• Upplýsingar um vöruflokka og tegundir

Prófaðu til dæmis: "Hvað kostar girðing?", "Sýndu verð á hjólapöllum" eða "Upplýsingar um loftastoðir"`
}

// ── Topic handlers ──

function handleFenceQuery(text: string): string {
  // Specific product lookup
  if (matchesAny(text, ['steinn', 'steinar'])) {
    const concrete = FENCE_PRODUCTS['stone-concrete']
    const pvc = FENCE_PRODUCTS['stone-pvc']
    return `**Steinar f/girðingar:**

| Tegund | Leiga (1. mánuður) | Grunnverð | Spariverð |
|---|---|---|---|
| ${concrete.description} | ${formatKr(concrete.rates[0])}/dag | ${formatKr(concrete.salePrice)} | ${formatKr(concrete.discountPrice)} |
| ${pvc.description} | ${formatKr(pvc.rates[0])}/dag | ${formatKr(pvc.salePrice)} | ${formatKr(pvc.discountPrice)} |

Leiguverð lækkar í hverju 30-daga tímabili. Lágmarksleigu: ${MIN_RENTAL_DAYS} dagar.`
  }

  if (matchesAny(text, ['klemm'])) {
    const c = FENCE_PRODUCTS['clamps']
    return `**${c.description}:**\nLeiga: ${formatKr(c.rates[0])}/dag (1. mánuður)\nGrunnverð: ${formatKr(c.salePrice)} | Spariverð: ${formatKr(c.discountPrice)}`
  }

  if (matchesAny(text, ['hlið', 'göngu', 'walking', 'gate'])) {
    const gate = FENCE_PRODUCTS['walking-gate']
    const wheels = FENCE_PRODUCTS['wheels']
    const lock = FENCE_PRODUCTS['lock']
    return `**Hliðar og tengdur búnaður:**

| Vara | Leiga (1. mán.) | Grunnverð | Spariverð |
|---|---|---|---|
| ${gate.description} | ${formatKr(gate.rates[0])}/dag | ${formatKr(gate.salePrice)} | ${formatKr(gate.discountPrice)} |
| ${wheels.description} | ${formatKr(wheels.rates[0])}/dag | ${formatKr(wheels.salePrice)} | ${formatKr(wheels.discountPrice)} |
| ${lock.description} | ${formatKr(lock.rates[0])}/dag | ${formatKr(lock.salePrice)} | ${formatKr(lock.discountPrice)} |`
  }

  // General fence info
  const types = FENCE_TYPES.map(t => {
    const p = FENCE_PRODUCTS[t.productKey]
    return `| ${t.label} | ${formatKr(p.rates[0])}/dag | ${formatKr(p.salePrice)} | ${formatKr(p.discountPrice)} |`
  }).join('\n')

  return `**Girðingar — yfirlit:**

| Tegund | Leiga (1. mán.) | Grunnverð | Spariverð |
|---|---|---|---|
${types}

Leiguverð lækkar í 12 tímabilum (30 dagar hvert). Lágmarksleigu: ${MIN_RENTAL_DAYS} dagar.
Notaðu Girðingareiknivélina til að reikna nákvæmt tilboð.`
}

function handleScaffoldQuery(text: string): string {
  if (matchesAny(text, ['ramm', 'frame'])) {
    const items = SCAFFOLD_ITEMS.filter(i => i.name.toLowerCase().includes('ramm'))
    const rows = items.map(i =>
      `| ${i.name} | ${formatKr(i.dailyRate)}/dag | ${i.weight} kg | ${formatKr(i.salePrice)} |`
    ).join('\n')
    return `**Vinnupallarammar (Layher Allround):**

| Vara | Leiguverð | Þyngd | Söluverð |
|---|---|---|---|
${rows}`
  }

  // General scaffold info — show top items
  const mainItems = SCAFFOLD_ITEMS.slice(0, 12)
  const rows = mainItems.map(i =>
    `| ${i.name} | ${formatKr(i.dailyRate)}/dag | ${formatKr(i.salePrice)} |`
  ).join('\n')

  return `**Vinnupallar — Layher Allround kerfi:**

| Vara | Leiguverð | Söluverð |
|---|---|---|
${rows}

Alls ${SCAFFOLD_ITEMS.length} vörur í boði. Leiguverð: dagverð × fjöldi daga × magn.
Notaðu Vinnupallareiknivélina til að reikna nákvæmt tilboð.`
}

function handleRollingQuery(text: string): string {
  // Specific height lookup
  const heightMatch = text.match(/(\d+[,.]?\d*)\s*m/)
  if (heightMatch) {
    const h = heightMatch[1].replace(',', '.')
    if (HEIGHT_OPTIONS.includes(h as typeof HEIGHT_OPTIONS[number])) {
      const narrow = NARROW_PRICING[h]
      const wide = WIDE_PRICING[h]
      return `**Hjólapallar — ${h}m hæð:**

| | Mjór (0,75m) | Breiður (1,35m) |
|---|---|---|
| Sólarhringur | ${formatKr(narrow['24h'])} | ${formatKr(wide['24h'])} |
| Aukadagur | ${formatKr(narrow.extra)} | ${formatKr(wide.extra)} |
| Vika | ${formatKr(narrow.week)} | ${formatKr(wide.week)} |
| Trygging | ${formatKr(narrow.deposit)} | ${formatKr(wide.deposit)} |

Formúla: 1 dagur = sólarhring. 2-6 dagar = sólarhring + aukadag × (dagar-1). 7+ = vika × heilar vikur + sólarhring × aukadagar.`
    }
  }

  // General rolling scaffold info
  const heights = ['2.5', '4.5', '6.5', '8.5', '10.5']
  const rows = heights.map(h => {
    const n = NARROW_PRICING[h]
    const w = WIDE_PRICING[h]
    return `| ${h}m | ${formatKr(n['24h'])} | ${formatKr(w['24h'])} |`
  }).join('\n')

  return `**Hjólapallar — verðyfirlit:**

${ROLLING_TYPES.map(t => `• ${t.label}`).join('\n')}

| Hæð | Mjór/sólarhring | Breiður/sólarhring |
|---|---|---|
${rows}

Quickly pallur: ${formatKr(QUICKLY_PRICING['24h'])}/sólarhring

Hæðir í boði: ${HEIGHT_OPTIONS.join(', ')}m
Notaðu Hjólapallareiknivélina til að fá nákvæmt verð.`
}

function handleCeilingQuery(text: string): string {
  if (matchesAny(text, ['mótabit', 'motabit', 'ht-20', 'ht20', 'bitar'])) {
    const rows = MOTABITAR.map(b =>
      `| ${b.name} | ${formatKr(b.dayRate)}/dag | ${formatKr(b.weekRate)}/viku | ${formatKr(b.salePrice)} |`
    ).join('\n')
    return `**HT-20 Mótabitar:**

| Vara | Dagverð | Vikuverð | Söluverð |
|---|---|---|---|
${rows}`
  }

  if (matchesAny(text, ['aukahlu', 'þrífót', 'framlenging', 'gaffl', 'rekkur'])) {
    const rows = AUKAHLUTIR.map(a =>
      `| ${a.name} | ${formatKr(a.dayRate)}/dag | ${formatKr(a.weekRate)}/viku | ${formatKr(a.salePrice)} |`
    ).join('\n')
    return `**Aukahlutir f/loftastoðir:**

| Vara | Dagverð | Vikuverð | Söluverð |
|---|---|---|---|
${rows}`
  }

  // General ceiling props
  const rows = LOFTASTODIR.map(p =>
    `| ${p.name} | ${p.minHeight}-${p.maxHeight}m | ${p.classLabel} | ${formatKr(p.dayRate)}/dag | ${formatKr(p.salePrice)} |`
  ).join('\n')

  return `**Loftastoðir — Villalta (EN 1065):**

| Tegund | Hæð | Flokkur | Dagverð | Söluverð |
|---|---|---|---|---|
${rows}

Leiguformúla: dagar < 7 → dagverð × dagar × magn; annars vikuverð × ceil(dagar/7) × magn.
Einnig í boði: HT-20 mótabitar og aukahlutir. Spurðu mig um þá!`
}

function handleFormworkQuery(text: string): string {
  if (matchesAny(text, ['rasto'])) {
    return `**Rasto kerfi (veggir):**
Mótaflekar 30-240cm × 300cm, leiguverð frá 70 kr/dag.
Einnig í boði: 150cm hæð, Mp-mótaflekar, innhorn, veltihorn, hornastillar.

Notaðu Steypumótsreiknivélina til að velja flekastærðir og fá nákvæmt verð.`
  }

  if (matchesAny(text, ['takko'])) {
    return `**Takko kerfi (undirstöður):**
Mótaflekar 30-90cm × 120cm, leiguverð frá 33 kr/dag.
Einnig í boði: Mp-mótaflekar, innhorn, veltihorn, hornastillar.

Notaðu Steypumótsreiknivélina til að velja flekastærðir og fá nákvæmt verð.`
  }

  if (matchesAny(text, ['manto'])) {
    return `**Manto kerfi (veggir/súlur):**
Mótaflekar 45-240cm × 60-330cm, leiguverð frá 47 kr/dag.
Einnig í boði: hornaflekar, útvíkkanir, krampa panel.

Notaðu Steypumótsreiknivélina til að velja flekastærðir og fá nákvæmt verð.`
  }

  if (matchesAny(text, ['alufort'])) {
    return `**Alufort kerfi (loftslagsmót):**
Plötur 37,5-75cm, leiguverð frá 117 kr/dag.

Notaðu Steypumótsreiknivélina til að velja stærðir og fá nákvæmt verð.`
  }

  return `**Steypumót — 4 kerfi í boði:**

| Kerfi | Notkun | Leiguverð frá |
|---|---|---|
| **Rasto** | Veggir (30-240cm × 300cm) | 70 kr/dag |
| **Takko** | Undirstöður (30-90cm × 120cm) | 33 kr/dag |
| **Manto** | Veggir/súlur (45-240cm × 330cm) | 47 kr/dag |
| **Alufort** | Loftslagsmót (37,5-75cm) | 117 kr/dag |

Leiguformúla: dagar < 7 → dagverð × dagar × magn; annars vikuverð × ceil(dagar/7) × magn.
~170 vörur í boði. Notaðu Steypumótsreiknivélina til að velja flekastærðir.`
}

// ── Helpers ──

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some(kw => text.includes(kw))
}
