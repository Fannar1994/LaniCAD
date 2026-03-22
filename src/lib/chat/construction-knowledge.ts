/**
 * Construction engineering knowledge base for LániCAD AI.
 * Contains domain-specific knowledge about formwork, scaffolding, shoring,
 * fences, and ceiling props — standards, safety rules, best practices.
 */

// ── Safety & Standards Knowledge ──

export const SAFETY_KNOWLEDGE = {
  scaffolding: {
    standards: ['EN 12811-1 (Temporary works equipment)', 'EN 12810 (Facade scaffolding)', 'ÍST EN 12811-1:2003'],
    maxHeight: '24m without special engineering (facade scaffolding)',
    windLimit: 'Scaffolding must be evaluated at wind speeds > 20 m/s. Work prohibited above 25 m/s.',
    inspection: 'Full inspection required before first use, after any modification, after bad weather, and at least weekly.',
    loadClasses: [
      'Class 1: 0.75 kN/m² — Inspection and light work',
      'Class 2: 1.50 kN/m² — Plastering, painting',
      'Class 3: 2.00 kN/m² — Masonry, cladding',
      'Class 4: 3.00 kN/m² — Heavy construction work',
      'Class 5: 4.50 kN/m² — Heavy storage and work',
      'Class 6: 6.00 kN/m² — Masonry with heavy materials',
    ],
    guardrails: 'Required at all platform edges >2m height. Top rail at 1.0m, mid rail at 0.5m, toe board 15cm.',
    anchoring: 'Wall ties required every 4m horizontally and 4m vertically (max 16m² per anchor).',
    access: 'Ladder or stair access required. Internal ladders must not span more than 9m without rest platform.',
    baseplate: 'Base plates required on all standards. Sole boards on soft ground. Max leg height adjustment: 600mm.',
    bracing: 'Diagonal bracing required at regular intervals. At minimum on every other bay in every other lift.',
  },

  formwork: {
    standards: ['EN 13670 (Execution of concrete structures)', 'DIN 18218 (Concrete pressure)', 'EN 12812 (Falsework)'],
    concretePressure: 'Fresh concrete lateral pressure P = ρ × g × h (max). For normal concrete ≈ 25 kN/m³ hydraulic head.',
    maxPourRate: 'Rasto/Manto panels rated to 60 kN/m² = 2.4m hydraulic head at standard pour rate.',
    tieRods: 'Tie rods required at maximum 1.2m horizontal spacing and 0.6-0.9m vertical spacing for wall forms.',
    stripping: 'Minimum stripping times: walls 12h, columns 12h, slabs 7 days (props stay 21 days), beams 14 days.',
    tolerances: 'Vertical tolerance: ±10mm for walls up to 3m. Horizontal tolerance: ±15mm for slabs.',
    temperature: 'Minimum concrete temperature at placement: 5°C. Curing protection required below 10°C.',
    systems: {
      rasto: 'Wall formwork 30-240cm widths × 300cm height. Max pour pressure: 60 kN/m². Steel frame with plywood face.',
      takko: 'Foundation formwork 30-90cm widths × 120cm height. Quick assembly with wedge clamps.',
      manto: 'Large-area wall formwork 45-240cm × 60-330cm. Crane-handled panels with push-pull props.',
      alufort: 'Aluminium slab formwork. Drop-head system for early striking. Panels 37.5-75cm widths.',
      id15: 'Heavy-duty shoring tower. Modular system for high loads. Standard frame 150×120cm.',
      robusto: 'Heavy wall formwork for large pours. Steel panels with integrated alignment system.',
    },
  },

  fence: {
    standards: ['EN 13374 (Temporary edge protection)', 'Various site safety regulations'],
    maxSpan: '3.5m panel is the maximum standard span. Use 2.5m or 2.1m for tighter curves.',
    windRating: 'Standard panels withstand wind speeds up to 80 km/h (mesh-type) with proper ballast.',
    ballast: 'Minimum 2 concrete blocks per panel connection point. Extra blocks for exposed sites.',
    gates: 'Pedestrian gates 1.2m wide, vehicle gates 6m minimum. Anti-lift hinges required.',
    installation: 'Panels must overlap at connections. Clamp every panel joint. Level ground required.',
  },

  rolling: {
    standards: ['EN 1004 (Mobile access towers)', 'EN 1298 (Mobile safety rules)'],
    maxHeight: {
      indoor: '12m maximum working height indoors',
      outdoor: '8m maximum working height outdoors (wind exposure)',
    },
    stabilizers: 'Outriggers required when height-to-base ratio exceeds 3.5:1 indoors or 3:1 outdoors.',
    movement: 'Never move tower with persons or loose materials on platform. Lock all wheels before use.',
    platform: 'Trapdoor access required. Maximum platform load: 200 kg/m².',
    inspection: 'Check wheels, brakes, connections, and guardrails before each use.',
  },

  ceiling: {
    standards: ['EN 1065 (Adjustable telescopic steel props)', 'EN 12812 (Falsework)'],
    classes: [
      'Class A: 1.00-1.80m extension — 20-30 kN capacity',
      'Class B: 1.50-2.50m extension — 20-30 kN capacity',
      'Class C: 2.00-3.50m extension — 15-25 kN capacity',
      'Class D: 2.50-4.00m extension — 12-20 kN capacity',
      'Class E: 3.00-5.50m extension — 10-17 kN capacity',
    ],
    spacing: 'Maximum prop spacing depends on slab thickness: 15cm slab → 1.4m spacing, 20cm → 1.2m, 25cm → 1.0m.',
    beams: 'HT-20 timber beams span between props. Max span 2.5m for 20cm slab, 2.0m for 25cm slab.',
    loading: 'Total load: self-weight of slab + formwork + construction loads (typically 1.5-2.5 kN/m²).',
    reshoring: 'After initial striking (7 days), reshoring required for additional 14 days (21 days total).',
  },
}

