# 2. Features

This section details the core features of the Jabiru application, categorized by user workflow. Each feature includes a description of its purpose and the criteria by which its successful implementation will be measured.

## 2.1. Core Platform & User Management

These features form the foundation of the application, ensuring a secure and personalized user experience.

### **2.1.0. Context Feature (AI Business Understanding)**

- **Description:** The core differentiating feature that enables Jabiru's AI to understand the user's specific business domain, metrics, and terminology. This creates a foundation for intelligent analysis, accurate chart generation, and contextually relevant insights across all features.
- **Acceptance Criteria:**
  - **Initial Context Setup:** New users complete a guided 5-step setup process that teaches Jabiru about their business domain, key metrics, data relationships, and analysis goals.
  - **Business Domain Configuration:** Users can specify their industry, business model, key performance indicators, and important business relationships.
  - **Metric Definitions:** Users can define custom business metrics with formulas, aggregation rules (SUM, AVERAGE, RECOMPUTE), and business logic.
  - **Terminology Management:** The system learns and stores business-specific terminology, ensuring AI responses use familiar language.
  - **Context Evolution:** The AI continuously learns from user interactions, improving suggestions and analysis quality over time.
  - **Cross-Project Context:** Business context can be shared across projects within an organization, maintaining consistency.
  - **Context Versioning:** Changes to business context are tracked with the ability to revert to previous configurations.
  - **Smart Defaults:** The AI applies business context automatically when generating charts, tables, and insights without user intervention.

### **2.1.1. First-Time User Experience (60-Second Onboarding)**

- **Description:** A streamlined onboarding flow designed to get new users from landing page to their first meaningful insight in under 60 seconds, showcasing Jabiru's value immediately.
- **Acceptance Criteria:**
  - **Welcome Screen:** New users see a personalized welcome screen with clear value proposition and next steps.
  - **Quick Setup Flow:** Users complete essential setup (name, role, company) in under 30 seconds.
  - **Sample Data Option:** Users can choose to explore with sample data or upload their own CSV file.
  - **Guided Analysis:** The system guides users through creating their first chart using natural language prompts.
  - **Success Moment:** Users successfully generate a meaningful visualization within 60 seconds of registration.
  - **Progressive Disclosure:** Advanced features are revealed gradually as users demonstrate readiness.
  - **Onboarding Analytics:** System tracks onboarding completion rates and time-to-first-value metrics.
  - **Skip Options:** Experienced users can skip onboarding steps with clear escape paths.

### **2.1.2. Secure User Authentication**

- **Description:** Provides a complete and secure system for users to register, log in, and manage their accounts. This is the entry point to the entire application, protecting all user data and projects.
- **Acceptance Criteria:**
  - Users can register for a new account with a unique username and a securely hashed password.
  - Registered users can log in to receive a JSON Web Token (JWT) for session management.
  - All API endpoints related to user-specific data (projects, canvases) are protected and require a valid JWT.
  - Users can navigate to an "Account" page to update their first and last name.
  - Users can log out, which invalidates their session token.

### **2.1.3. Project-Based Workspace**

- **Description:** Enables users to organize their work into distinct projects. Each project acts as a container for related data sources and analysis canvases, creating a structured and manageable workspace.
- **Acceptance Criteria:**
  - Authenticated users can create a new project by providing a name and an optional description.
  - A user's projects are listed in a persistent sidebar for easy navigation.
  - Each project is owned by the user who created it, and cannot be accessed by other users unless explicitly shared.
  - Clicking a project opens a dedicated detail view for that project.

## 2.2. Data Management & Preparation (Data Studio)

This group of features focuses on getting data into Jabiru and preparing it for analysis. The goal is to automate the mundane and time-consuming tasks of data cleaning and structuring.

### **2.2.1. CSV Data Upload**

- **Description:** Allows users to upload CSV files directly into a project. This is the primary method for adding new data sources to the application.
- **Acceptance Criteria:**
  - Within a project's "Data" tab, a user can select and upload a CSV file.
  - The uploaded file is associated with the current project.
  - The system can handle files up to 1GB and shows a progress indicator during upload.
  - Uploaded files are listed in the "Data Sources" view within their project.

### **2.2.2. AI-Powered Data Profiling & Cleaning**

- **Description:** Automates the initial analysis of uploaded data. Jabiru will intelligently inspect the data to suggest data types and identify common issues, drastically reducing the manual effort required for data preparation.
- **Acceptance Criteria:**
  - Upon upload, the system automatically detects column data types (e.g., string, number, date) with at least 90% accuracy.
  - A preview of the data (first 100 rows) is displayed to the user.
  - The UI allows the user to override or correct the AI-suggested data types for any column.
  - The system heuristically detects wide-format data (e.g., months as columns) and suggests a one-click "unpivot" transformation.

