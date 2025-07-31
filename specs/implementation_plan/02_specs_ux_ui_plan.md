Here is the detailed specification for the "Ugly Duckling" phase based on the provided codebase and our discussion.

---

## Technical Specification: Phase 1 - "Ugly Duckling" UI Simplification

**Document Version:** 1.0
**Date:** July 31, 2025
**Author:** Gemini AI Developer

### 1. Introduction & Objective

This document outlines the technical and user experience requirements for the **"Ugly Duckling"** phase. The primary objective is to replace the current complex and partially non-functional UI with a clean, minimalistic, and intuitive interface inspired by modern LLM chat applications (e.g., ChatGPT, Gemini, Claude).

This phase prioritizes usability and lays a scalable foundation for the three core user flows:

1.  **Data Upload & Processing** (Data Studio)
2.  **Context Feature**
3.  **Chat**

The output of this phase will be a visually simple, dark-mode-only application that is highly functional and ready for the implementation of core backend logic in the "Baby Shark" phase.

### 2. Analysis of the Current UI

A review of the existing codebase reveals a UI that is feature-rich in concept but fragmented and difficult to use in its current state.

- **Overall Structure:** The application is a standard multi-page React app using `react-router-dom` (`frontend/src/App.tsx`). Key pages include `/dashboard`, `/projects`, `/projects/:projectId`, and `/canvas/:canvasId`.
- **Projects Dashboard (`/projects`):** The `Projects.tsx` page provides a grid layout for project cards and includes a form for creating new projects. While functional, the styling is basic and inconsistent with the rest of the application.
- **Project Detail (`/projects/:projectId`):** The `ProjectDetail.tsx` page is a central hub for a project, containing sections for file uploads and a list of "Canvases." This is where the core functionality begins to diverge from our new, simplified plan.
- **Canvas Editor (`/canvas/:canvasId`):** The `CanvasEditor.tsx` component represents the most significant complexity. It features a three-panel layout (Block Library, Canvas Area, Properties Panel) with drag-and-drop functionality for text and chart blocks (`DraggableBlock.tsx`). This complex interface is the primary target for simplification in this phase. The Canvas itself is the main source of usability issues, including the "white text on white background" problem.
- **Styling:** Styling is scattered across multiple CSS files (`App.css`, `CanvasEditor.css`, `DraggableBlock.css`, etc.), leading to inconsistencies. There is no unified design system or theme.

### 3. Target State: The "Ugly Duckling" UI

The new UI will pivot away from the multi-page, canvas-centric model to a single-screen, project-focused application.

#### 3.1. Core Layout & Structure

The application will be refactored into a single main view, `ProjectView.tsx`, which will render once a user selects a project.

1.  **Main App Shell (`App.tsx`):**

    - **Layout:** A two-column layout.
    - **Left Column:** A collapsible navigation sidebar.
    - **Right Column:** The main content area, which will render the `ProjectView`.

2.  **Collapsible Navigation Sidebar (`Sidebar.tsx` - New Component):**

    - **Appearance:** Dark grey background (`#202123`), consistent with modern chat UIs.
    - **Expanded State (Default):**
      - **Header:** A "[+] New Project" button at the top.
      - **Content:** A scrollable list of the user's projects. Each item should display the full project name.
      - **Footer:** A user profile section at the bottom showing the user's full name and a settings icon.
    - **Collapsed State:**
      - The sidebar collapses to a smaller width (e.g., 50px).
      - **Header:** Shows only a `+` icon.
      - **Content:** Shows only project icons or initials.
      - **Footer:** Shows only the user's initials.
    - **Interaction:** A dedicated icon allows the user to toggle between collapsed and expanded states. The state should be persisted in `localStorage`.

3.  **Main Project View (`ProjectView.tsx` - New Component):**
    - This component will replace the current `ProjectDetail.tsx` and `CanvasEditor.tsx`.
    - **Header:** Displays the selected project's name prominently at the top. Below the name, a horizontal navigation bar with three tabs.
    - **Tab Navigation:**
      1.  **Data Studio**
      2.  **Context**
      3.  **Chat**
    - **Content Area:** The area below the tabs will render the content of the active tab.

#### 3.2. Styling & Theme

- **Theme:** Dark mode only. The primary background color for the main content area should be `#343541`.
- **Typography:** Use a system font stack. Text color should be a high-contrast off-white (`#ECECF1`). Font sizes should be clean and readable.
- **Simplicity:** No complex shadows, gradients, or animations. The focus is on a clean, minimalistic, and utilitarian aesthetic. Component libraries like **MUI** or **Ant Design** (with their dark themes) are highly recommended to accelerate this.

