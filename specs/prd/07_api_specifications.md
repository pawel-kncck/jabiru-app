# 6. API Specifications

## 6.1. Overview

This section details the comprehensive REST API that powers the Jabiru application. The API follows RESTful principles and includes all endpoints for core functionality, AI integration, collaboration, and enterprise features.

### 6.1.1. API Design Principles

- **RESTful Architecture:** Resource-based URLs with appropriate HTTP methods
- **Consistent Response Format:** Standardized JSON responses with error handling
- **Versioning:** API versioning through URL path (`/api/v1/`)
- **Authentication:** JWT-based authentication with role-based access control
- **Rate Limiting:** Configurable rate limits per user and endpoint
- **Pagination:** Cursor-based pagination for large result sets
- **Real-time:** WebSocket support for live collaboration features
- **Type Safety:** TypeScript type definitions generated from OpenAPI specification

### 6.1.2. TypeScript Integration

The API provides comprehensive TypeScript support through:

#### 6.1.2.1. Auto-generated Types

```yaml
type_generation:
  source: OpenAPI 3.0 specification
  generator: openapi-typescript
  output: "@jabiru/api-types" npm package
  features:
    - Request/response type definitions
    - Enum types for constants
    - Discriminated unions for polymorphic responses
    - Type-safe error handling
```

#### 6.1.2.2. TypeScript SDK

```typescript
// Example of type-safe API client usage
import { JabiruClient } from '@jabiru/typescript-sdk';
import type { Project, Canvas, ChartGenerationRequest } from '@jabiru/api-types';

const client = new JabiruClient({
  apiKey: process.env.JABIRU_API_KEY,
  baseURL: 'https://api.jabiru.ai/v1'
});

// All methods are fully typed
const project: Project = await client.projects.create({
  name: 'Q4 Analysis',
  description: 'Quarterly financial analysis'
});

// TypeScript ensures correct request structure
const chart = await client.ai.generateChart({
  prompt: 'Show revenue by month',
  dataSourceId: project.dataSources[0].id,
  chartType: 'bar' // Auto-completed enum
} satisfies ChartGenerationRequest);
```

#### 6.1.2.3. Type Definitions Structure

```typescript
// Core domain types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  organizationId: string;
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface CreateProjectResponse {
  success: boolean;
  data: Project;
  meta: ResponseMeta;
}

// Error types
export interface APIError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### 6.1.3. Base URL and Versioning

```
Production: https://api.jabiru.ai/v1
Staging: https://api-staging.jabiru.ai/v1
Development: http://localhost:8000/api/v1
```

### 6.1.4. Authentication

All protected endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### 6.1.5. Standard Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "uuid",
    "pagination": { ... } // if applicable
  }
}
```

### 6.1.6. Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": { ... },
    "request_id": "uuid"
  }
}
```

## 6.2. Core API Endpoints

### 6.2.1. Authentication

- **`POST /auth/register`**
  - **Description:** Register a new user account
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "username": "newuser",
      "password": "securepassword",
      "first_name": "John",
      "last_name": "Doe",
      "organization_name": "Acme Corp" // optional, creates new org
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "username": "newuser",
          "first_name": "John",
          "last_name": "Doe"
        },
        "access_token": "jwt_token",
        "refresh_token": "refresh_token",
        "expires_in": 3600
      }
    }
    ```

- **`POST /auth/login`**
  - **Description:** Authenticate user and return JWT tokens
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "password"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "access_token": "jwt_token",
        "refresh_token": "refresh_token",
        "expires_in": 3600,
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "organization_id": "uuid"
        }
      }
    }
    ```

- **`POST /auth/refresh`**
  - **Description:** Refresh access token using refresh token
  - **Request Body:**
    ```json
    {
      "refresh_token": "refresh_token"
    }
    ```

- **`POST /auth/logout`**
  - **Description:** Invalidate current session
  - **Authentication:** Required

- **`POST /auth/oauth/{provider}`**
  - **Description:** OAuth authentication (Google, Microsoft, GitHub)
  - **Parameters:** `provider` - OAuth provider name
  - **Request Body:**
    ```json
    {
      "code": "oauth_authorization_code",
      "redirect_uri": "https://app.jabiru.ai/auth/callback"
    }
    ```

### 6.2.2. User Management

- **`GET /users/me`**
  - **Description:** Get current user's profile information
  - **Authentication:** Required
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "email": "user@example.com",
        "username": "testuser",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://...",
        "organization_id": "uuid",
        "role": "member",
        "settings": {},
        "created_at": "2024-01-01T10:00:00Z"
      }
    }
    ```

