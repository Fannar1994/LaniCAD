---
name: construction-engineering
description: Construction engineering knowledge for formwork, scaffolding, shoring, fences, and ceiling props — including product systems, dimensional standards, assembly rules, safety requirements, and inventory management used in LániCAD.
argument-hint: Which system? (formwork | scaffolding | fence | rolling | ceiling | shoring | racks | inventory)
---

# Construction Engineering Skill — LániCAD

## Inventory & Stock Management

### Excel Source: `Leigulager allt.xlsx`
- 2,619 items across 396 sub-groups in a single "Allt" sheet
- Columns: Item No. | Item Description | Item Description 2 | Sub Group | Item Description 3 | Weight | Date Purchased | Selling Price | Buying Price | Default Week Rate | Default Day Rate | Bar Code
- Item numbering pattern: `XX-CAT-SUBXX-NNN`
  - `01-` = Construction rental (424 items): formwork, scaffolding, fences, props, beams
  - `11-` = Tool rental (1,093 items): drills, saws, heaters, vacuums, floor machines
  - `21-` = Garden/outdoor/lifting (564 items)
  - `91-` = Customer-owned, `92-` = Auction/extras
- Sub-group name decoding:
  - `BAT` = Barriers/fences, `MÓT` = Formwork (Mót), `PAL` = Scaffolding (Pallar)
  - `GI` = Fences (Girðingar), `VP` = Scaffolding (Vinnupallar), `HP` = Rolling scaffold (Hjólapallar)
  - `KM` = Manto/Robusto, `HM` = Rasto/Takko, `LM` = Slab/Props/Beams, `SM` = Column formwork
  - `AH` = Formwork accessories, `LM51` = Props, `LM71` = Beams, `LM81` = ID frames

### Rack / Storage Systems (Rekkar & Fylgihlutagrindar)
Purpose: Transport & storage racks included in rental calculations.
Types by equipment:
- **Fence racks**: Rekkar f/Girðingar 350cm (25–30 stk capacity), combo racks for fences + stones
- **Formwork accessory crates**: Fylgihlutagrind (800×1200×630–1250mm, ~72 kg each)
- **Alufort panel racks**: Galvanized, for slab formwork panels
- **Ceiling prop racks**: Painted (old) and galvanized Faresin (new)
- **ID frame racks**: For ID-15 shoring frames (100 and 133 sizes)
- **Scaffold racks**: For frames (50 stk), floors (40 stk), double guardrails (40 stk)
- All racks have day/week rental rates (typically 50–210 ISK/day)

## Product Systems & Suppliers

### Mobile Fences (Girðingar) — kkservice.pl
- **Supplier**: https://kkservice.pl/en/ (Polish manufacturer)
- **Types in stock** (01-BAT-GI01, 19 items):
  - Standard galvanized: 3500×2000mm (1.1mm wire, 22.6 kg)
  - Plastic: 2100×1100mm RA2
  - Queue barriers (Biðraðagirðingar): 2500×1100mm (18.35 kg)
  - Shield plates (Gátaskjöldur): 1300×310mm
  - Concrete stones, clamps, gates, feet
- **Panels**: Welded steel mesh in galvanized tube frame
- **Feet**: Concrete stones (35×22×15cm) or PVC bases
- **Connections**: Tube clamps join adjacent panels at top rail
- **Gates**: 120cm pedestrian gates with upper locking mechanism
- **Assembly rule**: Each panel needs 2 feet (shared at joints). N panels = N+1 stones.

### Mobile Scaffolding — Hjólapallar (Frigerio Alupont)
- **Supplier**: Frigerio S.p.A. (Italy) — https://www.frigeriospa.com
- **Systems**:
  - **0.75m (B1/B5)**: Alupont B74 — narrow tower
    - Ref: https://www.frigeriospa.com/en/products/professional-scaffolds-alupont-b74
    - Frames: B1=2.1m tall, B5=1.05m tall (from stock 01-PAL-HP01)
  - **1.35m (F1/F5)**: Alupont F135 — wide tower
    - Ref: https://www.frigeriospa.com/en/products/professional-scaffold-alupont-f135
    - Frames: F1=2.1m tall, F5=1.05m tall
    - Stock heights (01-PAL-HP88): 4.5m, 5.5m, 6.5m, 7.5m, 8.5m, 9.5m, 10.5m
  - **Quickly (foldable)**: Alupont Quick — single-person setup
    - Ref: https://www.frigeriospa.com/en/products/professional-scaffolds-Foldable-alupont-quick
    - Stock heights (01-PAL-HP66): 3.8m, 4.0m, 4.5m, 5.0m, 5.8m, 6.5m, 7.0m, 7.8m, 8.0m, 9.0m, 10.0m
