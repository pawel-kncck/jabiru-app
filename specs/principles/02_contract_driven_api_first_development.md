# Agent Directive: Contract-Driven & API-First Development

## 1. Core Principle

For the Impala project, we follow a **Contract-Driven** and **API-First** development methodology. This means the API is the central product, and its design precedes implementation. The formal API contract is the **single source of truth** for all communication between services.

Your primary directive is to always build and validate code against this contract.

---

## 2. The API-First Philosophy

**API-First** means we design the API from the perspective of the consumer (e.g., the frontend or another service) _before_ we write any backend code.

- **DO NOT** build backend logic first and then expose it via an API.
- **DO** define the API's endpoints, request/response data, and authentication first.

**Practical Implication for You:**
Before implementing a new feature, you must first define or update the `openapi.yaml` specification for the relevant service. This design-first approach enables parallel development and ensures the final product meets the needs of its consumers.

---

## 3. The API Contract: OpenAPI 3.0

The **API Contract** is a machine-readable `openapi.yaml` file that formalizes the API design. It is not just documentation; it is a binding agreement that dictates how services interact.

### 3.1. Example: Defining a "Create Project" Endpoint

Below is a practical example of how to define a new endpoint in an `openapi.yaml` file. This contract provides all the necessary information for a frontend, a backend, and a testing suite.

```yaml
# openapi.yaml for the Project Service

openapi: 3.0.3
info:
  title: Impala Project Service
  version: 1.0.0

paths:
  /projects:
    post:
      summary: Create a new project
      operationId: createProject
      tags:
        - projects
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProjectRequest'
      responses:
        '201':
          description: Project created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectResponse'
        '400':
          description: Invalid input provided
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    # Schema for the request body (what the client sends)
    CreateProjectRequest:
      type: object
      properties:
        name:
          type: string
          description: The name of the new project.
          example: 'Q4 Sales Analysis'
        description:
          type: string
          description: An optional description for the project.
      required:
        - name

    # Schema for the successful response (what the server sends back)
    ProjectResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        ownerId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time

    # Schema for error responses
    ErrorResponse:
      type: object
      properties:
        code:
          type: string
          example: 'VALIDATION_ERROR'
        message:
          type: string
          example: 'Project name is required.'
```
