# Common AI Mistakes to Avoid

⚠️ **Read this at the start of every session to avoid repetitive errors**

## 1. Package Imports
❌ **WRONG**: Importing from external packages not in dependencies  
✅ **RIGHT**: Use `@byko/*` internal packages or listed peer dependencies

```tsx
// ❌ Don't do this
import { Button } from 'antd';

// ✅ Do this
import { Button } from '@byko/component-buttons';
```

## 2. Styling
❌ **WRONG**: Creating CSS files or inline styles  
✅ **RIGHT**: Use styled-components exclusively

```tsx
// ❌ Don't do this
<div style={{ color: 'red' }}>Text</div>

// ✅ Do this
const RedText = styled.div`
  color: red;
`;
```

## 3. State Management
❌ **WRONG**: Using useState for shared state  
✅ **RIGHT**: Use Recoil atoms/selectors for cross-component state

```tsx
// ❌ Don't do this for shared state
const [totalPrice, setTotalPrice] = useState(0);

// ✅ Do this
import { useRecoilState } from 'recoil';
import { totalPriceState } from './store/total-price-state';
```

## 4. File Organization
❌ **WRONG**: Creating components outside of scenes structure  
✅ **RIGHT**: Follow scene-based organization (girding/, pallur/, shared/)

## 5. Type Definitions
❌ **WRONG**: Using `any` type  
✅ **RIGHT**: Define proper interfaces in `interface.ts` files

```tsx
// ❌ Don't do this
const handleChange = (value: any) => {};

// ✅ Do this
interface HandleChangeProps {
  value: string;
  id: number;
}
const handleChange = ({ value, id }: HandleChangeProps) => {};
```

## 6. Component Structure
❌ **WRONG**: Mixing logic and presentation in single files  
✅ **RIGHT**: Separate concerns (calculator.ts, configuration.ts, component.tsx)

## 7. Webpack Configuration
❌ **WRONG**: Modifying webpack config without checking existing setup  
✅ **RIGHT**: This project has a custom webpack.config.js - review before changes

## 8. Data Fetching
❌ **WRONG**: Using fetch() directly  
✅ **RIGHT**: Use react-query hooks + @byko/lib-api-* packages

## 9. Naming Conventions
❌ **WRONG**: Inconsistent naming (camelCase vs kebab-case)  
✅ **RIGHT**: 
- Files: kebab-case (product-line.tsx)
- Components: PascalCase (ProductLine)
- Variables/functions: camelCase (totalPrice)

## 10. Monorepo Awareness
❌ **WRONG**: Trying to install packages with npm/yarn directly  
✅ **RIGHT**: Recognize this is part of a monorepo - coordinate with workspace root