- **Structure**: 
  - Aluminum H-frames stacked vertically, pin-connected
  - Diagonal X-braces on long sides
  - Platform with trap door for internal ladder access
  - Castors (Ø200mm) with brakes
  - Outriggers/stabilizers required above ~4m height
- **Key dimensions**:
  - Frame length: ~2.5m (along working direction)
  - Narrow width: 0.75m, Wide width: 1.35m
  - Guardrail height: 1.0m above platform
  - Frame heights: 2.1m (B1/F1) and 1.05m (B5/F5)
- **Stock components** (01-PAL-HP01, 25 items): Álbrýr 6.2M, frames, Styttur (jacks), Álrammar

### Facade Scaffolding — Vinnupallar (Layher)
- **Layher Allround (AGS)**: Rosette-node modular — 48.3mm tube OD
  - Ref: https://www.layher.com/en-de/products/ags-system
  - Bay lengths: 1.09m, 1.40m, 1.57m, 2.07m, 2.57m (standard), 3.07m
  - Bay depth: 0.73m standard, 1.09m wide
  - Vertical: 2.0m (standard) or 0.7m (half)
  - Rosette spacing: 0.5m vertical on standards
- **Layher SpeedyScaf**: Quick-erect frame scaffolding
  - Ref: https://www.layher.com/en-de/products/speedyscaf
- **Stock components** (01-PAL-VP01, 50 items):
  - Rammar 2.0M, 0.7M (frames)
  - Gólfborð 1.8M (floor boards)
  - Handrið (guardrails) — including H20 type
  - Fótlisti (toeboards)
  - Styttur (screw jacks)
  - Rekkar for frames/floors/guardrails (storage racks)
- **Components per bay**:
  - 2× vertical standards (front + back)
  - 2× ledgers (horizontal, front + back)
  - 1× transverse connector
  - 1× platform deck board (1.8m)
  - 1× diagonal brace (alternating)
  - Wall ties: 1 per 15m² of scaffold face
- **Screw jacks**: 50cm or 100cm adjustable base
- **Safety**: Double guardrails (top 1.0m + mid 0.5m), toeboard 15cm, end-stops
- **Roof systems**:
  - **Keder Roof XL**: https://www.layher.com/en-de/products/protectivesystems/overlay_kederdachxl
  - **Allround FW Roof**: https://www.layher.com/en-de/products/protectivesystems/overlay_fachwerktraeger-dach

### Ceiling Props — Loftastoðir (Villalta + Kaufmann)
- **Props supplier**: Villalta S.r.l. (Italy) — https://www.villaltasrl.it/
- **Beam brand**: Kaufmann HT-20
- **Props** (01-MÓT-LM51, 22 items):
  - Telescopic steel acrow props (EN 1065 certified)
  - Stock includes: Loftastoðir 2-3.5M, 3-5.2M (Málað/Galvanized)
  - Tripods (Þrífætur) for stability
  - Euro Stacking Frames 240/80 (storage)
  - Faresin-brand galvanized props also in stock
- **EN 1065 Classes**:
  - A: 0.7–2.0m, 20–52.1 kN | B/BD: 1.6–2.9m, 20–35 kN
  - CD: 2.0–3.5m, 15–35 kN | CE: 2.5–4.0m, 12–30 kN
  - D/E: 3.0–5.5m, 10–30 kN
- **Prop structure**:
  - Outer tube (bottom): ~60mm OD, thicker wall
  - Inner tube (top): ~48mm, slides inside outer
  - Adjustment collar with pin holes at fixed intervals
  - Fine adjustment via threaded spindle/handle
  - Base plate: 150×150mm | Head plate: 120×120mm
- **HT-20 Beams** (01-MÓT-LM71, 11 items):
  - Kaufmann timber I-beams, 80mm wide × 200mm deep
  - Stock lengths: 1.20m, 2.45m, 2.65m, 2.90m, 3.0m, 3.3m, 3.6m, 3.9m, 4.9m
  - Faresin beams: L:290 H:20, L:390 H:20 (alternative brand)
  - Accessories (01-MÓT-LM55, 13 items): H20 C-Hook 6M, HT Crane Hook, Bitamót height adj.
- **Layout rules**:
  - Props in grid: 1.0–1.5m spacing for 20cm slabs
  - Primary beams on prop heads → secondary beams perpendicular → plywood on top
  - Tripod base on uneven ground

### Mercury Frame System (Villalta)
- **Supplier**: https://www.villaltasrl.it/
- Frame system for slab support (separate from telescopic props)
- Used in conjunction with HT-20 beams for large slab areas