### **2.2.3. Automated ETL and Data Refresh**

- **Description:** Turns the user-defined mappings and cleaning steps into a repeatable pipeline. This allows for scheduled data refreshes, ensuring that analyses are always based on the latest information without manual intervention.
- **Acceptance Criteria:**
  - **Pipeline Creation:** User-defined mappings can be saved as repeatable ETL pipeline with visual workflow builder.
  - **Flexible Scheduling:** Pipelines can be run manually or scheduled (hourly, daily, weekly, custom cron expressions).
  - **Event-Triggered Pipelines:** Pipelines can be triggered by file uploads, API calls, or data changes.
  - **Data Quality Monitoring:** Automated data quality checks with configurable rules and thresholds.
  - **Pipeline Monitoring:** Real-time monitoring dashboard showing run history, status, performance metrics, and errors.
  - **Error Handling:** Automatic retry mechanisms with exponential backoff and dead letter queues.
  - **Notifications:** Comprehensive alerting via email, in-app notifications, and Slack integration.
  - **Pipeline Versioning:** Version control for pipeline configurations with rollback capabilities.
  - **Resource Management:** Automatic scaling of compute resources based on pipeline complexity and data volume.
  - **Cost Optimization:** Intelligent resource allocation and cost tracking per pipeline.

### **2.2.4. Advanced Data Connections**

- **Description:** Comprehensive data connectivity supporting databases, APIs, cloud storage, and real-time streaming sources with enterprise-grade security and performance.
- **Acceptance Criteria:**
  - **Database Connections:** Support for PostgreSQL, MySQL, SQL Server, Oracle, MongoDB, Snowflake, BigQuery, Redshift.
  - **Cloud Storage:** Integration with AWS S3, Azure Blob Storage, Google Cloud Storage.
  - **API Integrations:** REST and GraphQL API connections with authentication and rate limiting.
  - **Streaming Data:** Real-time data ingestion from Kafka, Kinesis, and other streaming platforms.
  - **SaaS Connectors:** Pre-built connectors for Salesforce, HubSpot, Google Analytics, Facebook Ads, etc.
  - **Security:** Encrypted connections, credential management, VPC/firewall support.
  - **Performance:** Connection pooling, query optimization, and caching for improved performance.
  - **Data Lineage:** Automatic tracking of data flow from source to visualization.

## 2.3. Analysis & Visualization (Analysis Composer)

These features provide the interactive canvas where users explore their data, build visualizations, and discover insights. The experience is designed to be beautiful, intuitive, and incredibly fast.

### **2.3.1. Interactive Analysis Canvas**

- **Description:** A flexible, grid-based canvas where users can create and arrange various analytical components. Canvases are stored in MongoDB to allow for a flexible, JSON-based structure. This is the core workspace for building an analysis.
- **Acceptance Criteria:**
  - Users can create a new, named canvas within a project.
  - All canvases for a project are listed in the "Canvases" tab.
  - The full CRUD (Create, Read, Update, Delete) functionality for canvases is implemented.
  - The canvas supports adding, resizing, and repositioning content blocks.

### **2.3.2. AI-Assisted Chart Generation**

- **Description:** Enables users to create rich visualizations using natural language prompts. The AI interprets the user's request, selects an appropriate chart type, and renders it on the canvas, applying the correct business logic from the metadata graph.
- **Acceptance Criteria:**
  - A prompt bar allows users to type queries like "bar chart of sales by month."
  - The LLM translates the query into a valid chart specification (e.g., chart type, x-axis, y-axis).
  - The resulting chart is rendered on the canvas instantly.
  - The system correctly applies predefined aggregation rules (e.g., SUM, AVERAGE, RECOMPUTE) when generating charts.

### **2.3.3. AI-Assisted Table Generation**

- **Description:** Allows for the quick creation of tabular data summaries through natural language. Users can request specific cuts of data without needing to manually configure pivot tables.
- **Acceptance Criteria:**
  - Users can prompt for tabular data, such as "show me revenue and profit by country."
  - The system generates a table with the requested dimensions and metrics.
  - Tables correctly reflect the aggregation logic and formatting defined in the metadata.

### **2.3.4. AI-Generated Narrative & Insights**

