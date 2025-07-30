# Responsive Design Strategy

## Breakpoint System

### Tailwind Breakpoints
```scss
// Tailwind breakpoint system with Mantine integration
$breakpoints: (
  'sm': 640px,   // Mobile landscape
  'md': 768px,   // Tablet portrait
  'lg': 1024px,  // Tablet landscape / small desktop
  'xl': 1280px,  // Desktop
  '2xl': 1536px  // Large desktop
);
```

### Mantine-Tailwind Alignment
```typescript
// Ensure Mantine and Tailwind breakpoints align
export const mantineBreakpoints = {
  xs: '640px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1536px',
};
```

## Mobile-First Approach

### Design Philosophy
1. Start with mobile layout
2. Enhance for larger screens
3. Prioritize touch interactions
4. Optimize for performance

### Implementation Pattern
```css
/* Mobile first - default styles */
.component {
  padding: 1rem;
  font-size: 14px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 16px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 18px;
  }
}
```

## Responsive Patterns

### Grid System
```typescript
// Responsive grid classes
export const responsiveGrid = {
  // 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens
  standard: "tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4",
  
  // 1 column on mobile, 2 on desktop
  simple: "tw-grid tw-grid-cols-1 lg:tw-grid-cols-2",
  
  // Auto-fit with minimum column width
  autoFit: "tw-grid tw-grid-cols-[repeat(auto-fit,minmax(300px,1fr))]"
};
```

### Responsive Spacing
```typescript
// Utility classes for responsive spacing
export const responsiveSpacing = {
  padding: "tw-p-4 sm:tw-p-6 lg:tw-p-8",
  margin: "tw-m-4 sm:tw-m-6 lg:tw-m-8",
  gap: "tw-gap-4 sm:tw-gap-6 lg:tw-gap-8"
};
```

### Responsive Typography
```typescript
// Text size scales
export const responsiveText = {
  heading1: "tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl",
  heading2: "tw-text-xl sm:tw-text-2xl lg:tw-text-3xl",
  heading3: "tw-text-lg sm:tw-text-xl lg:tw-text-2xl",
  body: "tw-text-sm sm:tw-text-base lg:tw-text-lg",
  small: "tw-text-xs sm:tw-text-sm"
};
```

## Mobile Design Decisions

### Navigation
**Pattern**: Bottom tab bar with hamburger menu

```typescript
export function MobileNavigation() {
  return (
    <>
      {/* Top header with hamburger */}
      <div className="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-bg-white tw-border-b md:tw-hidden">
        <div className="tw-flex tw-items-center tw-justify-between tw-p-4">
          <Burger opened={opened} onClick={toggle} />
          <Logo />
          <NotificationIcon />
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-border-t md:tw-hidden">
        <nav className="tw-flex tw-justify-around tw-py-2">
          <TabButton icon={<IconHome />} label="Home" />
          <TabButton icon={<IconFolder />} label="Projects" />
          <TabButton icon={<IconPlus />} label="Create" primary />
          <TabButton icon={<IconSearch />} label="Search" />
          <TabButton icon={<IconUser />} label="Profile" />
        </nav>
      </div>
    </>
  );
}
```

### Canvas Interaction
**View Mode**: Read-only by default on mobile

```typescript
export function MobileCanvas() {
  const [editMode, setEditMode] = useState(false);
  
  return (
    <div className="tw-relative tw-h-full">
      {/* Canvas viewport */}
      <div className="tw-overflow-auto tw-h-full">
        <PinchZoomCanvas readOnly={!editMode}>
          {/* Canvas content */}
        </PinchZoomCanvas>
      </div>
      
      {/* Floating action button for edit mode */}
      {!editMode && (
        <ActionIcon
          className="tw-fixed tw-bottom-20 tw-right-4"
          size="xl"
          radius="xl"
          onClick={() => setEditMode(true)}
        >
          <IconEdit />
        </ActionIcon>
      )}
    </div>
  );
}
```