### Wall Formwork — Hünnebeck Systems

#### Panel Systems (from stock data)

**Rasto** (01-MÓT-HM01, 14 panels + 01-MÓT-HM21, 16 accessories):
- Light hand-set formwork, steel frame + 18mm birch plywood face
- Stock panel sizes: 30×300, 45×150, 60×150, 90×150, 90×300, 120×300, 150×300, 240×300, plus MP panels
- Weight: ~40–80 kg/m² depending on size
- Accessories: Réttskeiðarklemmur (alignment clamps), Kranakrókar (crane hooks), Skástífur (aligning struts)
- **Rasto G2**: Updated clamp connections — https://products.huennebeck.com/systems/wall-formwork/rasto-g2

**Takko** (01-MÓT-HM02, 10 items):
- Medium panel system, 120cm height
- Stock: Hornastillar 5×120 (fillers), Innhorn 25/120 S (inside corners), panels 90×120
- Skástífur (aligning struts): 106–131cm, 148–260cm 

**Manto** (01-MÓT-KM01, 59 panels — LARGEST stock category + 01-MÓT-KM21, 15 accessories):
- Heavy-duty crane-handled, steel frame, 330cm height
- Stock widths: 30, 45, 50, 55, 60, 75, 90, 120, 135, 150, 180, 200, 240 cm × 120 or 330 cm
- Inside corners: 35/120, outside corners, adjustable corners
- Accessories: Réttskeiðaklemmur, Flekaklemmur (panel clamps), Pouring Platform, Felling brackets
- Max pressure: 80 kN/m² (crane-set, higher-rated)
- **Manto G3/G3M**: https://products.huennebeck.com/systems/wall-formwork/manto-g3-g3m

**Robusto** (01-MÓT-KM02, 8 panels + 01-MÓT-KM22, 14 accessories):
- Heavy panel system
- Stock: 30×300, 45×300, 60×300, 90×300, 120×300, 150×300, 240×300
- Accessories: Fleygur f/Dregarafestingu, Dregarafesting, Plata 20×20×8

**Platinum**: Premium wall panels — highest finish quality
- Ref: https://products.huennebeck.com/systems/wall-formwork/platinum

**Column Formwork** (01-MÓT-SM01, 5 items):
- Samtengivinklar (connection angles), Súlumót 70×300, 70×75

#### CRITICAL: Two-Sided Formwork Rule
**Walls ALWAYS require formwork on BOTH sides.** For every meter of wall:
- 2× panel sets (one each side) — calculation MUST double panel quantity
- Tie rods through the wall connecting both sides
- Cone spacers to maintain wall thickness (15, 20, 25, 30cm)
- This applies to ALL systems: Rasto, Takko, Manto, Robusto, Platinum

#### Tie Rods & Spacing
- **Standard tie rods**: Dregarabolti D20 (20mm), D15 (15mm) — stock in 01-MÓT-AH21
- Spacing depends on concrete pressure:
  - Normal walls (≤3m high, 40 kN/m²): ~60cm H × 60cm V
  - Tall walls (>3m, higher pressure): ~45cm × 50cm
  - Manto high-pressure: ~50cm × 50cm
- **Rule**: ~3 tie rods per m² of wall face
- **Per tie rod**: 1 rod + 2 wing nuts + 2 cones + 2 washers
- **Per Rasto panel 90×300**: ~5 tie rods (grid at 60cm)
- **Per Manto panel 90×330**: ~6 tie rods (taller panel)

#### Aligning Struts (Skástífur / Push-Pull Props)
- Ref: https://products.huennebeck.com/systems/wall-formwork/aligning-struts
- Stock: Takko Skástífur 106–131cm, 148–260cm
- Angled at ~30° from wall, spacing ~1.2m along length
- One per panel width minimum, anchor to ground slab

#### Support Frames
- Ref: https://products.huennebeck.com/systems/wall-formwork/support-frames
- Triangular bracing for free-standing walls (no slab to anchor struts to)
- One per panel width, both sides

#### General Formwork Accessories (01-MÓT-AH21, 47 items)
- Dregarabolti D20 (tie rods), Sökkulskór (base shoes), Innveggjaskór (inner wall shoes)
- Kantstiflar (edge strips), Veggafestingar (wall fixings)
- Kranakrókar (crane hooks), Fu-Strekkjari f/Girði (rack tensioners)
- Fylgihlutagrindar (accessory crates, multiple sizes)

### Slab Formwork — TOPEC & Alufort (Hünnebeck)

