# 8. Frontend Architecture

## 8.1. Technology Stack

```yaml
frontend_stack:
  core_language:
    name: TypeScript
    version: '5.x'
    rationale:
      - Type safety for large-scale applications
      - Enhanced IDE support and autocompletion
      - Compile-time error detection
      - Better refactoring capabilities
      - Self-documenting code through types

  framework:
    name: React
    version: '18.x'
    with_typescript: true
    configuration:
      - Strict mode enabled
      - Function components with hooks
      - Concurrent features enabled

  build_tools:
    bundler: Vite
    type_checker: TypeScript compiler
    linter: ESLint with TypeScript parser
    formatter: Prettier

  ui_libraries:
    component_library:
      name: Mantine UI
      version: '7.x'
      typescript_support: Full native TypeScript support
    styling:
      name: Tailwind CSS
      version: '3.x'
      with_typescript: TypeScript configuration for custom plugins

  state_management:
    primary: React Context + useReducer
    async_state: TanStack Query (React Query)
    form_state: React Hook Form with TypeScript

  testing:
    unit_tests: Jest with TypeScript
    component_tests: React Testing Library
    e2e_tests: Playwright with TypeScript
    type_tests: tsd (TypeScript type testing)
```

## 8.2. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 8.3. Type System Architecture

```typescript
// Core type definitions structure
interface TypeArchitecture {
  // Domain models matching backend schemas
  models: {
    user: 'src/types/models/user.ts';
    project: 'src/types/models/project.ts';
    canvas: 'src/types/models/canvas.ts';
    dataSource: 'src/types/models/dataSource.ts';
  };

  // API types for request/response
  api: {
    requests: 'src/types/api/requests.ts';
    responses: 'src/types/api/responses.ts';
    errors: 'src/types/api/errors.ts';
  };

  // UI component prop types
  components: {
    props: 'src/types/components/props.ts';
    events: 'src/types/components/events.ts';
    state: 'src/types/components/state.ts';
  };

  // Utility types
  utilities: {
    helpers: 'src/types/utils/helpers.ts';
    guards: 'src/types/utils/guards.ts';
    branded: 'src/types/utils/branded.ts';
  };
}

// Example of strict typing for API integration
interface APIClient {
  get<T>(url: string, config?: RequestConfig): Promise<APIResponse<T>>;
  post<T, D>(
    url: string,
    data: D,
    config?: RequestConfig
  ): Promise<APIResponse<T>>;
  put<T, D>(
    url: string,
    data: D,
    config?: RequestConfig
  ): Promise<APIResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<APIResponse<T>>;
}

// Type-safe hooks
interface TypedHooks {
  useAuth(): AuthContext;
  useProject(id: ProjectId): ProjectData;
  useCanvas(id: CanvasId): CanvasState;
  useAIGeneration<T extends ChartType>(
    prompt: string,
    data: DataSource
  ): AIGenerationResult<T>;
}
```

## 8.4. Component Architecture with TypeScript

```typescript
// Strict component typing pattern
import { FC, ReactNode } from 'react';
import { MantineSize, MantineColor } from '@mantine/core';

// Base component props with common properties
interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

// Example of typed component with Mantine integration
interface ButtonProps extends BaseComponentProps {
  variant?: 'filled' | 'outline' | 'ghost';
  size?: MantineSize;
  color?: MantineColor;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  color = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  children,
  testId,
}) => {
  // Implementation with full type safety
};

// Typed context pattern
interface AppContextValue {
  user: User | null;
  theme: Theme;
  preferences: UserPreferences;
  actions: {
    updateUser: (user: User) => void;
    updateTheme: (theme: Theme) => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

## 8.5. Type-Safe Data Flow

```yaml
data_flow_typing:
  api_layer:
    - Generated TypeScript types from OpenAPI spec
    - Runtime validation with Zod schemas
    - Type guards for response validation

  state_management:
    - Discriminated unions for state machines
    - Immutable state updates with Immer
    - Type-safe action creators

  component_props:
    - Strict prop types for all components
    - Generic components with type parameters
    - Event handler typing

  form_handling:
    - Typed form schemas with Zod
    - Type-safe form state with React Hook Form
    - Validation error typing

  routing:
    - Typed route parameters
    - Type-safe navigation hooks
    - Route guard typing
```

## 8.6. Code Quality Standards

```yaml
typescript_standards:
  strict_mode:
    - No implicit any
    - Strict null checks
    - Strict function types
    - No unused variables/parameters

  naming_conventions:
    - Interfaces: PascalCase with 'I' prefix optional
    - Types: PascalCase
    - Enums: PascalCase with singular names
    - Constants: UPPER_SNAKE_CASE

  file_organization:
    - One component per file
    - Co-locate types with components
    - Separate type definition files for shared types
    - Index files for clean exports

  documentation:
    - JSDoc comments for public APIs
    - Inline comments for complex logic
    - Type documentation for complex types
    - README files for major features
```

## 8.7. Development Workflow

```yaml
typescript_workflow:
  pre_commit:
    - TypeScript compilation check
    - ESLint with TypeScript rules
    - Prettier formatting
    - Unit test execution

  ci_pipeline:
    - Type checking across entire codebase
    - Strict build with no warnings
    - Bundle size analysis
    - Type coverage reporting

  ide_setup:
    - VS Code with TypeScript extensions
    - Real-time type checking
    - Auto-imports and refactoring
    - Integrated debugging
```