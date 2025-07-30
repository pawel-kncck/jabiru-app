# Interaction Design

## Micro-interactions and Feedback

### Hover States

#### Buttons
- **Scale**: `transform: scale(1.02)`
- **Shadow**: Elevation increase
- **Color**: Slight brightness adjustment

```css
.button-hover {
  transition: all 200ms ease;
}

.button-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### Cards
- **Elevation**: Subtle shadow increase
- **Border**: Light border appearance
- **Actions**: Reveal secondary actions

```typescript
export const cardHoverStyles = {
  base: "tw-transition-all tw-duration-200",
  hover: "hover:tw-shadow-lg hover:tw-border-gray-300",
  withActions: "hover:tw-translate-y-[-2px]"
};
```

#### Data Rows
- **Background**: Subtle highlight
- **Actions**: Show row actions

### Loading States

#### Skeleton Screens
- Use for content areas
- Animated shimmer effect
- Match actual content structure

```typescript
import { Skeleton } from '@mantine/core';

export function ContentSkeleton() {
  return (
    <div className="tw-space-y-3">
      <Skeleton height={40} radius="sm" />
      <Skeleton height={20} width="70%" radius="sm" />
      <Skeleton height={20} width="50%" radius="sm" />
    </div>
  );
}
```

#### Progress Indicators
- **Determinate**: Progress bars with percentage
- **Indeterminate**: Spinning indicators for unknown duration
- **Contextual**: Inline loaders for specific elements

```typescript
import { Progress, Loader } from '@mantine/core';

// Determinate progress
<Progress value={75} label="75%" size="xl" radius="xl" />

// Indeterminate loader
<Loader size="sm" variant="dots" />
```

### Transitions

#### Page Transitions
- **Fade in/out**: 200ms
- **Slide**: 250ms with easing

#### Element Transitions
- **Appear**: Fade + slight scale
- **Disappear**: Fade out
- **Reorder**: Smooth position changes

```typescript
export const transitionClasses = {
  fadeIn: "tw-animate-fadeIn",
  slideIn: "tw-animate-slideIn",
  scaleIn: "tw-animate-scaleIn"
};

// Tailwind config
animations: {
  fadeIn: 'fadeIn 200ms ease-out',
  slideIn: 'slideIn 250ms ease-out',
  scaleIn: 'scaleIn 200ms ease-out'
}
```

## AI Interaction Patterns

### Natural Language Input

#### Design Elements
- **Input Field**: Large, prominent with AI icon
- **Placeholder**: Contextual examples based on current data
- **Submit Button**: Send icon with loading state

#### Features
- **Auto-complete**: Smart suggestions as user types
- **Command Palette**: Slash commands for power users
- **Voice Input**: Optional voice-to-text
- **History**: Recent prompts with one-click reuse

```typescript
import { Textarea, ActionIcon, Badge } from '@mantine/core';
import { IconSparkles, IconSend } from '@tabler/icons-react';