**TOPEC System**: Drop-head formwork for concrete slabs
- Ref: https://products.huennebeck.com/systems/slab-formwork/topec
- Related systems: TOPUP (https://products.huennebeck.com/systems/slab-formwork/topup)
- Product docs:
  - TOP START: https://products.huennebeck.com/fileadmin/redakteur/bilder/produkte/slab_formwork/TOPEC/EN_TOP_START_product_information.pdf
  - Wall Flange: https://products.huennebeck.com/fileadmin/redakteur/bilder/produkte/slab_formwork/TOPEC/EN_TOPEC_Wall_Flange_product_information.pdf
  - Racing Frame: https://products.huennebeck.com/fileadmin/redakteur/bilder/produkte/slab_formwork/TOPEC/EN_racing_Frame_product_brochure.pdf
  - Universal Prop: https://products.huennebeck.com/fileadmin/redakteur/bilder/produkte/slab_formwork/TOPEC/EN_Universal_prop_product_brochure.pdf
- Assembly: Props → Primary HT-20 beams → Secondary beams → TOPEC panels → Pour
- Drop-heads: Allow early stripping while props remain supporting slab

**Alufort** (01-MÓT-LM02, 5 panels + 01-MÓT-LM22, 14 accessories):
- Aluminum slab formwork panels: 37.5×150, 37.5×75, 75×150
- Drop-Head Quick Attack system (Hausar HG)
- Alufort Dregarar (beams): L:150cm, L:225cm × H:19.5cm
- Galvanized panel racks for transport

**Panel faces**: Plywood (standard for BYKO) or Ecoply (newer, reusable)
- Ecoply ref: https://products.huennebeck.com/systems/formwork-accessories/ecoply

### Shoring Systems (Hünnebeck)
- **ST-60**: Heavy-duty shoring tower — modular frames for high loads
  - Ref: https://products.huennebeck.com/systems/shoring-systems/st-60
- **ID-15** (01-MÓT-LM81, 9 items): Modular steel shoring
  - Ref: https://products.huennebeck.com/systems/shoring-systems/id-15-new
  - Stock: ID-Rammar 133, ID-Endarammar, Kryssingjar (crosses), Haus (head), Styttur (jacks)
  - Has dedicated storage rack (01-MÓT-LM81-009)

### Safety Systems
- **Protecto G2**: Edge protection — https://products.huennebeck.com/systems/safety-systems/protecto-g2
  - Post + rail system, clamps to slab edges, EN 13374
- **Miniguard** (01-BAT-VE01, 5 items): Lightweight barriers
  - Standard 1.5M, Terminal Begin/End 1.5M

### Other Equipment
- **Debris chutes** (Ruslarenna, 01-BAT-RU01): Chutes + tops + fixings
- **Ladders** (01-PAL-ST10/11/14/50): 3×10 step, 2×10 step, 2×14 step, 6-step alu stairs
- **Loading equipment** (01-LRO-*): Stackers (230V), rollers, tables for window/floor unloading
- **BYKO BOX containers** (01-GAM-VI10): Storage containers

## Fastener/Clamp Rules by System & Generation

### Rasto (G1) — Quick Clamps (Schnellspanner)
- Panel-to-panel: 2× quick clamps per vertical joint (top + bottom)
- Corner connections: 2× clamps per corner
- Tie rod at every grid intersection (~60cm spacing)
- Strut connection: 1× bracket per strut
- **Per 90×300 panel**: 2 clamps + ~5 tie rods + 1 strut bracket = 8 fastening points

### Rasto G2 — Improved Quick-Release
- Same layout as G1 but larger engagement area = fewer clamps
- 2× G2 clamps per joint (top + bottom) — more reliable locking

### Takko — Quick Clamps
- Shorter panels (120cm height), same clamping as Rasto
- 2× clamps per joint, fewer tie rows (2 rows vs 5 for Rasto 300cm)
- **Per 90×120 panel**: 2 clamps + ~2 tie rods + 1 strut bracket = 5 points

### Manto / Manto G3 — BFD Clamps (Butterfly Fastener)
- Panel-to-panel: 2× BFD per joint (standard panels ≤2.0m wide)
- 3× BFD for panels > 2.0m tall (330cm needs 3)
- Corner clamps: Specialized Manto corner clamp system
- Tie rods: DW20 (20mm) for Manto — higher load than Rasto D15
- **Per 90×330 panel**: 3 BFD clamps + ~6 tie rods + 1 strut = 10 points

### Robusto — Heavy-Duty BFD
- Same BFD clamp system as Manto but reinforced
- Fleygur (wedges) for tie rod connections — unique to Robusto
- Dedicated Dregarafesting (tie rod bracket) system

### Summary Table: Fasteners per Standard Panel
| System | Panel Size | Clamps | Tie Rods | Struts | Total Points |
|---|---|---|---|---|---|
| Rasto | 90×300 | 2 quick | ~5 | 1 | 8 |
| Rasto G2 | 90×300 | 2 G2 | ~5 | 1 | 8 |
| Takko | 90×120 | 2 quick | ~2 | 1 | 5 |
| Manto | 90×330 | 3 BFD | ~6 | 1 | 10 |
| Manto G3 | 90×330 | 3 BFD | ~6 | 1 | 10 |
| Robusto | 90×300 | 2 BFD | ~5 | 1 | 8 |

## Concrete Pressure Calculation
- Fresh concrete: P = γ × h × C
  - γ = 25 kN/m³ (concrete unit weight)
  - h = fluid head height (max = pour height if rate < 1m/hr)
  - C = coefficient for pour rate + temperature
- **Max pressures by system**:
  - Rasto: 40 kN/m² (4m fluid head)
  - Takko: 40 kN/m² (lighter system)
  - Manto: 80 kN/m² (crane-set, heavy-duty)
  - Robusto: 60 kN/m² (intermediate)
  - Platinum: 80+ kN/m² (premium)
- Tie spacing rule: actual stress = P × tributary area per rod ≤ rod capacity

## Dimensional Standards
| Component | Standard Size | Tolerance |
|---|---|---|
| Wall thickness | 15, 20, 25, 30 cm | ±5mm |
| Slab thickness | 15, 20, 25, 30 cm | ±5mm |
| Prop grid (slab) | 1.0–1.5m | Per load calc |
| Scaffold bay length | 2.57m (Layher) / 1.8m (board) | Fixed |
| Scaffold bay width | 0.73m (standard) | Fixed |
| Fence panel | 3500×2000mm | ±10mm |
| Tie rod spacing | 450–600mm H&V | Per design |
| Rasto panel heights | 150cm, 300cm | Fixed |
| Takko panel height | 120cm | Fixed |
| Manto panel height | 120cm, 330cm | Fixed |
| Robusto panel height | 300cm | Fixed |
| HT-20 beam depth | 200mm (H=20) | Fixed |
| HT-20 beam width | 80mm | Fixed |
| Prop outer tube OD | ~60mm | ±1mm |
| Prop inner tube OD | ~48mm | ±1mm |

## 3D Visualization Standards for LániCAD

### Tube/Pipe Rendering
- Standard scaffold tube: 48.3mm OD → radius 0.024m
- Thin braces/rails: ~32mm OD → radius 0.016m
- Fence tube frame: ~42mm OD → radius 0.021m
- Prop outer: 60mm OD → radius 0.030m
- Prop inner: 48mm OD → radius 0.024m
- Use `<cylinderGeometry>` with quaternion rotation for arbitrary orientation
- Metallic: metalness 0.6–0.7, roughness 0.3

### Color Coding
| Element | Color | Notes |
|---|---|---|
| Steel tubes | #777–#888 | Standard scaffold/formwork |
| Aluminum tubes | #aaa–#bbb | Rolling scaffold, Alufort |
| Guardrails | #cc0000 | Red for safety |
| Platform/deck | #f5c800 | Brand yellow |
| Concrete/base | #999–#bbb | Stones, slab |
| Ground | #e0e0e0 | Floor grid |
| Rasto panels | #c06030 | Orange-brown (plywood/steel) |
| Manto panels | #4a6fa5 | Blue-grey steel |
| Takko panels | #d4a030 | Yellow-brown |
| Robusto panels | #3a5a3a | Dark green |
| TOPEC panels | #7a8a6a | Green-grey aluminum |
| Platinum panels | #c0c0c0 | Silver premium |
| Prop outer tube | #888 | Dark steel |
| Prop inner tube | #aaa | Light steel |
| Plywood face | #c8a870 | Wood color |
| Fence wire | #999 | Galvanized steel |
| Tie rods | #444 | Dark steel threads |
| HT-20 beams | #c8a060 | Timber I-beam |

### Formwork Assembly Visualization
- ALWAYS show BOTH sides with wall-thickness gap
- Tie rods visible through the gap with cone spacers
- Struts (Skástífur) at ~30° angle from wall, both faces
- Panel edges outlined in dark (#333)
- Transparent concrete preview between panels (opacity 0.15)

### Fence Mesh Rendering
- Horizontal wire spacing: ~50mm
- Vertical wire spacing: ~200mm
- Individual thin cylinders for each wire (not wireframe plane)
- Anti-climb return bend at top edge
