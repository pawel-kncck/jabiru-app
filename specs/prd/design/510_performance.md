# Performance & Optimization

## UI Performance Targets

### Core Web Vitals
```yaml
metrics:
  first_contentful_paint: "< 1.5s"
  time_to_interactive: "< 3.5s"
  cumulative_layout_shift: "< 0.1"
  first_input_delay: "< 100ms"
  largest_contentful_paint: "< 2.5s"
```

### Performance Budget
```javascript
// performance.config.js
export const performanceBudget = {
  javascript: {
    main: 200, // KB
    vendor: 300, // KB
    total: 500, // KB
  },
  css: {
    main: 50, // KB
    vendor: 100, // KB
  },
  images: {
    total: 1000, // KB per page
  },
  fonts: {
    total: 200, // KB
  }
};
```

## Bundle Size Management

### Code Splitting Strategy

#### Route-based Splitting
```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const CanvasEditor = lazy(() => import('./pages/CanvasEditor'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/canvas/:id" element={<CanvasEditor />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-level Splitting
```typescript
// Heavy component lazy loading
const ChartBuilder = lazy(() => import('./components/ChartBuilder'));
const DataTable = lazy(() => import('./components/DataTable'));

// Usage with loading boundary
function AnalyticsView() {
  return (
    <Suspense fallback={<Skeleton height={400} />}>
      <ChartBuilder />
    </Suspense>
  );
}
```

#### Dynamic Imports for Optional Features
```typescript
// Load features on demand
async function loadAdvancedFeatures() {
  const { AdvancedAnalytics } = await import('./features/AdvancedAnalytics');
  return AdvancedAnalytics;
}

// Conditional loading based on user tier
if (user.plan === 'enterprise') {
  const AdvancedAnalytics = await loadAdvancedFeatures();
  // Use advanced features
}
```

### Webpack Configuration for Optimization

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        mantine: {
          test: /[\\/]node_modules[\\/]@mantine[\\/]/,
          name: 'mantine',
          priority: 20,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  
  // Tree shaking for Mantine components
  resolve: {
    alias: {
      '@mantine/core': '@mantine/core/esm',
      '@mantine/hooks': '@mantine/hooks/esm',
    },
  },
};
```

### Bundle Analysis
```json
// package.json scripts
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "bundle-report": "webpack-bundle-analyzer build/stats.json"
  }
}
```

## Rendering Optimization

### Virtual Scrolling for Long Lists
```typescript
import { VirtualList } from '@tanstack/react-virtual';

export function LargeDataList({ items }: { items: DataItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // row height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="tw-h-[600px] tw-overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <DataRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debounced Search Inputs
```typescript
import { useDebouncedValue } from '@mantine/hooks';

export function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebouncedValue(value, 300);
  
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);
  
  return (
    <TextInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search..."
      leftSection={<IconSearch size={16} />}
    />
  );
}
```

### Memoization for Expensive Computations
```typescript
import { useMemo } from 'react';

export function DataAnalytics({ data }: { data: DataPoint[] }) {
  // Expensive calculation memoized
  const statistics = useMemo(() => {
    return {
      total: data.reduce((sum, item) => sum + item.value, 0),
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      max: Math.max(...data.map(item => item.value)),
      min: Math.min(...data.map(item => item.value)),
    };
  }, [data]);
  
  // Expensive filtering memoized
  const filteredData = useMemo(() => {
    return data.filter(item => item.value > statistics.average);
  }, [data, statistics.average]);
  
  return <DataVisualization data={filteredData} stats={statistics} />;
}
```

### Optimistic UI Updates
```typescript
export function useOptimisticUpdate() {
  const [items, setItems] = useState<Item[]>([]);
  const queryClient = useQueryClient();
  
  const updateItem = useMutation({
    mutationFn: async (updatedItem: Item) => {
      return api.updateItem(updatedItem);
    },
    onMutate: async (updatedItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['items']);
      
      // Snapshot previous value
      const previousItems = queryClient.getQueryData(['items']);
      
      // Optimistically update
      queryClient.setQueryData(['items'], (old: Item[]) => 
        old.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      
      return { previousItems };
    },
    onError: (err, updatedItem, context) => {
      // Rollback on error
      queryClient.setQueryData(['items'], context.previousItems);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['items']);
    },
  });
  
  return { items, updateItem };
}
```

## Asset Optimization

### Image Optimization
```typescript
// Image component with lazy loading and responsive sizing
export function OptimizedImage({ 
  src, 
  alt, 
  sizes = '100vw' 
}: ImageProps) {
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`
          ${src}?format=webp&w=400 400w,
          ${src}?format=webp&w=800 800w,
          ${src}?format=webp&w=1200 1200w
        `}
        sizes={sizes}
      />
      <source
        type="image/jpeg"
        srcSet={`
          ${src}?w=400 400w,
          ${src}?w=800 800w,
          ${src}?w=1200 1200w
        `}
        sizes={sizes}
      />
      <img
        src={`${src}?w=800`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="tw-w-full tw-h-auto"
      />
    </picture>
  );
}
```

### Font Loading Strategy
```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" crossorigin>
<link rel="preload" href="/fonts/Inter-Medium.woff2" as="font" crossorigin>

/* Font face with fallback */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap; /* Show fallback immediately */
}
```

### SVG Optimization
```typescript
// SVG sprite system
export function Icon({ name, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} className="tw-inline-block">
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}
```

### CSS Optimization

#### PurgeCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@mantine/**/*.{js,ts}',
  ],
  safelist: [
    // Dynamic classes that might not be detected
    /^tw-bg-/,
    /^tw-text-/,
  ],
};
```

#### Critical CSS Inlining
```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
  .app-shell { /* ... */ }
  .header { /* ... */ }
  .nav { /* ... */ }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

## Performance Monitoring

### Real User Monitoring (RUM)
```typescript
// Performance observer
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Send metrics to analytics
          analytics.track('web-vital', {
            name: entry.name,
            value: entry.value,
            rating: entry.rating,
          });
        }
      });
      
      observer.observe({ entryTypes: ['web-vital'] });
      
      return () => observer.disconnect();
    }
  }, []);
}
```

### Component Performance Profiling
```typescript
// React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  // Log slow renders
  if (actualDuration > 16) { // More than one frame
    console.warn(`Slow render in ${id}: ${actualDuration}ms`);
  }
}

export function ProfiledComponent() {
  return (
    <Profiler id="ExpensiveComponent" onRender={onRenderCallback}>
      <ExpensiveComponent />
    </Profiler>
  );
}
```

## Best Practices Summary

### Do's
- ✅ Use code splitting for routes and heavy components
- ✅ Implement virtual scrolling for long lists
- ✅ Optimize images with proper formats and lazy loading
- ✅ Debounce user inputs and API calls
- ✅ Memoize expensive computations
- ✅ Monitor bundle size and set budgets
- ✅ Use production builds for testing performance
- ✅ Profile components to find bottlenecks

### Don'ts
- ❌ Don't import entire libraries when you need one function
- ❌ Don't use inline functions in render when avoidable
- ❌ Don't nest too many Context providers
- ❌ Don't load all data at once - implement pagination
- ❌ Don't block the main thread with heavy computations
- ❌ Don't use large unoptimized images
- ❌ Don't ship unused CSS or JavaScript