export function AIPromptInput() {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  return (
    <div className="tw-relative">
      <Badge
        leftSection={<IconSparkles size={14} />}
        className="tw-absolute tw-top-2 tw-left-2"
        variant="light"
      >
        AI Assistant
      </Badge>
      
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me to create a chart, analyze data, or find insights..."
        minRows={3}
        className="tw-pt-10"
        rightSection={
          <ActionIcon 
            onClick={handleSubmit}
            disabled={!value.trim()}
            loading={isLoading}
          >
            <IconSend size={18} />
          </ActionIcon>
        }
      />
      
      {suggestions.length > 0 && (
        <div className="tw-absolute tw-top-full tw-left-0 tw-right-0 tw-mt-1">
          <SuggestionsList suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}
```

### AI Response Display

#### Thinking State
- **Animation**: Pulsing AI avatar or dots
- **Message**: "Understanding your request..."
- **Cancel Option**: Stop generation button

```typescript
export function AIThinking() {
  return (
    <div className="tw-flex tw-items-center tw-space-x-3 tw-p-4">
      <div className="tw-animate-pulse">
        <IconSparkles size={24} className="tw-text-blue-500" />
      </div>
      <div>
        <Text size="sm" weight={500}>AI is thinking...</Text>
        <Text size="xs" color="dimmed">Understanding your request</Text>
      </div>
      <ActionIcon size="sm" variant="subtle" onClick={handleCancel}>
        <IconX size={16} />
      </ActionIcon>
    </div>
  );
}
```

#### Response Format
- **Header**: AI interpretation of request
- **Content**: Generated chart/table/insight
- **Explanation**: Collapsible reasoning section
- **Actions**: ["Accept", "Modify", "Regenerate", "Report Issue"]

```typescript
interface AIResponse {
  interpretation: string;
  content: React.ReactNode;
  reasoning?: string;
  confidence: number;
}

export function AIResponseDisplay({ response }: { response: AIResponse }) {
  const [showReasoning, setShowReasoning] = useState(false);
  
  return (
    <Card className="tw-mt-4">
      <div className="tw-mb-4">
        <Text size="sm" color="dimmed">AI understood:</Text>
        <Text>{response.interpretation}</Text>
      </div>
      
      <div className="tw-my-4">
        {response.content}
      </div>
      
      {response.reasoning && (
        <Collapse in={showReasoning}>
          <Alert icon={<IconInfoCircle />} color="blue" variant="light">
            <Text size="sm">{response.reasoning}</Text>
          </Alert>
        </Collapse>
      )}
      
      <Group mt="md">
        <Button size="sm" variant="filled">Accept</Button>
        <Button size="sm" variant="light">Modify</Button>
        <Button size="sm" variant="subtle">Regenerate</Button>
      </Group>
    </Card>
  );
}
```

#### Error Handling
- **Unclear Request**: Clarifying questions with options
- **No Data**: Suggestions for data needed
- **Failure**: Friendly error with alternatives

## User Feedback Mechanisms

### Toast Notifications

```typescript
import { notifications } from '@mantine/notifications';

// Success notification
notifications.show({
  title: 'Success!',
  message: 'Your data has been saved',
  color: 'green',
  icon: <IconCheck />,
});

// Error notification
notifications.show({
  title: 'Error',
  message: 'Failed to save changes',
  color: 'red',
  icon: <IconX />,
});
```

### Inline Feedback

```typescript
export function InlineFeedback({ type, message }: FeedbackProps) {
  const styles = {
    success: "tw-bg-green-50 tw-text-green-800 tw-border-green-200",
    warning: "tw-bg-yellow-50 tw-text-yellow-800 tw-border-yellow-200",
    error: "tw-bg-red-50 tw-text-red-800 tw-border-red-200",
    info: "tw-bg-blue-50 tw-text-blue-800 tw-border-blue-200"
  };
  
  return (
    <div className={`tw-p-3 tw-rounded-md tw-border ${styles[type]}`}>
      {message}
    </div>
  );
}
```

### Progress Feedback

```typescript
export function ProgressFeedback({ 
  steps, 
  currentStep, 
  status 
}: ProgressProps) {
  return (
    <div className="tw-space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="tw-flex tw-items-center tw-space-x-3">
          <div className={twMerge(
            "tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center",
            index < currentStep ? "tw-bg-green-500 tw-text-white" :
            index === currentStep ? "tw-bg-blue-500 tw-text-white" :
            "tw-bg-gray-200 tw-text-gray-500"
          )}>
            {index < currentStep ? <IconCheck size={16} /> : index + 1}
          </div>
          <Text size="sm" color={index <= currentStep ? undefined : "dimmed"}>
            {step.label}
          </Text>
          {index === currentStep && status === 'loading' && (
            <Loader size="xs" />
          )}
        </div>
      ))}
    </div>
  );
}
```

## Animation Guidelines

### Performance
- Use CSS transforms over position changes
- Leverage GPU acceleration with `will-change`
- Keep animations under 300ms for responsiveness
- Use `prefers-reduced-motion` media query

### Easing Functions
```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Gesture Support

### Touch Gestures
- **Swipe**: Navigate between screens/tabs
- **Pinch**: Zoom in/out on canvas
- **Long Press**: Context menu
- **Pull to Refresh**: Update data

### Implementation
```typescript
import { useGesture } from '@use-gesture/react';

export function SwipeableCard({ onSwipeLeft, onSwipeRight }) {
  const bind = useGesture({
    onDrag: ({ direction: [xDir], distance, cancel }) => {
      if (distance > 100) {
        cancel();
        if (xDir < 0) onSwipeLeft();
        else onSwipeRight();
      }
    }
  });
  
  return <div {...bind()} className="tw-touch-pan-y" />;
}
```