### Data Tables
**Mobile View**: Card-based layout

```typescript
export function ResponsiveDataTable({ data, columns }) {
  return (
    <>
      {/* Desktop table */}
      <div className="tw-hidden md:tw-block">
        <Table>
          {/* Standard table implementation */}
        </Table>
      </div>
      
      {/* Mobile cards */}
      <div className="tw-block md:tw-hidden tw-space-y-4">
        {data.map((row) => (
          <Card key={row.id}>
            {columns.map((col) => (
              <div key={col.key} className="tw-flex tw-justify-between tw-py-2">
                <Text size="sm" color="dimmed">{col.label}</Text>
                <Text size="sm" weight={500}>{row[col.key]}</Text>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
```

### Forms
**Mobile Optimization**:

```typescript
export function MobileOptimizedForm() {
  return (
    <form className="tw-space-y-4">
      {/* Full-width inputs */}
      <TextInput
        label="Email"
        type="email"
        className="tw-w-full"
        size="md" // Larger touch targets
        inputMode="email" // Mobile keyboard optimization
      />
      
      {/* Stacked layout on mobile */}
      <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
        <TextInput label="First Name" />
        <TextInput label="Last Name" />
      </div>
      
      {/* Sticky submit button */}
      <div className="tw-sticky tw-bottom-0 tw-bg-white tw-pt-4 tw-pb-safe">
        <Button fullWidth size="lg">
          Submit
        </Button>
      </div>
    </form>
  );
}
```

## Touch-Optimized Interfaces

### Touch Targets
- Minimum size: 44px × 44px
- Adequate spacing between targets
- Visual feedback on touch

```typescript
export const touchOptimized = {
  button: "tw-min-h-[44px] tw-px-4",
  iconButton: "tw-w-11 tw-h-11",
  listItem: "tw-py-3 tw-px-4",
  spacing: "tw-space-y-2"
};
```

### Swipe Gestures
```typescript
import { useSwipeable } from 'react-swipeable';

export function SwipeableList({ items, onDelete }) {
  return items.map((item) => (
    <SwipeableItem
      key={item.id}
      onSwipeLeft={() => onDelete(item.id)}
      leftAction={<DeleteButton />}
    >
      {item.content}
    </SwipeableItem>
  ));
}
```

## Adaptive Layouts

### Container Queries
```css
/* Future-proof with container queries */
@container (min-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Flexible Components
```typescript
export function AdaptiveCard({ compact = false }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile || compact) {
    return <CompactCard />;
  }
  
  return <FullCard />;
}
```

## Performance Considerations

### Responsive Images
```typescript
export function ResponsiveImage({ src, alt }) {
  return (
    <picture>
      <source
        media="(max-width: 640px)"
        srcSet={`${src}?w=640 1x, ${src}?w=1280 2x`}
      />
      <source
        media="(max-width: 1024px)"
        srcSet={`${src}?w=1024 1x, ${src}?w=2048 2x`}
      />
      <img
        src={`${src}?w=1920`}
        alt={alt}
        loading="lazy"
        className="tw-w-full tw-h-auto"
      />
    </picture>
  );
}
```

### Conditional Loading
```typescript
export function ConditionalFeature() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <>
      {/* Always load core features */}
      <CoreFeature />
      
      {/* Only load advanced features on desktop */}
      {isDesktop && <AdvancedFeature />}
    </>
  );
}
```

## Testing Responsive Design

### Device Testing Matrix
- **Mobile**: iPhone SE, iPhone 13, Samsung Galaxy S21
- **Tablet**: iPad Mini, iPad Pro
- **Desktop**: 1366×768, 1920×1080, 2560×1440

### Testing Checklist
- [ ] All content is accessible on mobile
- [ ] Touch targets meet minimum size
- [ ] Forms are usable on mobile keyboards
- [ ] Images load appropriate sizes
- [ ] Navigation works on all devices
- [ ] Performance is acceptable on mobile
- [ ] Gestures work as expected
- [ ] Text remains readable without zooming