- **Description:** Automatically generates plain-language summaries and insights for any visualization. Every number in the narrative is linked back to the data, making the analysis transparent and trustworthy.
- **Acceptance Criteria:**
  - **Automatic Narrative Generation:** When a chart or table is created, a concise text summary is automatically generated below it.
  - **Linked Data Points:** Numeric values within the narrative are clickable links to the corresponding data points in the visual.
  - **Interactive Highlighting:** Hovering over a linked number in the text highlights the relevant part of the chart or table.
  - **Drill-down Explanations:** The AI can be prompted to "Explain" a specific data point or trend, generating a more detailed narrative.
  - **Context-Aware Insights:** The AI leverages business context to provide relevant interpretations and recommendations.
  - **Comparative Analysis:** The system automatically identifies and explains notable trends, outliers, and comparisons.
  - **Action-Oriented Recommendations:** Narratives include specific, actionable business recommendations where appropriate.
  - **Multi-Language Support:** Narratives can be generated in multiple languages based on user preferences.

### **2.3.5. Advanced Analytics & Data Science**

- **Description:** Provides sophisticated analytical capabilities including statistical analysis, forecasting, and machine learning insights accessible through natural language interfaces.
- **Acceptance Criteria:**
  - **Statistical Analysis:** Users can request statistical tests, correlations, and significance testing through natural language.
  - **Forecasting:** The system provides time series forecasting with confidence intervals and scenario analysis.
  - **Anomaly Detection:** Automatic identification of outliers and unusual patterns in data.
  - **Cohort Analysis:** Built-in support for customer cohort analysis and retention studies.
  - **A/B Testing:** Integrated A/B test analysis with statistical significance calculations.
  - **Predictive Modeling:** Simple machine learning models accessible through conversational interface.
  - **What-If Scenarios:** Users can model different business scenarios and see projected outcomes.

## 2.4. Collaboration & Sharing

These features transform the canvas from a personal workspace into a collaborative hub for teams to discuss and iterate on analysis.

### **2.4.1. Real-time Collaboration**

- **Description:** Enables multiple users to work simultaneously on the same canvas with live synchronization, presence indicators, and conflict resolution. This transforms analysis from a solo activity into a collaborative team effort.
- **Acceptance Criteria:**
  - **Live Presence:** Users see who else is currently viewing or editing a canvas with real-time presence indicators.
  - **Cursor Tracking:** Collaborators can see each other's mouse cursors and selections in real-time.
  - **Simultaneous Editing:** Multiple users can edit different parts of the canvas simultaneously without conflicts.
  - **Change Synchronization:** All changes are instantly synchronized across all connected users within 100ms.
  - **Conflict Resolution:** When users edit the same element simultaneously, the system handles conflicts gracefully with merge strategies.
  - **Live Comments:** Comments and discussions appear in real-time for all collaborators.
  - **Connection Management:** System handles network interruptions gracefully with automatic reconnection and state synchronization.
  - **Bandwidth Optimization:** Real-time updates are efficiently transmitted using operational transformation or conflict-free replicated data types (CRDTs).

### **2.4.2. Canvas Sharing & Permissions**

- **Description:** Enables the owner of a canvas to share it with other users and assign specific roles, ensuring that collaborators have the appropriate level of access.
- **Acceptance Criteria:**
  - A canvas owner can share a canvas with another registered user via a unique link or invitation.
  - **Public Sharing:** Users can create public links for view-only access without requiring recipient registration.
  - **Embedded Views:** Canvases can be embedded in external websites with customizable viewing options.
  - The following roles can be assigned:
    - **Viewer:** Can view the canvas but cannot make any changes or comments.
    - **Commenter:** Can view the canvas and add comments, but cannot make edits.
    - **Editor:** Can view, comment on, and edit the canvas content (charts, text). Cannot access or modify underlying data sources.
    - **Full Access:** Has full editor rights and can also access the underlying project to view and manipulate data sources.
  - The sharing interface is intuitive and allows owners to easily manage and revoke access.
  - **Team Workspaces:** Organizations can create shared workspaces where all members have default access to projects and canvases.

### **2.4.3. Canvas Comments**

- **Description:** Allows users with the appropriate permissions to leave comments directly on the canvas or on specific blocks within it, facilitating discussion and feedback.
- **Acceptance Criteria:**
  - Users with "Commenter" roles or higher can add comments to any block on the canvas.
  - Comments are displayed in a threaded view.
  - Users can be @mentioned in comments to trigger in-app notifications.

### **2.4.4. Version Control & History**