- **`PUT /users/me`**
  - **Description:** Update current user's profile
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://...",
      "settings": {
        "theme": "dark",
        "notifications": {
          "email": true,
          "in_app": true
        }
      }
    }
    ```

- **`POST /users/me/avatar`**
  - **Description:** Upload user avatar image
  - **Authentication:** Required
  - **Request Body:** `multipart/form-data` with image file

### 6.2.3. Organization Management

- **`GET /organizations/me`**
  - **Description:** Get current user's organization details
  - **Authentication:** Required

- **`PUT /organizations/me`**
  - **Description:** Update organization settings (admin only)
  - **Authentication:** Required
  - **Permissions:** Admin role

- **`GET /organizations/me/members`**
  - **Description:** List organization members
  - **Authentication:** Required
  - **Query Parameters:**
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 20)
    - `role`: Filter by role
    - `search`: Search by name or email

- **`POST /organizations/me/members/invite`**
  - **Description:** Invite new member to organization
  - **Authentication:** Required
  - **Permissions:** Admin or member with invite permissions
  - **Request Body:**
    ```json
    {
      "email": "newuser@example.com",
      "role": "member",
      "message": "Welcome to our team!"
    }
    ```

### 6.2.4. Project Management

- **`GET /projects`**
  - **Description:** List user's accessible projects
  - **Authentication:** Required
  - **Query Parameters:**
    - `page`: Page number
    - `limit`: Items per page
    - `filter`: 'owned', 'shared', 'all'
    - `search`: Search by name or description
    - `archived`: Include archived projects (default: false)

- **`POST /projects`**
  - **Description:** Create a new project
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "name": "Q1 Sales Analysis",
      "description": "Comprehensive analysis of Q1 2024 sales data",
      "template_id": "uuid", // optional
      "settings": {
        "visibility": "private"
      }
    }
    ```

- **`GET /projects/{project_id}`**
  - **Description:** Get project details
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`PUT /projects/{project_id}`**
  - **Description:** Update project
  - **Authentication:** Required
  - **Permissions:** Editor or owner

- **`DELETE /projects/{project_id}`**
  - **Description:** Delete project (soft delete)
  - **Authentication:** Required
  - **Permissions:** Owner only

- **`POST /projects/{project_id}/archive`**
  - **Description:** Archive project
  - **Authentication:** Required
  - **Permissions:** Owner only

- **`POST /projects/{project_id}/restore`**
  - **Description:** Restore archived project
  - **Authentication:** Required
  - **Permissions:** Owner only

### 6.2.5. Data Source Management

- **`GET /projects/{project_id}/data-sources`**
  - **Description:** List data sources in project
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`POST /projects/{project_id}/data-sources/upload`**
  - **Description:** Upload CSV file as data source
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:** `multipart/form-data`
    - `file`: CSV file
    - `name`: Data source name
    - `description`: Optional description

- **`POST /projects/{project_id}/data-sources/database`**
  - **Description:** Create database connection
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:**
    ```json
    {
      "name": "Production Database",
      "type": "postgresql",
      "connection_config": {
        "host": "db.example.com",
        "port": 5432,
        "database": "analytics",
        "username": "readonly_user",
        "password": "encrypted_password",
        "ssl": true
      }
    }
    ```

- **`GET /data-sources/{source_id}/preview`**
  - **Description:** Preview data source (first 100 rows)
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`PUT /data-sources/{source_id}`**
  - **Description:** Update data source configuration
  - **Authentication:** Required
  - **Permissions:** Editor or owner

- **`DELETE /data-sources/{source_id}`**
  - **Description:** Delete data source
  - **Authentication:** Required
  - **Permissions:** Editor or owner

### 6.2.6. Canvas Management

- **`GET /projects/{project_id}/canvases`**
  - **Description:** List canvases in project
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`POST /projects/{project_id}/canvases`**
  - **Description:** Create new canvas
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:**
    ```json
    {
      "name": "Q1 Sales Dashboard",
      "description": "Executive overview of Q1 performance",
      "template_id": "uuid", // optional
      "layout": {
        "type": "grid",
        "columns": 12
      }
    }
    ```