### 4. UX and UI for Core User Flows

#### 4.1. Data Upload & Processing (Data Studio Tab)

This tab replaces the need for a separate "Data Sources" page and simplifies the data interaction model.

- **Objective:** Allow users to upload, view, and manage project-specific data files.
- **UI Components:**

  1.  **File Upload Area:**
      - A simplified version of the existing `FileUpload.tsx` component will be used.
      - It should be a primary, clearly delineated area on the page.
      - It must support both drag-and-drop and click-to-browse.
  2.  **Uploaded Files List:**
      - Below the upload area, a list of already uploaded files for the selected project.
      - Each list item should display:
        - File icon
        - Filename
        - File size
        - Upload date
        - Action buttons: `Preview` and `Delete`.
  3.  **Data Preview Modal:**
      - Clicking "Preview" will open the existing `DataPreview.tsx` component in a modal window.
      - The styling of this component must be updated to match the new dark theme. All text must be clearly visible.

- **What Needs to Change:**
  - Refactor `ProjectDetail.tsx` to move the file list and `FileUpload.tsx` component into a new `DataStudioTab.tsx` component.
  - The concept of a "Canvas" is removed from this flow entirely. Data is now associated directly with a **Project**.
  - Restyle `DataPreview.tsx` and `FileUpload.tsx` to align with the new dark, minimalistic theme.

#### 4.2. Context Feature (Context Tab)

This tab provides a dedicated space for the project-level context.

- **Objective:** Provide a simple, centralized location for the user to input and save the business context for the selected project.
- **UI Components:**

  1.  **Single Text Area:**
      - A large, multi-line text area that covers most of the tab's content area.
      - It should have a clear label: "Project Context".
      - Placeholder text should guide the user: "Describe your project, data, and business objectives here. This context will be passed to the AI..."
  2.  **Save Button:**
      - A single "Save Context" button.
      - Auto-saving with a debounce is a future enhancement ("Baby Shark"), but for now, a manual save is sufficient.
      - A subtle indicator should confirm that the context has been saved.

- **What Needs to Change:**
  - Create a new `ContextTab.tsx` component.
  - This is a net-new feature and does not replace any existing complex components.

#### 4.3. Chat (Chat Tab)

This is the primary interface for user-AI interaction, replacing the complex Canvas Editor.

- **Objective:** Provide an intuitive, chat-based interface for users to ask questions about their data.
- **UI Components:**

  1.  **Message Display Area:**
      - A scrollable container that displays the conversation history.
      - User messages should be aligned to one side (e.g., right), and AI responses to the other (e.g., left).
      - AI responses that contain code (e.g., Python, SQL) or tables should be rendered in appropriately formatted blocks with syntax highlighting and copy-to-clipboard functionality.
  2.  **Chat Input Form:**
      - A text input field fixed at the bottom of the screen.
      - A "Send" button. Pressing `Enter` should also submit the message (`Shift+Enter` for a new line).
      - The input field should dynamically resize to accommodate multi-line messages.

- **What Needs to Change:**
  - Create a new `ChatTab.tsx` component.
  - This feature completely replaces the `CanvasEditor.tsx`, `DraggableBlock.tsx`, `TextBlock.tsx`, and associated components. These can be deprecated and removed from the routing.

### 5. Summary of Key Changes

- **DEPRECATE:** `CanvasEditor.tsx`, `DraggableBlock.tsx`, `TextBlock.tsx`, `BlockLibrary.tsx`, `PropertiesPanel.tsx`, and their associated CSS.
- **CREATE:**
  - `Sidebar.tsx`: The main collapsible navigation.
  - `ProjectView.tsx`: The new main view container with the three-tab layout.
  - `DataStudioTab.tsx`: To house the file upload and list functionality.
  - `ContextTab.tsx`: For the project context text area.
  - `ChatTab.tsx`: For the user-AI chat interface.
- **REFACTOR & RESTYLE:**
  - `App.tsx`: To implement the new two-column shell layout.
  - `Projects.tsx`: Should be simplified into a list within the new `Sidebar.tsx`.
  - `FileUpload.tsx` and `DataPreview.tsx`: Need to be restyled to match the dark theme.
- **ROUTING:** The routing in `App.tsx` will be simplified. After login, the app will primarily live within the new `ProjectView` component, with the URL reflecting the selected project (e.g., `/project/:projectId`). The active tab can be managed with local state or a URL hash.