- **Description:** Provides a change log for each canvas, allowing users to track edits over time and revert to previous versions. This ensures that no work is accidentally lost and provides a clear audit trail.
- **Acceptance Criteria:**
  - **Phase 1 (MVP):** "Undo" and "Redo" buttons are available on the canvas, allowing users to step backward and forward through their recent changes within a session.
  - **Phase 2 (Long-term):** A full version history is available for each canvas, showing a log of saved changes with timestamps and authors.
  - Users can view and restore any previous version of the canvas.
  - **Advanced Version Control:** Git-like branching and merging capabilities for complex collaboration scenarios.
  - **Conflict Resolution:** Intelligent merge tools for handling simultaneous edits to the same canvas elements.

## 2.5. Enterprise & Administration

These features provide the governance, security, and management capabilities required for enterprise deployments.

### **2.5.1. Organization & Team Management**

- **Description:** Comprehensive tools for managing organizations, teams, roles, and permissions at scale with enterprise-grade security and compliance features.
- **Acceptance Criteria:**
  - **Organization Setup:** Administrators can create and configure organizations with custom branding and settings.
  - **Team Hierarchies:** Support for nested teams and departments with inherited permissions.
  - **Role-Based Access Control (RBAC):** Granular permission system with custom roles and capabilities.
  - **Single Sign-On (SSO):** Integration with SAML, OAuth, and enterprise identity providers.
  - **Multi-Factor Authentication:** Mandatory 2FA options including TOTP, SMS, and hardware tokens.
  - **User Provisioning:** Automated user provisioning and deprovisioning via SCIM protocol.
  - **Audit Logging:** Comprehensive audit trails for all user actions and system changes.
  - **Compliance:** Built-in support for SOC 2, GDPR, HIPAA, and other regulatory requirements.

### **2.5.2. Data Governance & Security**

- **Description:** Enterprise-grade data governance tools ensuring data security, privacy, and compliance across all organizational data assets.
- **Acceptance Criteria:**
  - **Data Classification:** Automatic and manual data classification with sensitivity labels.
  - **Access Controls:** Fine-grained data access controls at row, column, and cell levels.
  - **Data Masking:** Automatic PII detection and masking for non-production environments.
  - **Encryption:** End-to-end encryption for data at rest and in transit.
  - **Data Lineage:** Complete tracking of data flow from source to consumption.
  - **Privacy Controls:** Data retention policies and right-to-be-forgotten compliance.
  - **Data Quality:** Organization-wide data quality metrics and monitoring.
  - **Compliance Reporting:** Automated compliance reports for various regulatory frameworks.

### **2.5.3. Platform Administration**

- **Description:** Administrative tools for managing the Jabiru platform, monitoring system health, and optimizing performance across the organization.
- **Acceptance Criteria:**
  - **System Monitoring:** Real-time dashboards for system health, performance, and usage metrics.
  - **Resource Management:** Tools for managing compute resources, storage, and costs.
  - **User Analytics:** Insights into user behavior, feature adoption, and engagement.
  - **Performance Optimization:** Automated optimization suggestions and resource scaling.
  - **Backup & Recovery:** Automated backup systems with point-in-time recovery capabilities.
  - **Integration Management:** Central hub for managing all third-party integrations and APIs.
  - **Custom Branding:** White-label options with custom logos, colors, and domain names.
  - **Support Tools:** Built-in support ticketing and diagnostic tools for troubleshooting.

## 2.6. Mobile & Accessibility

These features ensure Jabiru is accessible across all devices and to users with different abilities.

### **2.6.1. Mobile Experience**

- **Description:** Native mobile applications and responsive web experience optimized for analysis and collaboration on mobile devices.
- **Acceptance Criteria:**
  - **Native Apps:** iOS and Android native applications with core functionality.
  - **Responsive Design:** Web interface adapts seamlessly to mobile and tablet screens.
  - **Touch Optimization:** Gesture-based navigation and touch-friendly interactions.
  - **Offline Mode:** Limited offline functionality with sync when connection is restored.
  - **Push Notifications:** Mobile notifications for comments, shares, and pipeline alerts.
  - **Mobile Sharing:** Easy sharing of insights via native mobile sharing mechanisms.

### **2.6.2. Accessibility & Internationalization**

- **Description:** Comprehensive accessibility features ensuring Jabiru is usable by people with disabilities and supports global audiences.
- **Acceptance Criteria:**
  - **Screen Reader Support:** Full compatibility with JAWS, NVDA, and VoiceOver.
  - **Keyboard Navigation:** Complete keyboard navigation without mouse dependency.
  - **Color Accessibility:** Colorblind-friendly palettes and high contrast modes.
  - **Text Scaling:** Support for large text and zoom up to 200%.
  - **Multi-Language:** Interface translation for major global languages.
  - **Localization:** Regional number, date, and currency formatting.
  - **WCAG Compliance:** Full WCAG 2.1 AA compliance across all features.