- **`GET /canvases/{canvas_id}`**
  - **Description:** Get canvas details and content
  - **Authentication:** Required
  - **Permissions:** Canvas access required

- **`PUT /canvases/{canvas_id}`**
  - **Description:** Update canvas content
  - **Authentication:** Required
  - **Permissions:** Editor access required
  - **Request Body:**
    ```json
    {
      "name": "Updated Canvas Name",
      "blocks": [
        {
          "id": "block_1",
          "type": "chart",
          "position": { "x": 0, "y": 0, "w": 6, "h": 4 },
          "content": { ... }
        }
      ]
    }
    ```

- **`DELETE /canvases/{canvas_id}`**
  - **Description:** Delete canvas
  - **Authentication:** Required
  - **Permissions:** Owner or canvas creator

### 6.2.7. Canvas Sharing & Collaboration

- **`GET /canvases/{canvas_id}/sharing`**
  - **Description:** Get canvas sharing settings
  - **Authentication:** Required
  - **Permissions:** Canvas access required

- **`PUT /canvases/{canvas_id}/sharing`**
  - **Description:** Update canvas sharing settings
  - **Authentication:** Required
  - **Permissions:** Owner or admin
  - **Request Body:**
    ```json
    {
      "visibility": "private", // 'private', 'team', 'public'
      "permissions": [
        {
          "user_id": "uuid",
          "role": "editor"
        }
      ],
      "public_link": {
        "enabled": true,
        "password": "optional_password"
      },
      "embed_settings": {
        "enabled": true,
        "allowed_domains": ["example.com"]
      }
    }
    ```

- **`POST /canvases/{canvas_id}/share`**
  - **Description:** Share canvas with specific users
  - **Authentication:** Required
  - **Permissions:** Owner or admin
  - **Request Body:**
    ```json
    {
      "emails": ["user1@example.com", "user2@example.com"],
      "role": "viewer",
      "message": "Check out this analysis!"
    }
    ```

### 6.2.8. Comments System

- **`GET /canvases/{canvas_id}/comments`**
  - **Description:** Get comments for canvas
  - **Authentication:** Required
  - **Permissions:** Canvas access required

- **`POST /canvases/{canvas_id}/comments`**
  - **Description:** Add comment to canvas
  - **Authentication:** Required
  - **Permissions:** Commenter role or higher
  - **Request Body:**
    ```json
    {
      "content": "Great insights! What about seasonal trends?",
      "block_id": "block_1", // optional, for block-specific comments
      "parent_id": "uuid", // optional, for replies
      "mentions": ["user_uuid"] // optional, for @mentions
    }
    ```

- **`PUT /comments/{comment_id}`**
  - **Description:** Update comment
  - **Authentication:** Required
  - **Permissions:** Comment author only

- **`DELETE /comments/{comment_id}`**
  - **Description:** Delete comment
  - **Authentication:** Required
  - **Permissions:** Comment author or canvas owner

- **`POST /comments/{comment_id}/reactions`**
  - **Description:** Add reaction to comment
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "type": "like" // 'like', 'love', 'laugh', etc.
    }
    ```

## 6.3. AI Integration APIs

### 6.3.1. Context Management

- **`GET /context/organizations/{org_id}`**
  - **Description:** Get organization-wide context
  - **Authentication:** Required

- **`GET /context/projects/{project_id}`**
  - **Description:** Get project-specific context
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`PUT /context/projects/{project_id}`**
  - **Description:** Update project context
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:**
    ```json
    {
      "domain": "ecommerce",
      "metrics": [
        {
          "name": "revenue",
          "formula": "SUM(sales_amount) - SUM(returns)",
          "description": "Net revenue after returns",
          "aliases": ["sales", "income"]
        }
      ],
      "terminology": {
        "customer": ["client", "user", "buyer"]
      },
      "business_rules": [
        {
          "rule": "Only include completed orders",
          "conditions": "status = 'completed'"
        }
      ]
    }
    ```

### 6.3.2. AI-Assisted Generation

- **`POST /ai/generate/chart`**
  - **Description:** Generate chart from natural language
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "prompt": "Show me sales by region as a bar chart",
      "project_id": "uuid",
      "data_source_id": "uuid",
      "context": {} // optional additional context
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "chart_config": {
          "type": "bar",
          "x_axis": "region",
          "y_axis": "total_sales",
          "aggregation": "sum"
        },
        "query": "SELECT region, SUM(sales_amount) as total_sales FROM orders GROUP BY region",
        "explanation": "This bar chart shows total sales by region..."
      }
    }
    ```

