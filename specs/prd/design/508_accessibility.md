# Accessibility Design

## WCAG 2.1 AA Compliance

### Color Contrast Requirements

#### Text Contrast
- **Normal Text**: 4.5:1 minimum ratio
- **Large Text**: 3:1 minimum ratio (18pt+ or 14pt+ bold)
- **UI Components**: 3:1 minimum ratio

#### Testing Tools
- Integrated contrast checker in design system
- Browser extensions for real-time checking
- Automated CI/CD contrast validation

```typescript
// Utility function for contrast checking
export function checkContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  };
}
```

### Keyboard Navigation

#### Tab Order
- Logical flow through interface
- Skip links for main content
- Focus trap in modals
- Escape key to close overlays

```typescript
export function SkipLinks() {
  return (
    <div className="tw-sr-only focus-within:tw-not-sr-only">
      <a href="#main-content" className="tw-skip-link">
        Skip to main content
      </a>
      <a href="#main-navigation" className="tw-skip-link">
        Skip to navigation
      </a>
    </div>
  );
}
```

#### Focus Indicators
- Visible focus rings on all interactive elements
- High contrast focus styles
- Consistent focus behavior

```css
/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### Keyboard Shortcuts
- Documented shortcuts with customization
- Standard patterns (Cmd+K for search)
- Avoid conflicts with screen readers

```typescript
export const keyboardShortcuts = {
  search: { key: 'k', modifiers: ['cmd', 'ctrl'] },
  save: { key: 's', modifiers: ['cmd', 'ctrl'] },
  undo: { key: 'z', modifiers: ['cmd', 'ctrl'] },
  redo: { key: 'z', modifiers: ['cmd', 'ctrl', 'shift'] }
};
```

### Screen Reader Support

#### ARIA Labels
- Descriptive labels for all UI elements
- Avoid redundant descriptions
- Context-aware labeling

```typescript
export function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="tw-icon-button"
    >
      {icon}
      <span className="tw-sr-only">{label}</span>
    </button>
  );
}
```

#### Live Regions
- Announce dynamic content changes
- Appropriate politeness levels
- Clear, concise announcements

```typescript
export function LiveAnnouncement({ message, priority = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="tw-sr-only"
    >
      {message}
    </div>
  );
}
```

#### Semantic HTML
- Proper heading hierarchy
- Landmark regions
- Meaningful HTML elements

```typescript
export function PageStructure({ children }) {
  return (
    <>
      <header role="banner">
        <nav role="navigation" aria-label="Main navigation">
          {/* Navigation */}
        </nav>
      </header>
      
      <main role="main" id="main-content">
        <h1>{/* Page title */}</h1>
        {children}
      </main>
      
      <aside role="complementary" aria-label="Related information">
        {/* Sidebar */}
      </aside>
      
      <footer role="contentinfo">
        {/* Footer */}
      </footer>
    </>
  );
}
```

#### Alt Text
- Meaningful descriptions for all images/charts
- Context-appropriate detail level
- Empty alt for decorative images

```typescript
export function DataVisualization({ data, type }) {
  const description = generateChartDescription(data, type);
  
  return (
    <figure>
      <Chart data={data} type={type} aria-label={description} />
      <figcaption className="tw-sr-only">{description}</figcaption>
    </figure>
  );
}
```

### Visual Accommodations

#### Zoom Support
- Up to 200% without horizontal scroll
- Reflow content appropriately
- Maintain functionality at all zoom levels

```css
/* Responsive units for zoom support */
.zoomable-text {
  font-size: 1rem; /* Use rem for scalability */
  line-height: 1.5;
  max-width: 70ch; /* Limit line length */
}
```

#### Color Blind Mode
- Alternative color schemes
- Patterns in addition to colors
- Color-blind safe palettes

```typescript
export const colorBlindPalettes = {
  deuteranopia: {
    primary: '#0173B2',
    success: '#029E73',
    warning: '#CC78BC',
    danger: '#DE8F05'
  },
  protanopia: {
    primary: '#0173B2',
    success: '#56B4E9',
    warning: '#E69F00',
    danger: '#D55E00'
  }
};
```

#### High Contrast Mode
- Optional high contrast theme
- Increased borders and shadows
- Enhanced focus indicators

```typescript
export function useHighContrast() {
  const [enabled, setEnabled] = useState(
    window.matchMedia('(prefers-contrast: high)').matches
  );
  
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [enabled]);
  
  return { enabled, setEnabled };
}
```

#### Reduced Motion
- Respect prefers-reduced-motion
- Alternative transitions
- Essential animations only

```css
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Inclusive Design Patterns

