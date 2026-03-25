# Component Conventions

Use these patterns for consistency across the codebase.

## File Structure Pattern

Each scene follows this structure:
```
scene-name/
├── index.tsx           # Main scene component
├── interface.ts        # TypeScript interfaces
├── configuration.ts    # Config constants
├── products.ts         # Product definitions (if applicable)
└── calculator.ts       # Calculation logic (if applicable)
```

## Component Template

```tsx
import React from "react";
import { ComponentName } from "@byko/component-package";
import type { YourInterface } from "./interface";
import { StyledWrapper } from "./styles";

interface ComponentProps {
  // Props definition
}

export const YourComponent = ({ prop1, prop2 }: ComponentProps): JSX.Element => {
  // Component logic
  
  return (
    <StyledWrapper>
      {/* JSX */}
    </StyledWrapper>
  );
};
```

## Styled Components Pattern

Keep styles in `styles.ts`:

```tsx
import styled from "styled-components";
import { theme } from "@byko/lib-styles";

export const Container = styled.div`
  display: flex;
  padding: ${theme.spacing.medium};
  
  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;
```

## State Management Pattern

For scene-level state, use Recoil:

```tsx
// store/some-state.ts
import { atom } from "recoil";

export const someState = atom<number>({
  key: "someState",
  default: 0,
});

// In component
import { useRecoilState } from "recoil";
import { someState } from "./store/some-state";

const [value, setValue] = useRecoilState(someState);
```

## Props Interface Pattern

```tsx
// interface.ts
export interface SceneProps {
  id?: string;
  className?: string;
}

export interface ProductConfig {
  name: string;
  price: number;
  sku: string;
}
```

## Existing Component Reference

When building new components, reference these for consistency:

### Product Display
- **File**: `src/scenes/shared/product-line.tsx`
- **Use for**: Individual product row display pattern

### Product Lists
- **File**: `src/scenes/shared/product-list.tsx`
- **Use for**: Collection of products rendering pattern

### Scene Structure
- **File**: `src/scenes/pallur/index.ts` or `src/scenes/girding/index.tsx`
- **Use for**: Scene organization and export pattern

### Calculator Logic
- **File**: `src/scenes/pallur/calculator.ts`
- **Use for**: Calculation logic separation pattern

## Import Order

1. React imports
2. External package imports (@byko/*)
3. Internal imports (relative)
4. Type imports (with `type` keyword)
5. Styles

```tsx
import React, { useMemo } from "react";
import { Button } from "@byko/component-buttons";
import { PSmall } from "@byko/component-typography";
import { calculateTotal } from "./calculator";
import type { ProductConfig } from "./interface";
import { Container, Wrapper } from "./styles";
```
