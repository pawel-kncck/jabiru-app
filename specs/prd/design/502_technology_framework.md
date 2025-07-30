# Technology Stack & Framework

## Core UI Technologies

### Component Library: Mantine v7.x

**Rationale:**
- Comprehensive component library with 100+ components
- Built-in dark mode support
- Excellent TypeScript support
- Form handling and validation
- Notification system
- Modal and drawer management

### Styling Framework: Tailwind CSS v3.x

**Rationale:**
- Utility-first approach for rapid development
- Excellent performance with PurgeCSS
- Responsive design utilities
- Custom design system support

### Integration Strategy

**Approach:** "Mantine components + Tailwind utilities"

**Benefits:**
- Mantine for complex components (forms, tables, modals)
- Tailwind for layout, spacing, and custom styling
- Best of both worlds approach

## Technical Architecture

### Mantine Theme Configuration

```typescript
export const mantineTheme = {
  primaryColor: 'indigo',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: { fontFamily: 'Inter, sans-serif' },
  
  colors: {
    brand: ['#f0f4ff', '#d9e2ff', '#bac8ff', '#8da2fb', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'],
    success: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
    warning: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
    danger: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
  },
  
  other: {
    transitions: {
      fast: '150ms ease',
      normal: '250ms ease',
      slow: '350ms ease'
    }
  }
};
```

### Tailwind Configuration Extensions

```typescript
export const tailwindExtensions = {
  animation: {
    'slide-in': 'slideIn 0.2s ease-out',
    'fade-in': 'fadeIn 0.3s ease-out',
    'pulse-soft': 'pulseSoft 2s ease-in-out infinite'
  },
  spacing: {
    '18': '4.5rem',
    '88': '22rem',
    '128': '32rem'
  }
};
```

## Component Patterns

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

### Consistent Component Patterns

```typescript
export const componentPatterns = {
  // Mantine for component logic, Tailwind for spacing/layout
  spacing: 'tw-p-4 tw-space-y-4',
  
  // Mantine theme colors, Tailwind for states
  states: 'hover:tw-bg-gray-50 active:tw-bg-gray-100',
  
  // Responsive design with Tailwind
  responsive: 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3',
  
  // Animation with Tailwind utilities
  animation: 'tw-transition-all tw-duration-200 tw-ease-in-out'
};
```

## Example Component Implementations

### Button Component with Mantine + Tailwind

```typescript
import { Button, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export function CreateProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      leftSection={<IconPlus size={16} />}
      className="tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-200"
      size="md"
      radius="md"
    >
      <Text className="tw-font-semibold">Create New Project</Text>
    </Button>
  );
}
```

### Form Field with Integrated Validation

```typescript
import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

export function EmailInput() {
  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <TextInput
      label="Email"
      placeholder="your@email.com"
      className="tw-mb-4"
      {...form.getInputProps('email')}
    />
  );
}
```

## Framework Integration Best Practices

### 1. Component Hierarchy
- Use Mantine components as the base
- Apply Tailwind utilities for custom styling
- Create wrapper components for common patterns

### 2. Styling Priority
```typescript
// ✅ Good: Mantine component with Tailwind utilities
<Button className="tw-mt-4 tw-w-full" color="indigo">
  Submit
</Button>

// ❌ Avoid: Conflicting styles
<Button className="tw-bg-blue-500" color="indigo">
  Submit
</Button>
```

### 3. Responsive Design
```typescript
// Use Tailwind for responsive layouts
<div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
  {items.map(item => (
    <Card key={item.id} className="tw-h-full">
      {/* Mantine Card with Tailwind height utility */}
    </Card>
  ))}
</div>
```

### 4. Theme Consistency
- Use Mantine theme for colors and typography
- Use Tailwind for spacing and layout
- Create custom CSS variables for shared values

## Performance Considerations

### Bundle Size Optimization
```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['@mantine/core', '@mantine/hooks'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mantine': ['@mantine/core', '@mantine/hooks'],
          'vendor': ['react', 'react-dom'],
        },
      },
    },
  },
};
```

### CSS Optimization
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: 'tw-', // Prevent conflicts with Mantine
  theme: {
    extend: {
      // Custom extensions
    },
  },
};
```

## Development Workflow

### 1. Component Development
1. Start with Mantine component
2. Add Tailwind utilities for layout
3. Extract common patterns to reusable components
4. Document props with TypeScript

### 2. Styling Workflow
1. Use Mantine theme for base styles
2. Apply Tailwind for responsive behavior
3. Create utility classes for common patterns
4. Use CSS modules for component-specific styles

### 3. Testing Strategy
- Unit tests for component logic
- Visual regression tests for UI
- Accessibility tests with Mantine's built-in support
- Performance tests for bundle size