# Layout & Navigation

## Application Shell Layout

### Structure

The application uses a responsive shell layout with the following components:

#### Sidebar
- **Width**: 240px collapsed, 280px expanded
- **Behavior**: Collapsible with memory of user preference
- **Sections**:
  - User profile and workspace selector
  - Main navigation (Projects, Data, Insights)
  - Recent items with quick access
  - Help and settings at bottom

#### Header
- **Height**: 56px
- **Content**:
  - Global search with command palette (Cmd+K)
  - AI assistant trigger button
  - Notifications with badge count
  - User menu with quick actions

#### Main Content Area
- **Padding**: 24px
- **Max Width**: 1440px centered with responsive margins
- **Background**: Subtle gray with white content areas

### Implementation

```typescript
import { AppShell, Burger, Group, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <GlobalSearch />
          <Group ml="auto">
            <AIAssistantButton />
            <NotificationCenter />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <UserProfile />
        </AppShell.Section>
        
        <AppShell.Section grow component={ScrollArea}>
          <MainNavigation />
          <RecentItems />
        </AppShell.Section>
        
        <AppShell.Section>
          <FooterLinks />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="tw-max-w-7xl tw-mx-auto">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
```

## Navigation Patterns

### Primary Navigation

**Type**: Vertical sidebar with icons and labels

**Items**:
- **Home**: Dashboard with recent activity
- **Projects**: Project grid with search/filter
- **Data Studio**: Data source management
- **Insights**: Saved analyses and reports
- **Settings**: User and workspace settings

```typescript
import { NavLink } from '@mantine/core';
import { 
  IconHome, 
  IconFolder, 
  IconDatabase, 
  IconBulb, 
  IconSettings 
} from '@tabler/icons-react';

const navigationItems = [
  { label: 'Home', icon: IconHome, href: '/' },
  { label: 'Projects', icon: IconFolder, href: '/projects' },
  { label: 'Data Studio', icon: IconDatabase, href: '/data' },
  { label: 'Insights', icon: IconBulb, href: '/insights' },
  { label: 'Settings', icon: IconSettings, href: '/settings' },
];

export function MainNavigation() {
  const location = useLocation();

  return (
    <div className="tw-space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={20} />}
          active={location.pathname === item.href}
          className="tw-rounded-lg"
        />
      ))}
    </div>
  );
}
```

### Contextual Navigation

#### Project View
- **Overview**: Project dashboard
- **Data**: Connected data sources
- **Canvases**: Analysis workspaces
- **Insights**: Generated insights
- **Settings**: Project configuration

```typescript
import { Tabs } from '@mantine/core';

export function ProjectNavigation({ projectId }: { projectId: string }) {
  const location = useLocation();
  
  return (
    <Tabs value={location.pathname} className="tw-mb-6">
      <Tabs.List>
        <Tabs.Tab value={`/projects/${projectId}`}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab value={`/projects/${projectId}/data`}>
          Data
        </Tabs.Tab>
        <Tabs.Tab value={`/projects/${projectId}/canvases`}>
          Canvases
        </Tabs.Tab>
        <Tabs.Tab value={`/projects/${projectId}/insights`}>
          Insights
        </Tabs.Tab>
        <Tabs.Tab value={`/projects/${projectId}/settings`}>
          Settings
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
```

### Breadcrumb Pattern

**Structure**: Home > Project Name > Canvas Name
**Behavior**: Clickable with dropdown for siblings

```typescript
import { Breadcrumbs, Anchor, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumbs className="tw-mb-4">
      {items.map((item, index) => {
        if (item.siblings && item.siblings.length > 0) {
          return (
            <Menu key={index} trigger="hover">
              <Menu.Target>
                <Anchor href={item.href} className="tw-flex tw-items-center tw-gap-1">
                  {item.label}
                  <IconChevronDown size={14} />
                </Anchor>
              </Menu.Target>
              <Menu.Dropdown>
                {item.siblings.map((sibling) => (
                  <Menu.Item key={sibling.href} href={sibling.href}>
                    {sibling.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          );
        }
        
        return (
          <Anchor key={index} href={item.href}>
            {item.label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
```

### Mobile Navigation

**Type**: Bottom tab bar with hamburger menu
**Breakpoint**: 768px
**Behavior**: Slide-over sidebar on mobile

```typescript
import { Tabs } from '@mantine/core';

export function MobileTabBar() {
  const location = useLocation();
  
  return (
    <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-border-t md:tw-hidden">
      <Tabs value={location.pathname} variant="pills">
        <Tabs.List className="tw-justify-around">
          <Tabs.Tab value="/" icon={<IconHome size={20} />} />
          <Tabs.Tab value="/projects" icon={<IconFolder size={20} />} />
          <Tabs.Tab value="/search" icon={<IconSearch size={20} />} />
          <Tabs.Tab value="/menu" icon={<IconMenu2 size={20} />} />
        </Tabs.List>
      </Tabs>
    </div>
  );
}
```

## Layout Patterns

### Three-Panel Layout (Canvas Editor)

```typescript
export function CanvasLayout({ 
  sidebar, 
  canvas, 
  properties 
}: CanvasLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);

  return (
    <div className="tw-flex tw-h-full">
      {/* Left Sidebar */}
      <div className={twMerge(
        "tw-border-r tw-bg-gray-50 tw-transition-all",
        sidebarCollapsed ? "tw-w-12" : "tw-w-64"
      )}>
        {sidebar}
      </div>

      {/* Canvas Area */}
      <div className="tw-flex-1 tw-overflow-hidden">
        {canvas}
      </div>

      {/* Right Properties Panel */}
      <div className={twMerge(
        "tw-border-l tw-bg-white tw-transition-all",
        propertiesCollapsed ? "tw-w-0" : "tw-w-80"
      )}>
        {properties}
      </div>
    </div>
  );
}
```

### Dashboard Grid Layout

```typescript
export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-4">
      {children}
    </div>
  );
}
```

### Page Layout with Header

```typescript
interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ 
  title, 
  description, 
  actions, 
  children 
}: PageLayoutProps) {
  return (
    <div>
      <div className="tw-mb-6">
        <div className="tw-flex tw-items-start tw-justify-between">
          <div>
            <h1 className="tw-text-2xl tw-font-semibold tw-text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="tw-ml-4">{actions}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
```

## Navigation Best Practices

### 1. Consistent Placement
- Primary navigation always in the same location
- Action buttons in predictable positions
- Search accessible from anywhere

### 2. Visual Hierarchy
- Active states clearly visible
- Primary actions emphasized
- Secondary navigation de-emphasized

### 3. Responsive Behavior
- Touch-friendly targets on mobile (min 44px)
- Appropriate navigation patterns per device
- Smooth transitions between breakpoints

### 4. Accessibility
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Skip navigation links