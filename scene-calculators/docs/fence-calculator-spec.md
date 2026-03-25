# Mobile Fence Calculator - Specification Document

**Status**: 🔴 Draft - Needs completion  
**Owner**: [Your Name]  
**Business Contact**: _______________  
**Last Updated**: November 19, 2025

---

## 1. Overview

### Purpose
Create a web-based calculator that helps customers estimate materials and costs for installing a mobile/temporary fence.

### User Story
> "As a customer, I want to input my fence dimensions and material preferences, so I can get an accurate list of materials and total cost before purchasing."

---

## 2. User Interface Requirements

### Input Fields

#### 2.1 Fence Dimensions
- **Fence Length** (m)
  - Input type: Number
  - Min: 1m
  - Max: 100m (?)
  - Default: 10m
  - Validation: Must be positive number
  - Help text: "Total length of fence to be installed"

- **Fence Height** (m)
  - Input type: Dropdown/Radio buttons
  - Options:
    - [ ] 1.0m - "Lág girðing"
    - [ ] 1.2m - "Meðal hæð"
    - [ ] 1.5m - "Staðlað"
    - [ ] 1.8m - "Há girðing"
    - [ ] 2.1m - "Mjög há"
  - Default: 1.5m
  - Help text: "Height from ground to top of fence"

#### 2.2 Material Selection
- **Fence Material**
  - Input type: Dropdown with images
  - Options:
    - [ ] Wood (Tre) - "Wooden fence panels"
      - Product: _______________
      - vnr: _______________
    - [ ] Metal (Málmur) - "Metal fence panels"
      - Product: _______________
      - vnr: _______________
    - [ ] Composite (Samsettur) - "Composite material"
      - Product: _______________
      - vnr: _______________
  - Default: Wood
  - Help text: "Choose fence panel material"

- **Post Material**
  - Input type: Dropdown
  - Options:
    - [ ] Wood posts
    - [ ] Metal posts
    - [ ] Concrete posts
  - Default: Matches fence material
  - Note: Does this depend on fence material?

#### 2.3 Gate Options
- **Include Gate?**
  - Input type: Checkbox
  - Default: Unchecked
  - Label: "Bæta við hliði"

- **Gate Width** (if gate included)
  - Input type: Dropdown
  - Options:
    - [ ] 1.0m - "Einstaklingar"
    - [ ] 1.2m - "Stendur"
    - [ ] 1.5m - "Bílar (einn)"
  - Default: 1.2m
  - Conditional: Only show if "Include Gate" is checked

#### 2.4 Foundation Options
- **Include Foundation Materials?**
  - Input type: Checkbox
  - Default: Unchecked
  - Label: "Reikna með efni í undirstöður"
  - Help text: "Includes concrete and installation materials"

- **Soil Type** (if foundation included)
  - Input type: Dropdown
  - Options:
    - [ ] Firm soil - "Traust jarðvegur"
    - [ ] Loose soil - "Laus jarðvegur"
    - [ ] Sandy soil - "Sandur"
  - Default: Firm soil
  - Note: Affects concrete quantity

---

## 3. Business Logic & Calculations

### 3.1 Post Calculation

**Question for domain expert**: How far apart should posts be?

**Current assumption**: _____ meters between posts

**Formula**:
```
Number of posts = ceil(fence_length / post_spacing) + 1
Minimum posts = 2
```

**Material-specific spacing**:
| Material | Post Spacing | Reasoning |
|----------|--------------|-----------|
| Wood | _____ m | [Why?] |
| Metal | _____ m | [Why?] |
| Composite | _____ m | [Why?] |

**Questions**:
- [ ] Do corners require extra posts?
- [ ] Do gates affect post count? (gate posts are stronger?)
- [ ] Are end posts different from intermediate posts?

---

### 3.2 Panel Calculation

**Question for domain expert**: How are panels sized?

**Current assumption**: Panels fit between posts

**Formula**:
```
Number of panels = number_of_posts - 1
If gate: number_of_panels = number_of_posts - 2 (gate replaces one panel)
```

**Panel height matching**:
- User selects 1.8m height → Product _____ (Panel 1.8m)
- User selects 1.5m height → Product _____ (Panel 1.5m)

**Questions**:
- [ ] Are panels sold in standard lengths?
- [ ] Can panels be cut to custom lengths?
- [ ] Do different heights use different panel products?

---

### 3.3 Hardware Calculation