- **`POST /ai/generate/table`**
  - **Description:** Generate table from natural language
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "prompt": "Show me top 10 customers by revenue",
      "project_id": "uuid",
      "data_source_id": "uuid"
    }
    ```

- **`POST /ai/generate/narrative`**
  - **Description:** Generate narrative for visualization
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "chart_data": { ... },
      "chart_config": { ... },
      "context": { ... }
    }
    ```

- **`POST /ai/explain`**
  - **Description:** Explain data point or trend
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "data_point": {
        "value": 125.5,
        "metric": "revenue",
        "dimension": "North America"
      },
      "context": { ... }
    }
    ```

### 6.3.3. Query Engine

- **`POST /query/execute`**
  - **Description:** Execute SQL or Python query
  - **Authentication:** Required
  - **Permissions:** Project access required
  - **Request Body:**
    ```json
    {
      "query": "SELECT * FROM sales WHERE date >= '2024-01-01'",
      "query_type": "sql", // 'sql' or 'python'
      "data_source_id": "uuid",
      "parameters": {},
      "cache": true // optional
    }
    ```

- **`GET /query/status/{execution_id}`**
  - **Description:** Get query execution status
  - **Authentication:** Required

- **`GET /query/results/{execution_id}`**
  - **Description:** Get query results
  - **Authentication:** Required
  - **Query Parameters:**
    - `format`: 'json', 'csv', 'parquet'
    - `limit`: Max rows to return
    - `offset`: Pagination offset

- **`POST /query/validate`**
  - **Description:** Validate query syntax
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "query": "SELECT * FROM invalid_table",
      "query_type": "sql",
      "data_source_id": "uuid"
    }
    ```

## 6.4. Data Pipeline APIs

### 6.4.1. Pipeline Management

- **`GET /projects/{project_id}/pipelines`**
  - **Description:** List ETL pipelines in project
  - **Authentication:** Required
  - **Permissions:** Project access required

- **`POST /projects/{project_id}/pipelines`**
  - **Description:** Create new ETL pipeline
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:**
    ```json
    {
      "name": "Daily Sales Sync",
      "description": "Sync daily sales data from CRM",
      "source_id": "uuid",
      "pipeline_config": {
        "steps": [
          {
            "type": "extract",
            "config": { ... }
          },
          {
            "type": "transform",
            "config": { ... }
          },
          {
            "type": "load",
            "config": { ... }
          }
        ]
      },
      "schedule": {
        "cron": "0 6 * * *", // Daily at 6 AM
        "timezone": "America/New_York"
      },
      "notifications": {
        "on_success": ["email"],
        "on_failure": ["email", "slack"]
      }
    }
    ```

- **`PUT /pipelines/{pipeline_id}`**
  - **Description:** Update pipeline configuration
  - **Authentication:** Required
  - **Permissions:** Editor or owner

- **`POST /pipelines/{pipeline_id}/run`**
  - **Description:** Trigger manual pipeline run
  - **Authentication:** Required
  - **Permissions:** Editor or owner

- **`GET /pipelines/{pipeline_id}/runs`**
  - **Description:** Get pipeline execution history
  - **Authentication:** Required
  - **Query Parameters:**
    - `limit`: Max results (default: 50)
    - `status`: Filter by status
    - `start_date`: Filter by start date
    - `end_date`: Filter by end date

- **`GET /pipelines/{pipeline_id}/runs/{run_id}`**
  - **Description:** Get specific pipeline run details
  - **Authentication:** Required

- **`GET /pipelines/{pipeline_id}/runs/{run_id}/logs`**
  - **Description:** Get pipeline run logs
  - **Authentication:** Required

### 6.4.2. Data Quality

- **`GET /pipelines/{pipeline_id}/quality-rules`**
  - **Description:** Get data quality rules for pipeline
  - **Authentication:** Required

