# Page-Specific UX Patterns

## 60-Second Onboarding Flow

### Overview
The onboarding experience is designed to get users from signup to their first insight in under 60 seconds, establishing Jabiru's value proposition immediately.

### Step Flow

#### Step 1: Welcome Screen
```typescript
interface WelcomeStep {
  title: "Welcome to Jabiru";
  content: "3 quick questions to personalize your experience";
  ui: {
    layout: "Centered card with illustration";
    inputs: ["Your name", "Role", "Company"];
    progress: "Step indicator at top";
  };
}
```

**Implementation:**
```typescript
import { TextInput, Select, Progress } from '@mantine/core';
import { Card } from '../components/Card';

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <Card className="tw-max-w-md tw-mx-auto tw-mt-20">
      <Progress value={25} mb="xl" />
      
      <div className="tw-text-center tw-mb-8">
        <h1 className="tw-text-2xl tw-font-bold tw-mb-2">
          Welcome to Jabiru
        </h1>
        <p className="tw-text-gray-600">
          3 quick questions to personalize your experience
        </p>
      </div>
      
      <form className="tw-space-y-4">
        <TextInput
          label="Your name"
          placeholder="John Doe"
          required
        />
        <Select
          label="Your role"
          placeholder="Select your role"
          data={['Analyst', 'Manager', 'Executive', 'Other']}
          required
        />
        <TextInput
          label="Company"
          placeholder="Acme Inc."
        />
        
        <Button fullWidth onClick={onNext}>
          Continue
        </Button>
      </form>
    </Card>
  );
}
```

#### Step 2: Business Context
```typescript
interface BusinessContextStep {
  title: "Your Business Context";
  content: "Help our AI understand your domain";
  ui: {
    layout: "Two-column with preview";
    inputs: ["Industry selection", "Key metrics", "Data types"];
    feature: "Smart suggestions based on industry";
  };
}
```

#### Step 3: Quick Start
```typescript
interface QuickStartStep {
  title: "Quick Start";
  content: "Try with sample data or upload your own";
  ui: {
    layout: "Action cards with hover effects";
    options: ["Use sample data", "Upload CSV", "Connect database"];
    cta: "Large, prominent action buttons";
  };
}
```

#### Step 4: First Insight
```typescript
interface FirstInsightStep {
  title: "Your First Insight";
  content: "Natural language prompt for first chart";
  ui: {
    layout: "Split screen with live preview";
    input: "AI prompt with example suggestions";
    result: "Real-time chart generation";
  };
}
```

### Design Elements
- **Progress**: Linear progress bar with steps
- **Animations**: Smooth transitions between steps
- **Skip Option**: Always visible but de-emphasized
- **Celebration**: Confetti animation on completion

## Canvas Editor Design

### Layout Structure

```typescript
interface CanvasEditorLayout {
  structure: "Three-panel responsive layout";
  panels: {
    left: {
      title: "Block Library";
      width: "280px";
      content: [
        "Search bar for blocks",
        "Categorized block types",
        "Drag indicators on hover",
        "Recent/favorite blocks"
      ];
    };
    center: {
      title: "Canvas Area";
      behavior: "Infinite scrolling with zoom";
      features: [
        "Grid background (subtle dots)",
        "Snap-to-grid with visual guides",
        "Multi-select with lasso",
        "Context menu on right-click"
      ];
    };
    right: {
      title: "Properties Panel";
      width: "320px";
      behavior: "Context-sensitive to selection";
      content: [
        "Block properties",
        "Style controls",
        "Data bindings",
        "AI suggestions"
      ];
    };
  };
}
```

### Interaction Patterns

#### Drag & Drop
- Ghost image while dragging
- Drop zone highlighting
- Auto-scroll near edges
- Undo/redo support

#### Selection
- Click to select
- Ctrl+click for multi-select
- Shift+click for range select
- Select all with Ctrl+A

#### Keyboard Shortcuts
- Delete: Remove selected blocks
- Ctrl+C/V: Copy/paste blocks
- Ctrl+Z/Y: Undo/redo
- Space: Pan mode

### Canvas Implementation

```typescript
import { useDroppable, DndContext } from '@dnd-kit/core';

export function CanvasArea() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-area',
  });

  return (
    <div
      ref={setNodeRef}
      className={twMerge(
        "tw-relative tw-h-full tw-bg-gray-50",
        "tw-bg-dot-pattern", // Custom dot grid pattern
        isOver && "tw-bg-blue-50"
      )}
    >
      <div className="tw-absolute tw-inset-0 tw-overflow-auto">
        {/* Canvas blocks render here */}
      </div>
      
      {/* Zoom controls */}
      <div className="tw-absolute tw-bottom-4 tw-right-4">
        <ZoomControls />
      </div>
    </div>
  );
}
```