#### Screws/Fasteners
**Question**: How many fasteners per post-panel connection?

**Current assumption**: _____ screws per connection

**Formula**:
```
connections = number_of_panels * 2 (each panel connects to 2 posts)
screws_needed = connections * screws_per_connection
packages = ceil(screws_needed / screws_per_package)
```

**Material-specific screws**:
| Fence Material | Screw Type | Product ID | Qty per Package |
|----------------|------------|------------|-----------------|
| Wood | Wood screws | _____ | _____ |
| Metal | Metal screws | _____ | _____ |
| Composite | Special screws | _____ | _____ |

#### Brackets/Connectors
**Question**: Are brackets needed for post-panel connections?

**Formula** (if applicable):
```
brackets = number_of_panels * 2
```

**Product**: _______________

#### Post Caps
**Question**: Does each post need a cap?

**Formula** (if applicable):
```
caps = number_of_posts
```

**Product**: _______________

---

### 3.4 Gate Calculation

**Gate Components** (when gate is included):
- [ ] Gate frame - Product: _____
- [ ] Gate panel - Product: _____
- [ ] Gate hinges - Product: _____ (Qty: _____)
- [ ] Gate latch - Product: _____
- [ ] Gate posts (stronger?) - Product: _____

**Questions**:
- [ ] Are gate posts different from regular posts?
- [ ] How many hinges per gate?
- [ ] Do gates come pre-assembled or as kit?

---

### 3.5 Foundation Calculation

**When foundation option is selected**:

#### Concrete per Post
**Question**: How much concrete per post hole?

**Formula** (example - verify with expert):
```
hole_diameter = 0.3m (30cm)
hole_depth = 0.6m (60cm for firm soil, 0.8m for loose)
volume_per_hole = π * (hole_diameter/2)² * hole_depth
concrete_per_post = volume_per_hole * 1.1 (10% overage)
total_concrete = concrete_per_post * number_of_posts
```

**Soil-specific depth**:
| Soil Type | Hole Depth | Reasoning |
|-----------|------------|-----------|
| Firm | _____ m | [Why?] |
| Loose | _____ m | [Why?] |
| Sandy | _____ m | [Why?] |

**Products**:
- Concrete mix - Product: _____ (Unit: _____ kg/m³)
- Gravel (drainage) - Product: _____ (kg per post)

#### Installation Materials
- [ ] Level checking tool? - Product: _____
- [ ] Post supports (temporary) - Product: _____

---

## 4. Product Mapping

### 4.1 Fence Posts

| Height | Material | Product ID | vnr | Description |
|--------|----------|------------|-----|-------------|
| 1.0m | Wood | _____ | _____ | _____ |
| 1.2m | Wood | _____ | _____ | _____ |
| 1.5m | Wood | _____ | _____ | _____ |
| 1.8m | Wood | _____ | _____ | _____ |
| 2.1m | Wood | _____ | _____ | _____ |
| 1.0m | Metal | _____ | _____ | _____ |
| ... | ... | ... | ... | ... |

### 4.2 Fence Panels

| Height | Material | Product ID | vnr | Length | Description |
|--------|----------|------------|-----|--------|-------------|
| 1.5m | Wood | _____ | _____ | _____ m | _____ |
| 1.8m | Wood | _____ | _____ | _____ m | _____ |
| ... | ... | ... | ... | ... | ... |

### 4.3 Gates

| Width | Height | Material | Product ID | vnr | Description |
|-------|--------|----------|------------|-----|-------------|
| 1.0m | 1.5m | Wood | _____ | _____ | _____ |
| 1.2m | 1.5m | Wood | _____ | _____ | _____ |
| ... | ... | ... | ... | ... | ... |

### 4.4 Hardware

| Item | Product ID | vnr | Unit | Description |
|------|------------|-----|------|-------------|
| Wood screws | _____ | _____ | Box of 200 | _____ |
| Metal screws | _____ | _____ | Box of 100 | _____ |
| Post caps | _____ | _____ | Each | _____ |
| Brackets | _____ | _____ | Pack of 10 | _____ |
| Gate hinges | _____ | _____ | Pair | _____ |
| Gate latch | _____ | _____ | Each | _____ |

### 4.5 Foundation

| Item | Product ID | vnr | Unit | Description |
|------|------------|-----|------|-------------|
| Concrete mix | _____ | _____ | 25kg bag | _____ |
| Gravel | _____ | _____ | kg | _____ |

