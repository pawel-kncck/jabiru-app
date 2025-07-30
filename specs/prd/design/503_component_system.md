# Component Design System

## Component Hierarchy

### Atomic Components

#### Buttons
- **PrimaryButton**: Main CTAs with brand color
- **SecondaryButton**: Secondary actions with outline
- **GhostButton**: Tertiary actions with minimal style
- **IconButton**: Icon-only actions with tooltips

#### Inputs
- **TextField**: Single-line text input with validation
- **TextArea**: Multi-line text input
- **Select**: Dropdown selection with search
- **DatePicker**: Date selection with calendar
- **FileUpload**: Drag-and-drop file input

#### Feedback
- **Toast**: Temporary notifications
- **Alert**: Inline messages
- **Progress**: Loading and progress indicators
- **Skeleton**: Content loading placeholders

### Molecule Components

#### Forms
- **LoginForm**: Authentication form with validation
- **ProjectForm**: Project creation/editing form
- **DataSourceForm**: Data connection configuration

#### Cards
- **ProjectCard**: Project display in grid view
- **ChartCard**: Chart preview with actions
- **InsightCard**: AI-generated insight display

#### Navigation
- **Sidebar**: Main navigation with collapsible sections
- **Breadcrumbs**: Hierarchical navigation
- **TabBar**: Section navigation within pages

### Organism Components

#### Layouts
- **AppShell**: Main application layout with sidebar
- **CanvasLayout**: Three-panel editor layout
- **DashboardGrid**: Responsive grid for cards

#### Complex UI
- **DataTable**: Advanced table with sorting/filtering
- **ChartBuilder**: Interactive chart configuration
- **CanvasEditor**: Main canvas editing interface

## Component Implementation Examples

### Button Component

```typescript
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends MantineButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', fullWidth, className, ...props }, ref) => {
    const variantStyles = {
      primary: 'tw-shadow-md hover:tw-shadow-lg',
      secondary: '',
      ghost: 'tw-bg-transparent hover:tw-bg-gray-100'
    };

    const variantProps = {
      primary: { variant: 'filled' as const },
      secondary: { variant: 'outline' as const },
      ghost: { variant: 'subtle' as const }
    };

    return (
      <MantineButton
        ref={ref}
        className={twMerge(
          'tw-transition-all tw-duration-200',
          variantStyles[variant],
          fullWidth && 'tw-w-full',
          className
        )}
        {...variantProps[variant]}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### Card Component

```typescript
import { Card as MantineCard, CardProps as MantineCardProps } from '@mantine/core';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends MantineCardProps {
  hoverable?: boolean;
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, noPadding, className, ...props }, ref) => {
    return (
      <MantineCard
        ref={ref}
        className={twMerge(
          'tw-transition-all tw-duration-200',
          hoverable && 'hover:tw-shadow-lg hover:tw-translate-y-[-2px]',
          className
        )}
        padding={noPadding ? 0 : 'md'}
        radius="md"
        withBorder
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
```

### Form Input Component

```typescript
import { TextInput as MantineTextInput, TextInputProps } from '@mantine/core';
import { forwardRef } from 'react';

interface TextFieldProps extends TextInputProps {
  helperText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ helperText, error, ...props }, ref) => {
    return (
      <div className="tw-mb-4">
        <MantineTextInput
          ref={ref}
          error={error}
          {...props}
        />
        {helperText && !error && (
          <p className="tw-text-sm tw-text-gray-500 tw-mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
```

## Component Patterns

### Loading States

```typescript
import { Skeleton } from '@mantine/core';

export const CardSkeleton = () => (
  <Card>
    <Skeleton height={20} width="70%" mb="sm" />
    <Skeleton height={12} mb="xs" />
    <Skeleton height={12} width="90%" />
  </Card>
);

export const TableSkeleton = () => (
  <div className="tw-space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} height={50} />
    ))}
  </div>
);
```

### Empty States

```typescript
import { Text, Stack } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ 
  icon = <IconInbox size={48} />, 
  title, 
  description, 
  action 
}: EmptyStateProps) => (
  <Stack align="center" className="tw-py-12 tw-text-center">
    <div className="tw-text-gray-400">{icon}</div>
    <Text size="lg" fw={500}>{title}</Text>
    {description && (
      <Text size="sm" c="dimmed" className="tw-max-w-md">
        {description}
      </Text>
    )}
    {action && <div className="tw-mt-4">{action}</div>}
  </Stack>
);
```

### Data Display Components

```typescript
import { Table, ScrollArea } from '@mantine/core';

interface DataTableProps<T> {
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={String(col.key)}>{col.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item, index) => (
            <Table.Tr key={index}>
              {columns.map((col) => (
                <Table.Td key={String(col.key)}>
                  {col.render 
                    ? col.render(item[col.key], item)
                    : String(item[col.key])
                  }
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
```

## Component Composition

### Modal Patterns

```typescript
import { Modal, ModalProps } from '@mantine/core';

interface BaseModalProps extends ModalProps {
  title: string;
}

export const BaseModal = ({ children, ...props }: BaseModalProps) => (
  <Modal
    {...props}
    classNames={{
      content: 'tw-rounded-lg',
      header: 'tw-border-b tw-border-gray-200'
    }}
  >
    {children}
  </Modal>
);
```

### Form Patterns

```typescript
import { useForm } from '@mantine/form';
import { Stack } from '@mantine/core';

export const useProjectForm = () => {
  return useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => 
        value.length < 3 ? 'Name must be at least 3 characters' : null,
    },
  });
};

export const ProjectFormFields = ({ form }: { form: ReturnType<typeof useProjectForm> }) => (
  <Stack>
    <TextField
      label="Project Name"
      placeholder="Enter project name"
      required
      {...form.getInputProps('name')}
    />
    <TextArea
      label="Description"
      placeholder="Describe your project"
      minRows={3}
      {...form.getInputProps('description')}
    />
  </Stack>
);
```

## Component Guidelines

### Naming Conventions
- Components: PascalCase (e.g., `ProjectCard`)
- Props interfaces: ComponentNameProps (e.g., `ProjectCardProps`)
- Hooks: camelCase with 'use' prefix (e.g., `useProjectData`)

### File Organization
```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── TextField/
├── molecules/
│   ├── ProjectCard/
│   └── DataTable/
└── organisms/
    ├── AppShell/
    └── CanvasEditor/
```

### Component Props
- Always extend Mantine component props when wrapping
- Use TypeScript for all prop definitions
- Provide sensible defaults
- Document complex props with JSDoc comments

### Styling Guidelines
- Use Mantine theme tokens for consistency
- Apply Tailwind utilities for layout and spacing
- Avoid inline styles
- Use CSS modules for complex component-specific styles