- **`PUT /pipelines/{pipeline_id}/quality-rules`**
  - **Description:** Update data quality rules
  - **Authentication:** Required
  - **Permissions:** Editor or owner
  - **Request Body:**
    ```json
    {
      "rules": [
        {
          "name": "Completeness Check",
          "type": "not_null",
          "columns": ["customer_id", "order_date"],
          "threshold": 100,
          "action": "stop_pipeline"
        },
        {
          "name": "Range Check",
          "type": "range",
          "column": "order_amount",
          "min": 0,
          "max": 100000,
          "action": "log_warning"
        }
      ]
    }
    ```

## 6.5. Real-time Collaboration APIs

### 6.5.1. WebSocket Events

- **Connection:** `wss://api.jabiru.ai/v1/ws/{canvas_id}?token={jwt_token}`

- **Event Types:**
  ```json
  // User joins canvas
  {
    "type": "user_joined",
    "data": {
      "user_id": "uuid",
      "user_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
  
  // User leaves canvas
  {
    "type": "user_left",
    "data": {
      "user_id": "uuid"
    }
  }
  
  // Cursor movement
  {
    "type": "cursor_move",
    "data": {
      "user_id": "uuid",
      "x": 150,
      "y": 200
    }
  }
  
  // Canvas block updated
  {
    "type": "block_updated",
    "data": {
      "block_id": "block_1",
      "changes": { ... },
      "user_id": "uuid",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
  
  // Comment added
  {
    "type": "comment_added",
    "data": {
      "comment": { ... },
      "user_id": "uuid"
    }
  }
  ```

### 6.5.2. Presence Management

- **`GET /canvases/{canvas_id}/presence`**
  - **Description:** Get currently active users on canvas
  - **Authentication:** Required

- **`POST /canvases/{canvas_id}/presence`**
  - **Description:** Update user presence (heartbeat)
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "cursor": { "x": 150, "y": 200 },
      "selection": "block_1",
      "status": "active" // 'active', 'idle', 'away'
    }
    ```

## 6.6. Version Control APIs

### 6.6.1. Version Management

- **`GET /canvases/{canvas_id}/versions`**
  - **Description:** Get canvas version history
  - **Authentication:** Required
  - **Query Parameters:**
    - `limit`: Max versions to return
    - `author`: Filter by author
    - `from_date`: Filter by date range

- **`POST /canvases/{canvas_id}/versions`**
  - **Description:** Create new version/snapshot
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "message": "Added revenue comparison chart",
      "tag": "milestone", // optional
      "auto_generated": false
    }
    ```

- **`GET /canvases/{canvas_id}/versions/{version_id}`**
  - **Description:** Get specific version details
  - **Authentication:** Required

- **`POST /canvases/{canvas_id}/versions/{version_id}/restore`**
  - **Description:** Restore canvas to specific version
  - **Authentication:** Required
  - **Permissions:** Editor or owner

- **`GET /canvases/{canvas_id}/versions/compare`**
  - **Description:** Compare two versions
  - **Authentication:** Required
  - **Query Parameters:**
    - `version_a`: First version ID
    - `version_b`: Second version ID

### 6.6.2. Branch Management (Advanced)

- **`POST /canvases/{canvas_id}/branches`**
  - **Description:** Create new branch from version
  - **Authentication:** Required
  - **Request Body:**
    ```json
    {
      "name": "experimental-charts",
      "description": "Testing new chart types",
      "source_version": "uuid"
    }
    ```

- **`GET /canvases/{canvas_id}/branches`**
  - **Description:** List canvas branches
  - **Authentication:** Required

- **`POST /canvases/{canvas_id}/branches/{branch_id}/merge`**
  - **Description:** Merge branch into main
  - **Authentication:** Required
  - **Permissions:** Editor or owner

## 6.7. Analytics & Monitoring APIs

### 6.7.1. Usage Analytics

- **`GET /analytics/usage`**
  - **Description:** Get usage analytics for organization
  - **Authentication:** Required
  - **Permissions:** Admin role
  - **Query Parameters:**
    - `start_date`: Start date for analytics
    - `end_date`: End date for analytics
    - `granularity`: 'hour', 'day', 'week', 'month'

- **`GET /analytics/users/{user_id}/activity`**
  - **Description:** Get user activity analytics
  - **Authentication:** Required
  - **Permissions:** Admin or self

- **`GET /analytics/projects/{project_id}/metrics`**
  - **Description:** Get project analytics
  - **Authentication:** Required
  - **Permissions:** Project access required

### 6.7.2. Performance Monitoring