---

## 5. Validation Rules

### Input Validation
- Fence length: 1-100m (confirm max)
- Gate width: Cannot exceed fence length
- Negative numbers: Not allowed
- Decimal precision: 2 decimal places max

### Business Rules
- Minimum 2 posts required
- Gate requires minimum fence length of (gate_width + 2 × post_spacing)
- Maximum fence length: _____ m (shipping constraint?)

### Error Messages
| Scenario | Error Message |
|----------|---------------|
| Length too short | "Fence must be at least 1 meter long" |
| Gate too wide | "Gate width cannot exceed fence length" |
| Negative input | "Please enter a positive number" |

---

## 6. Output Display

### Results Section
After user clicks "Reikna" (Calculate):

1. **Summary Card**
   - Total length: X meters
   - Total posts: Y
   - Total panels: Z
   - Includes gate: Yes/No
   
2. **Materials List Table**
   | Product | Quantity | Unit Price | Total |
   |---------|----------|------------|-------|
   | Fence post 1.8m | 5 | 1.499 kr | 7.495 kr |
   | Fence panel 1.8m | 4 | 3.999 kr | 15.996 kr |
   | ... | ... | ... | ... |
   | **Total** | | | **XX.XXX kr** |

3. **Add to Cart Button**
   - Adds all items to cart with correct quantities

---

## 7. Test Cases

### Test Case 1: Simple Fence (No Gate, No Foundation)
**Input**:
- Length: 10m
- Height: 1.8m
- Material: Wood
- Gate: No
- Foundation: No

**Expected Output** (fill in after calculations defined):
- Posts: _____ (formula: _____)
- Panels: _____ (formula: _____)
- Screws: _____ boxes (formula: _____)
- Caps: _____ (formula: _____)
- **Total**: _____ kr

---

### Test Case 2: Fence with Gate
**Input**:
- Length: 15m
- Height: 1.5m
- Material: Metal
- Gate: Yes (1.2m)
- Foundation: No

**Expected Output**:
- Posts: _____
- Panels: _____
- Gate: 1
- Gate hardware: _____
- **Total**: _____ kr

---

### Test Case 3: Complete Installation (With Foundation)
**Input**:
- Length: 20m
- Height: 1.8m
- Material: Composite
- Gate: Yes (1.5m)
- Foundation: Yes (Firm soil)

**Expected Output**:
- Posts: _____
- Panels: _____
- Gate: 1
- Concrete: _____ bags
- Gravel: _____ kg
- **Total**: _____ kr

---

### Edge Cases
- [ ] Test: 1m fence (minimum)
- [ ] Test: 100m fence (maximum?)
- [ ] Test: Gate wider than fence (should error)
- [ ] Test: Very short fence with gate

---

## 8. Questions for Domain Expert

### Urgent Questions
1. What is the standard post spacing for mobile fences?
2. Are panels standard length or custom cut?
3. Which products in BYKO catalog are for mobile fences?
4. Do we sell complete fence kits or individual components?
5. What's included in a "mobile fence" vs permanent fence?

### Calculation Questions
6. How much concrete per post?
7. How many screws per post-panel connection?
8. Are gate posts different from regular posts?
9. Do corners need special treatment?
10. What's the safety factor for material overage?

### Product Questions
11. What are the available fence heights?
12. What materials do we stock?
13. Are there package deals or bundles?
14. Do we offer installation services?

---

## 9. Research Notes

### Competitive Analysis
Check these calculators for reference:
- [ ] [Competitor 1] - URL: _____
- [ ] [Competitor 2] - URL: _____

**Features they have**:
- Visual fence preview
- Material comparison
- Installation guide
- Delivery calculator

**Features we should include**:
- [ ] _____
- [ ] _____

---

## 10. Next Steps

- [ ] Schedule meeting with fence product expert
- [ ] Get complete product list from warehouse
- [ ] Verify calculation formulas with engineer
- [ ] Test sample calculations manually
- [ ] Get pricing data (or Insphire integration)
- [ ] Create mockup/wireframe of UI
- [ ] Review with CTO/senior developer

---

**Meeting Notes** (add after discussions):

### Meeting 1: Product Expert - [Date]
Attendees: _____
Key findings:
- 
- 
- 

### Meeting 2: Engineering Review - [Date]
Attendees: _____
Decisions made:
-
-
-

---

**Remember**: This is a living document. Update it as you learn more!