// ── Assembly & Technical Knowledge ──

export const ASSEMBLY_KNOWLEDGE = {
  scaffold: {
    setup: `**Uppsetningarskref fyrir vinnupalla (Mercury/Layher):**

1. **Undirbúningur** — Gangið úr skugga um að undirlag sé fast og jafnt
2. **Grunnstoðir** — Setjið grunnplötur og stillanlega fætur (max 600mm aðlögun)
3. **Fyrsta hæð** — Tengið rammar með láréttstöngum og gangaþilin
4. **Skástyrkingar** — Setjið X-styrkingar á aðra hverja reit
5. **Aðgangur** — Setjið stigapall eða innri stiga
6. **Handriði** — Setjið á sérhvert vinnusvæði (1.0m top + 0.5m mid + tástoð)
7. **Veggfesting** — Veggankerar á 4m fresti lárétt og lóðrétt
8. **Endurtaka** — Byggið næstu hæðir á sama hátt
9. **Skoðun** — Skoðið alla tengipunkta áður en notkun hefst`,

    teardown: `**Niðurrif vinnupalla:**
1. Byrjið á toppi — fjarlægið handriði, stigapalla
2. Takið niður skástyrkingar á efstu hæð
3. Fjarlægið rammar/láréttar á efstu hæð
4. Endurtakið niður til grunns
5. Stakið aldrei af pallahlutum — notið krana eða handvirka niðurleiðslu`,
  },

  formwork: {
    wall: `**Uppsetning veggmóta (Rasto/Manto):**

1. **Merkingar** — Merkið vegglínu á plötu
2. **Fyrri hlið** — Setjið mótaflekar á línuna, festu með stoðstöngum
3. **Tengingar** — Tengið flekar saman með klemmuburðum
4. **Járnakerfi** — Setjið járn og innfellingar á milli hliða
5. **Seinni hlið** — Setjið flekar á aðra hlið, tengið með stáltiestöngum
6. **Lóðréttun** — Stillið push-pull stoðir til að veita vegg
7. **Steypuskot** — Skoðið tengingar, lofa aldrei vinnuhraða > 2m/klst.`,

    slab: `**Uppsetning plötumóta (Alufort):**

1. **Loftastoðir** — Setjið stoðir í hnitaneti (sjá álagsreikninga)
2. **Mótabitar** — Setjið HT-20 bita á stoðir (max 2.5m bil)
3. **Plötur** — Setjið Alufort plötur á bita
4. **Brúnkjarnar** — Setjið brúnmót meðfram veggjum
5. **Leki-útilokun** — Þéttið öll söm á milli platna
6. **Skoðun** — Athugið lóðréttun og stöðugleika áður en steypt er`,
  },

  fence: {
    setup: `**Uppsetning iðnaðargirðinga:**

1. **Skipulag** — Mælið svæði, reiknaðu fjölda panela
2. **Steinar** — Setjið steina á tenipunkta (min 2 á hvert sæti)
3. **Paneli** — Setjið panela á steina, skerið ef nauðsynlegt
4. **Klemmur** — Festu panela saman með klemmböndum
5. **Hliðar** — Setjið gönguhliðar þar sem þörf er á
6. **Merking** — Merkið girðingu með öryggismerkingum`,
  },
}