### Error Messaging
- Clear error identification
- Suggested corrections
- Multiple notification methods (color + icon + text)

```typescript
export function AccessibleError({ error, fieldId }) {
  const errorId = `${fieldId}-error`;
  
  return (
    <>
      <div
        id={errorId}
        role="alert"
        aria-live="polite"
        className="tw-flex tw-items-center tw-mt-1 tw-text-red-600"
      >
        <IconAlertCircle size={16} aria-hidden="true" />
        <span className="tw-ml-1 tw-text-sm">{error}</span>
      </div>
    </>
  );
}
```

### Form Design
- Clear labels above inputs
- Helper text for complex fields
- Inline validation with clear messages
- Error summary at form level

```typescript
export function AccessibleForm() {
  return (
    <form aria-label="User registration form">
      <div role="group" aria-labelledby="personal-info">
        <h2 id="personal-info">Personal Information</h2>
        
        <div className="tw-mb-4">
          <label htmlFor="email" className="tw-block tw-mb-1">
            Email Address <span aria-label="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            aria-describedby="email-hint email-error"
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          <div id="email-hint" className="tw-text-sm tw-text-gray-600">
            We'll never share your email
          </div>
          {errors.email && (
            <AccessibleError error={errors.email} fieldId="email" />
          )}
        </div>
      </div>
    </form>
  );
}
```

### Data Visualization
- Patterns in addition to colors
- Data tables as alternative to charts
- Sonification option for trends
- Detailed text descriptions

```typescript
export function AccessibleChart({ data, type }) {
  const [showTable, setShowTable] = useState(false);
  
  return (
    <div>
      <div className="tw-flex tw-justify-between tw-mb-4">
        <h3 id="chart-title">Sales by Month</h3>
        <Button
          variant="subtle"
          onClick={() => setShowTable(!showTable)}
          aria-pressed={showTable}
        >
          {showTable ? 'Show Chart' : 'Show Data Table'}
        </Button>
      </div>
      
      {showTable ? (
        <DataTable
          data={data}
          caption="Sales data by month"
          aria-labelledby="chart-title"
        />
      ) : (
        <Chart
          data={data}
          type={type}
          patterns={true}
          aria-labelledby="chart-title"
          aria-describedby="chart-description"
        />
      )}
      
      <p id="chart-description" className="tw-sr-only">
        {generateDetailedDescription(data, type)}
      </p>
    </div>
  );
}
```

### Time Limits
- No automatic timeouts
- Warning before session expiry
- Option to extend time
- Save work automatically

```typescript
export function SessionTimeout() {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  
  return (
    <Modal
      opened={timeRemaining < 60}
      title="Session Expiring Soon"
      role="alertdialog"
      aria-describedby="timeout-message"
    >
      <p id="timeout-message">
        Your session will expire in {timeRemaining} seconds.
        Would you like to continue?
      </p>
      <Group mt="md">
        <Button onClick={extendSession}>Continue Working</Button>
        <Button variant="subtle" onClick={logout}>Log Out</Button>
      </Group>
    </Modal>
  );
}
```

## Testing Accessibility

### Automated Testing
```typescript
// Jest + Testing Library
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('component is accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Error messages are clear and associated
- [ ] Forms can be completed with assistive technology
- [ ] Time-based content has controls
- [ ] Media has captions/transcripts