- **`GET /monitoring/health`**
  - **Description:** Health check endpoint
  - **Authentication:** Not required
  - **Response:**
    ```json
    {
      "status": "healthy",
      "timestamp": "2024-01-15T10:30:00Z",
      "version": "1.0.0",
      "services": {
        "database": "healthy",
        "redis": "healthy",
        "ai_service": "healthy"
      }
    }
    ```

- **`GET /monitoring/metrics`**
  - **Description:** System metrics (admin only)
  - **Authentication:** Required
  - **Permissions:** Admin role

## 6.8. Enterprise APIs

### 6.8.1. SSO Configuration

- **`GET /admin/sso`**
  - **Description:** Get SSO configuration
  - **Authentication:** Required
  - **Permissions:** Admin role

- **`PUT /admin/sso`**
  - **Description:** Update SSO configuration
  - **Authentication:** Required
  - **Permissions:** Admin role
  - **Request Body:**
    ```json
    {
      "provider": "saml",
      "config": {
        "entity_id": "jabiru-production",
        "sso_url": "https://idp.company.com/saml",
        "certificate": "-----BEGIN CERTIFICATE-----..."
      },
      "attribute_mapping": {
        "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        "first_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
      }
    }
    ```

### 6.8.2. Audit Logs

- **`GET /admin/audit-logs`**
  - **Description:** Get audit logs
  - **Authentication:** Required
  - **Permissions:** Admin role
  - **Query Parameters:**
    - `user_id`: Filter by user
    - `action`: Filter by action type
    - `resource_type`: Filter by resource type
    - `start_date`: Date range start
    - `end_date`: Date range end
    - `limit`: Max results (default: 100)

- **`GET /admin/audit-logs/export`**
  - **Description:** Export audit logs
  - **Authentication:** Required
  - **Permissions:** Admin role
  - **Query Parameters:**
    - `format`: 'csv', 'json'
    - Same filters as audit-logs endpoint

## 6.9. Error Codes

### 6.9.1. HTTP Status Codes

- **200 OK:** Request successful
- **201 Created:** Resource created successfully
- **204 No Content:** Request successful, no content to return
- **400 Bad Request:** Invalid request format or parameters
- **401 Unauthorized:** Authentication required or invalid
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity:** Validation errors
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error
- **503 Service Unavailable:** Service temporarily unavailable

### 6.9.2. Application Error Codes

```yaml
authentication_errors:
  AUTH_001: "Invalid credentials"
  AUTH_002: "Account locked"
  AUTH_003: "Token expired"
  AUTH_004: "Token invalid"
  AUTH_005: "MFA required"

authorization_errors:
  AUTHZ_001: "Insufficient permissions"
  AUTHZ_002: "Resource not accessible"
  AUTHZ_003: "Organization access denied"

validation_errors:
  VAL_001: "Required field missing"
  VAL_002: "Invalid field format"
  VAL_003: "Field length exceeded"
  VAL_004: "Invalid file type"
  VAL_005: "File size exceeded"

resource_errors:
  RES_001: "Project not found"
  RES_002: "Canvas not found"
  RES_003: "Data source not found"
  RES_004: "User not found"

business_logic_errors:
  BIZ_001: "Project limit exceeded"
  BIZ_002: "Storage quota exceeded"
  BIZ_003: "Query timeout"
  BIZ_004: "Pipeline execution failed"

system_errors:
  SYS_001: "Database connection failed"
  SYS_002: "External service unavailable"
  SYS_003: "AI service error"
  SYS_004: "File processing failed"
```

## 6.10. Rate Limiting

### 6.10.1. Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642262400
X-RateLimit-Window: 3600
```

### 6.10.2. Rate Limit Tiers

```yaml
rate_limits:
  free_tier:
    requests_per_hour: 1000
    ai_requests_per_hour: 100
    file_uploads_per_day: 10
    
  professional:
    requests_per_hour: 10000
    ai_requests_per_hour: 1000
    file_uploads_per_day: 100
    
  enterprise:
    requests_per_hour: 100000
    ai_requests_per_hour: 10000
    file_uploads_per_day: 1000
    
  special_endpoints:
    auth_attempts: 5 per 15 minutes
    password_reset: 3 per hour
    file_upload: 1 per minute per file
```

This comprehensive API specification provides complete coverage of all Jabiru features while maintaining consistency with the technical architecture and user flows.
