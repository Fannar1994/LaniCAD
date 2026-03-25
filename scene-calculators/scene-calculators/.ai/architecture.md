# Architecture Overview

## Stack
- **Framework**: React 18.3.1 + Next.js 15.5.6
- **Language**: TypeScript
- **Styling**: styled-components
- **State Management**: Recoil (@byko/lib-recoil)
- **Data Fetching**: react-query 3.39.1
- **Build Tool**: Webpack
- **Package Manager**: Monorepo with workspace packages

## Project Structure
```
src/
├── calculator.tsx          # Main calculator component
├── top-banner.tsx          # Shared banner component
├── scenes/                 # Feature-based organization
│   ├── girding/           # Fence calculator scene
│   ├── pallur/            # Deck calculator scene
│   └── shared/            # Shared scene components
│       ├── product-line.tsx
│       ├── product-list.tsx
│       └── store/         # Recoil state
```

## Internal Dependencies (@byko/* packages)
- **Components**: buttons, cards, inputs, selectors, typography, quantity-input
- **Hooks**: hooks-cart
- **Libraries**: api-price, api-products, icons, utils, styles
- **Core**: lib-core, lib-recoil, lib-analytics

## Key Patterns
1. **Scene-based architecture**: Features organized as "scenes" (girding, pallur)
2. **Workspace packages**: Heavy use of internal @byko/* packages for reusability
3. **Shared components**: Common UI in `scenes/shared/`
4. **Type safety**: Full TypeScript with interface.ts files per feature
5. **Styled-components**: All styling via styled-components (no CSS files)

## Calculator Types
- `girding` - Fence/fencing calculator
- `pallur` - Deck/patio calculator

Both calculators share similar structure but have distinct product configurations.
