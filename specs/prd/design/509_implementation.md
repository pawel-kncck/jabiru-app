# Implementation Guidelines

## Component Development Workflow

### Standard Component Template

```typescript
import { forwardRef } from 'react';
import { Box, BoxProps } from '@mantine/core';
import { twMerge } from 'tailwind-merge';

interface ComponentProps extends BoxProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'tw-p-2 tw-text-sm',
      md: 'tw-p-4 tw-text-base',
      lg: 'tw-p-6 tw-text-lg'
    };
    
    const variantClasses = {
      primary: 'tw-bg-indigo-50 tw-border-indigo-200',
      secondary: 'tw-bg-gray-50 tw-border-gray-200'
    };
    
    return (
      <Box
        ref={ref}
        className={twMerge(
          'tw-rounded-lg tw-border tw-transition-all',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';
```

### Component Development Steps

1. **Create Component Structure**
   ```
   components/
   └── Button/
       ├── Button.tsx        # Component implementation
       ├── Button.stories.tsx # Storybook stories
       ├── Button.test.tsx   # Unit tests
       ├── Button.module.css # Component-specific styles (if needed)
       └── index.ts          # Export file
   ```

2. **Implement with TypeScript**
   - Define prop interfaces
   - Add JSDoc comments for complex props
   - Export types alongside component

3. **Add Storybook Stories**
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react';
   import { Button } from './Button';

   const meta: Meta<typeof Button> = {
     title: 'Components/Button',
     component: Button,
     parameters: {
       layout: 'centered',
     },
     tags: ['autodocs'],
   };

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Primary: Story = {
     args: {
       variant: 'primary',
       children: 'Button',
     },
   };
   ```

4. **Write Tests**
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { Button } from './Button';

   describe('Button', () => {
     it('renders with text', () => {
       render(<Button>Click me</Button>);
       expect(screen.getByText('Click me')).toBeInTheDocument();
     });
   });
   ```

## Design Tokens and Theming

### Centralized Design Tokens

```typescript
// tokens/index.ts
export const tokens = {
  colors: {
    // Semantic colors
    primary: 'var(--mantine-color-indigo-6)',
    secondary: 'var(--mantine-color-gray-6)',
    success: 'var(--mantine-color-green-6)',
    warning: 'var(--mantine-color-yellow-6)',
    error: 'var(--mantine-color-red-6)',
    
    // UI colors
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e5e7eb',
    textPrimary: '#111827',
    textSecondary: '#6b7280'
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace'
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem'
    }
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};
```

### Theme Provider Setup

```typescript
// theme/provider.tsx
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from './mantine-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme}>
      {children}
    </MantineProvider>
  );
}
```

### CSS Custom Properties

```css
/* global.css */
:root {
  /* Colors */
  --color-primary: #4f46e5;
  --color-primary-light: #6366f1;
  --color-primary-dark: #4338ca;
  
  /* Spacing */
  --spacing-unit: 0.25rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

## Code Quality Standards

### TypeScript Standards

#### Strict Mode Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Naming Conventions
- **Interfaces**: PascalCase (e.g., `UserProfile`)
- **Types**: PascalCase (e.g., `ButtonVariant`)
- **Enums**: PascalCase with singular names (e.g., `UserRole`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Functions**: camelCase (e.g., `getUserData`)
- **React Components**: PascalCase (e.g., `UserCard`)

#### Type Definitions
```typescript
// ✅ Good: Explicit types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ❌ Avoid: Any type
const processData = (data: any) => { /* ... */ };

// ✅ Good: Union types for variants
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// ✅ Good: Generic constraints
function updateEntity<T extends { id: string }>(entity: T): T {
  return { ...entity, updatedAt: new Date() };
}
```

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Composite components
│   └── organisms/       # Complex components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── styles/              # Global styles
└── contexts/            # React contexts
```

#### Component File Structure
- One component per file
- Co-locate types with components
- Separate type definition files for shared types
- Index files for clean exports

```typescript
// components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### Documentation Standards

#### Component Documentation
```typescript
/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'ghost';
  
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  
  /** Whether the button is in a loading state */
  loading?: boolean;
  
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

#### Function Documentation
```typescript
/**
 * Formats a number as currency
 * 
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

## Style Guide Enforcement

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off', // TypeScript handles this
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
  }
};
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

## Development Best Practices

### Component Composition
```typescript
// ✅ Good: Composition over inheritance
export function Card({ header, children, footer }: CardProps) {
  return (
    <div className="card">
      {header && <CardHeader>{header}</CardHeader>}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </div>
  );
}

// ❌ Avoid: Prop drilling
// ✅ Use: Context or component composition
```

### State Management
```typescript
// ✅ Good: Colocate state with usage
function Component() {
  const [localState, setLocalState] = useState();
  // Use localState here
}

// ✅ Good: Extract complex state logic
function useComplexState() {
  const [state, setState] = useState();
  // Complex logic here
  return { state, updateState };
}
```

### Performance Patterns
```typescript
// ✅ Good: Memoize expensive computations
const expensiveValue = useMemo(
  () => computeExpensiveValue(props),
  [props.dependency]
);

// ✅ Good: Debounce user input
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```