// ── Material Estimation Rules ──

export const ESTIMATION_RULES = {
  scaffold: {
    description: 'Vinnupallar — efnisáætlun',
    perBay: {
      standards: 4,        // vertical tubes per 2.5m bay
      ledgers: 4,          // horizontal tubes (front+back, top+bottom)
      transoms: 2,         // cross beams
      braces: 1,           // diagonal brace per bay
      platforms: 1,        // platform per bay
      toeboards: 2,        // front + back per bay
      guardrails: 2,       // front + back per bay
    },
    bayWidth: 2.572,       // standard bay width in meters (Mercury)
    levelHeight: 2.0,      // standard level height
    wallTiesPerM2: 1 / 16, // one wall tie per 16m²
  },

  formwork: {
    description: 'Steypumót — efnisáætlun',
    tieSpacingH: 1.2,      // horizontal tie spacing (m)
    tieSpacingV: 0.75,     // vertical tie spacing (m)
    propSpacing: 1.5,      // push-pull prop spacing (m)
    wasteFactor: 1.05,     // 5% waste allowance
  },

  fence: {
    description: 'Girðingar — efnisáætlun',
    stonesPerConnection: 2,
    clampsPerJoint: 1,
    panelOverlap: 0,       // panels abut, no overlap
  },

  ceiling: {
    description: 'Loftastoðir — efnisáætlun',
    propSpacingByThickness: {
      150: 1.4, // 15cm slab → 1.4m spacing
      200: 1.2, // 20cm slab → 1.2m spacing
      250: 1.0, // 25cm slab → 1.0m spacing
      300: 0.9, // 30cm slab → 0.9m spacing
    },
    beamMaxSpan: 2.5,
  },
}

// ── FAQ / Common Questions ──

export const FAQ: { patterns: string[]; answer: string }[] = [
  {
    patterns: ['hversu hátt', 'hámarkshæð', 'max height', 'hvað má hæst'],
    answer: `**Hámarkshæðir búnaðar:**

| Búnaður | Hámarkshæð |
|---|---|
| Vinnupallar | 24m (yfir 24m þarf sérstaka hönnun) |
| Hjólapallar (innanhúss) | 12m vinnuhæð |
| Hjólapallar (útanhúss) | 8m vinnuhæð |
| Loftastoðir (E-flokkur) | 5.5m |
| Veggmót (Rasto 300cm) | 3.0m (stöfluð: 6.0m) |`,
  },
  {
    patterns: ['hversu þungt', 'þyngd', 'weight', 'hvað þyngir'],
    answer: `Þyngd fer eftir tegund. Notaðu reiknivélina til að fá nákvæma þyngd. Sem dæmi:
• Vinnupallarammi 200×73cm: ~18 kg
• Iðnaðargirðing 3.5m: ~22 kg
• Loftastoð (flokkur C): ~12 kg
• Mótafleki Rasto 300×120cm: ~95 kg`,
  },
  {
    patterns: ['hversu lengi', 'lágmarksleigu', 'minimum rental', 'min dagar'],
    answer: `**Lágmarksleigutímar:**
• Girðingar: 10 dagar (lágmark)
• Vinnupallar: 1 dagur
• Hjólapallar: 1 sólarhringur (24h)
• Steypumót: 1 dagur
• Loftastoðir: 1 dagur`,
  },
  {
    patterns: ['skoðun', 'inspection', 'athuga', 'eftirlitsreglur'],
    answer: `**Skoðunarreglur:**
• **Vinnupallar**: Skoðun fyrir fyrstu notkun, eftir breytingar, eftir slæmt veður, vikulega
• **Hjólapallar**: Hjól, bremsar, tengingar og handriði fyrir hverja notkun
• **Steypumót**: Tengingar, lóðréttun og stoðir fyrir steypuskot
• **Loftastoðir**: Stilling, staðsetning og álagsmat fyrir steypuskot`,
  },
]