## Data Upload Experience

### Upload Interface States

#### Initial State
```typescript
interface InitialUploadState {
  design: "Large drop zone with dashed border";
  messaging: "Drag and drop your CSV file here";
  alternative: "Or click to browse button";
  supported_formats: "Visual badges for CSV, Excel, JSON";
}
```

#### Uploading State
```typescript
interface UploadingState {
  progress: "Circular progress with percentage";
  file_info: "Filename, size, estimated time";
  cancel_option: "Clear cancel button";
  animation: "Pulsing upload icon";
}
```

#### Processing State
```typescript
interface ProcessingState {
  stages: [
    "Reading file structure",
    "Detecting column types",
    "Identifying data quality issues",
    "Generating preview"
  ];
  visualization: "Step progress with checkmarks";
  messaging: "What AI is doing in plain language";
}
```

#### Complete State
```typescript
interface CompleteState {
  preview: "Data table with first 100 rows";
  statistics: "Row count, column count, file size";
  actions: ["Accept and Continue", "Configure Columns", "Upload Different File"];
  ai_insights: "Automatic insights about the data";
}
```

### Upload Component Implementation

```typescript
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';

export function DataUpload() {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');

  return (
    <div className="tw-max-w-2xl tw-mx-auto">
      {uploadState === 'idle' && (
        <Dropzone
          onDrop={(files) => handleUpload(files)}
          accept={[MIME_TYPES.csv, MIME_TYPES.xlsx]}
          className="tw-min-h-[300px]"
        >
          <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full">
            <Dropzone.Accept>
              <IconUpload size={50} className="tw-text-blue-500" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={50} className="tw-text-red-500" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFile size={50} className="tw-text-gray-400" />
            </Dropzone.Idle>

            <Text size="xl" className="tw-mt-4">
              Drag and drop your CSV file here
            </Text>
            <Text size="sm" c="dimmed" className="tw-mt-2">
              or click to browse
            </Text>
          </div>
        </Dropzone>
      )}

      {uploadState === 'processing' && (
        <ProcessingIndicator stages={processingStages} />
      )}

      {uploadState === 'complete' && (
        <DataPreview data={uploadedData} />
      )}
    </div>
  );
}
```

## Dashboard Layouts

### Project Dashboard

```typescript
interface ProjectDashboard {
  sections: {
    header: {
      content: ["Project name", "Last modified", "Share button"];
      layout: "Flex with space-between";
    };
    stats: {
      content: ["Data sources", "Canvases", "Team members", "Insights"];
      layout: "Grid with 4 columns";
    };
    recentActivity: {
      content: "Timeline of recent changes";
      layout: "List with timestamps";
    };
    quickActions: {
      content: ["New Canvas", "Upload Data", "Generate Insight"];
      layout: "Button group";
    };
  };
}
```

### Analytics Dashboard

```typescript
export function AnalyticsDashboard() {
  return (
    <div className="tw-space-y-6">
      {/* KPI Cards */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
        <KPICard title="Total Views" value="12,543" change="+12%" />
        <KPICard title="Active Users" value="432" change="+5%" />
        <KPICard title="Canvases Created" value="89" change="+23%" />
        <KPICard title="AI Insights" value="1,234" change="+45%" />
      </div>

      {/* Charts Section */}
      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
        <Card>
          <h3 className="tw-text-lg tw-font-semibold tw-mb-4">
            Usage Trends
          </h3>
          <UsageTrendChart />
        </Card>
        
        <Card>
          <h3 className="tw-text-lg tw-font-semibold tw-mb-4">
            Popular Features
          </h3>
          <FeatureUsageChart />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="tw-text-lg tw-font-semibold tw-mb-4">
          Recent Activity
        </h3>
        <ActivityTimeline />
      </Card>
    </div>
  );
}
```

## Common Page Patterns

### Empty States
- Clear messaging about what's missing
- Actionable next steps
- Helpful illustrations
- Sample data options

### Loading States
- Skeleton screens matching content structure
- Progressive loading for better perceived performance
- Meaningful progress indicators
- Smooth transitions to loaded content

### Error States
- User-friendly error messages
- Recovery actions
- Contact support option
- Preserve user data when possible

### Success States
- Clear confirmation of action
- Next steps guidance
- Celebration for major milestones
- Option to share achievements