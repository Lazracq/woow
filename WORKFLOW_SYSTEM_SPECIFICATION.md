# Workflow Management System Specification

## Overview

A comprehensive web application for defining, executing, and monitoring workflows with a drag-and-drop interface. The system supports various task types, global variables, multiple trigger mechanisms, and detailed execution monitoring.

## Architecture

### Backend (Clean Architecture Pattern)
- **Domain Layer**: Core business entities and logic
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External services, database, file storage
- **Web API Layer**: RESTful endpoints and controllers

### Frontend (React + TypeScript)
- **Components**: Reusable UI components with proper abstraction
- **Hooks**: Custom hooks for data management and business logic
- **Services**: API communication layer
- **State Management**: Context API or Redux for global state

### Database (PostgreSQL)
- **Workflow Definitions**: Workflow metadata and structure
- **Task Configurations**: Task-specific settings and parameters
- **Execution History**: Complete audit trail of workflow runs
- **Variables**: Global and system variables storage

## Core Features

### 1. Workflow Definition

#### Task Types
- **HTTP Callout**
  - Basic Authentication
  - OAuth2 Client Credentials
  - API Key Authentication
  - Configurable headers, body, timeout
  - Response parsing (JSON, XML, CSV)

- **Script Execution**
  - C# (.NET Core runtime)
  - JavaScript (Node.js runtime)
  - Python (isolated environment)
  - Bash (system commands)
  - SQL (database queries)
  - Output formats: CSV, JSONL, JSON, XML

- **Data Transformation**
  - XML to JSON/CSV
  - JSON to XML/CSV
  - CSV to JSON/XML
  - Custom transformation rules

- **External Storage Push**
  - SFTP (file upload)
  - AWS S3 (object storage)
  - Azure Blob Storage
  - Google Cloud Storage
  - Configurable authentication and paths

- **Control Flow**
  - Conditional steps (if/else logic)
  - Batching steps (process multiple items)
  - Iteration steps (loops)
  - Parallel execution
  - Error handling and retry logic

#### Variables System
- **Global Variables**: User-defined variables accessible across all tasks
- **System Variables**: 
  - `{{workflow.name}}`
  - `{{workflow.id}}`
  - `{{execution.id}}`
  - `{{timestamp}}`
  - `{{today.date}}`
  - `{{today.time}}`
  - `{{user.id}}`
  - `{{environment}}`

### 2. Workflow Designer

#### Drag-and-Drop Interface
- **Canvas**: Infinite scroll/zoom workspace
- **Task Palette**: Categorized task types
- **Connection Lines**: Visual task dependencies
- **Task Properties Panel**: Configuration interface
- **Validation**: Real-time workflow validation

#### UI Components
- **Task Nodes**: Visual representation of each task type
- **Connection Handles**: Input/output ports
- **Property Forms**: Dynamic forms based on task type
- **Variable Editor**: Global variables management
- **Preview Mode**: Workflow visualization

### 3. Workflow Triggers

#### Manual Execution
- **One-time execution**
- **Test mode** (with sample data)
- **Dry run** (validation only)

#### Scheduled Execution (Cron)
- **Cron expressions** support
- **Timezone** configuration
- **Enable/disable** scheduling
- **Execution limits** (max concurrent, retry attempts)

#### Webhook Triggers
- **REST API endpoints**
- **Authentication** (API key, JWT)
- **Payload validation**
- **Rate limiting**
- **Event filtering**

### 4. Execution Monitoring

#### Real-time Dashboard
- **Active executions** list
- **Execution status** (Running, Completed, Failed, Cancelled)
- **Progress indicators**
- **Performance metrics**

#### Execution Details
- **Step-by-step** execution log
- **Input/Output** data for each task
- **Error details** with stack traces
- **Execution time** per step
- **Resource usage** (CPU, memory)

#### History Management
- **Configurable retention** policies
- **Data archiving** strategies
- **Search and filter** capabilities
- **Export functionality**

## Technical Implementation

### Security Considerations
- **Input sanitization** for all user inputs
- **SQL injection prevention** with parameterized queries
- **XSS protection** in web interface
- **Authentication and authorization** (JWT tokens)
- **API rate limiting**
- **Secure storage** of credentials
- **Audit logging** for sensitive operations

### Performance Optimizations
- **Database indexing** on frequently queried fields
- **Caching** for workflow definitions and variables
- **Async processing** for long-running tasks
- **Connection pooling** for database and external services
- **Batch processing** for multiple items
- **Resource cleanup** for completed executions

### Scalability
- **Horizontal scaling** support
- **Load balancing** for webhook endpoints
- **Database sharding** strategy
- **Message queues** for task execution
- **Microservices** architecture readiness

## Database Schema

### Core Tables
```sql
-- Workflows
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL,
    variables JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Executions
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id),
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    triggered_by VARCHAR(50),
    trigger_data JSONB,
    created_by UUID REFERENCES users(id)
);

-- Execution Steps
CREATE TABLE execution_steps (
    id UUID PRIMARY KEY,
    execution_id UUID REFERENCES executions(id),
    task_id UUID REFERENCES tasks(id),
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    execution_time_ms INTEGER
);
```

## API Endpoints

### Workflow Management
```
GET    /api/workflows              # List workflows
POST   /api/workflows              # Create workflow
GET    /api/workflows/{id}         # Get workflow details
PUT    /api/workflows/{id}         # Update workflow
DELETE /api/workflows/{id}         # Delete workflow
POST   /api/workflows/{id}/export  # Export workflow
POST   /api/workflows/import       # Import workflow
```

### Execution Management
```
POST   /api/workflows/{id}/execute # Manual execution
GET    /api/executions             # List executions
GET    /api/executions/{id}        # Get execution details
GET    /api/executions/{id}/steps  # Get execution steps
DELETE /api/executions/{id}        # Cancel execution
```

### Monitoring
```
GET    /api/dashboard/overview     # Dashboard data
GET    /api/dashboard/active       # Active executions
GET    /api/dashboard/metrics      # Performance metrics
```

## Frontend Structure

### Component Hierarchy
```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   └── DataTable.tsx
│   ├── workflow/
│   │   ├── WorkflowCanvas.tsx
│   │   ├── TaskNode.tsx
│   │   ├── TaskPalette.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── VariableEditor.tsx
│   ├── monitoring/
│   │   ├── ExecutionList.tsx
│   │   ├── ExecutionDetails.tsx
│   │   ├── StepDetails.tsx
│   │   └── Dashboard.tsx
│   └── tasks/
│       ├── HttpTask.tsx
│       ├── ScriptTask.tsx
│       ├── TransformTask.tsx
│       └── StorageTask.tsx
├── hooks/
│   ├── useWorkflow.ts
│   ├── useExecution.ts
│   ├── useVariables.ts
│   └── useWebSocket.ts
├── services/
│   ├── api.ts
│   ├── workflowService.ts
│   └── executionService.ts
└── types/
    ├── workflow.ts
    ├── task.ts
    └── execution.ts
```

## Starting Node Management

- **Automatic Creation:**
  - The Start node (type: 'start') is created automatically by the backend when a new workflow is created.
  - This node represents the entry point of the workflow and is required for execution.

- **Uniqueness Enforcement:**
  - Only one Start node is allowed per workflow.
  - The backend enforces this rule: any attempt to create a Start node via the node creation API (POST /workflows/{workflowId}/nodes) will be rejected with an error.
  - The frontend does not offer a Start node in the palette and never attempts to create one except as part of workflow creation.

- **Node Creation API:**
  - The node creation endpoint will throw an error if a request is made to create a node with type 'start'.
  - All other node types (tasks, conditions, etc.) can be created via the API or UI palette as normal.

- **Data Integrity:**
  - If, due to legacy data or migration, multiple Start nodes exist for a workflow, a cleanup script or SQL query should be run to remove all but the oldest Start node per workflow.
  - Example SQL (PostgreSQL):
    ```sql
    DELETE FROM "Tasks"
    WHERE "Type" = 'start'
    AND "Id" NOT IN (
        SELECT MIN("Id") FROM "Tasks"
        WHERE "Type" = 'start'
        GROUP BY "WorkflowId"
    );
    ```

- **Frontend Behavior:**
  - The UI never allows the user to add a Start node from the palette.
  - When loading a workflow, the frontend checks for the presence of a Start node and only triggers creation if none exists (should never happen in normal operation).

- **Summary:**
  - The Start node is a system-managed, unique node per workflow, created only at workflow creation time and never via user action or the node palette.

## Task Types Implemented

| Task Type      | Description                                      | Business Logic / Notes                                  |
|--------------- |--------------------------------------------------|---------------------------------------------------------|
| start          | Entry point node, created automatically          | Only one per workflow, not user-creatable               |
| HttpCallout    | Call external APIs via HTTP(S)                   | Configurable method, URL, headers, etc.                 |
| Delay          | Pause workflow for a specified duration           | Configurable duration in seconds                        |
| Conditional    | Branch workflow based on a condition              | (If implemented) Configurable expression                |
| Split          | Split execution into multiple branches            | (If implemented) Configurable number of branches        |
| Parallel       | Run tasks in parallel                             | (If implemented)                                        |
| Data Load      | Push data to SFTP or other storage                | (If implemented)                                        |
| ...            | ...                                               | ...                                                     |

**Note:** Only `start`, `HttpCallout`, and `Delay` are currently palette-available and fully supported end-to-end. Others may be partially implemented or planned.

## Task Configuration Management

- Each task type (Delay, HttpCallout, Start, etc.) has its own configuration class/file.
- **userDescription**: All task configuration types include a `userDescription` field (string, long text) for user-editable notes or documentation. This is enforced in both backend (C# config classes) and frontend (TypeScript config types and forms).
- The frontend always presents a User Description field in the node configuration modal, and this value is stored in the configuration JSON.
- The backend validates that the configuration JSON matches the expected structure for the task type. Cross-type updates (e.g., Delay config for HttpCallout) are rejected.

## Execution Data Handling

- **inputData** and **outputData** fields in `ExecutionStep` are always stored as JSON (object or null).
- `inputData` contains information about previous tasks and their outputs, enabling data flow between steps.
- If a task output contains a file (e.g., generated or downloaded by a task), the file is stored in S3 under a folder named after the execution id. The `outputData` JSON includes a reference (URL or S3 key) to the file location.
- This approach ensures that large or binary outputs do not bloat the database and are accessible for later steps or user download.

---

## Specification Implementation Checklist

| Feature / Spec Element                | Status        | Notes                                                      |
|---------------------------------------|--------------|------------------------------------------------------------|
| Start node auto-creation              | Implemented  | Created with workflow, not user-creatable                  |
| Start node uniqueness enforcement     | Implemented  | Backend blocks duplicate, frontend never offers            |
| Node creation API (non-start types)   | Implemented  | Palette and API allow only valid task types                |
| User-editable task description        | Implemented  | `UserDescription` field in Task entity                     |
| Node position sync (only moved nodes) | Implemented  | Only changed nodes are synced via API                      |
| Collapsible, categorized palette      | Implemented  | Only valid types shown, grouped by category                |
| Fullscreen background theme sync      | Implemented  | Uses MutationObserver for light/dark mode                  |
| Data cleanup for duplicate start nodes| Implemented  | SQL script provided, should be run once                    |
| Batch node position update API        | Implemented  | Endpoint and frontend logic for batch updates              |
| Advanced task types (Split, Parallel) | Partial/Pending | UI/logic may exist, but not fully supported in backend   |
| Workflow execution engine             | Implemented  | (Assumed, if not, mark as pending)                         |
| Real-time collaboration               | Partial/Pending | Collaboration API exists, but not fully integrated      |
| Variable/trigger management           | Partial/Pending | Variable/trigger UI and backend exist, may need polish  |

---

**Legend:**
- **Implemented:** Fully working and integrated
- **Partial/Pending:** Some logic exists, but not fully supported or exposed
- **Pending:** Not yet implemented

---

If you need more detail on any task type or feature, let me know!

## Development Phases

### Phase 1: Core Infrastructure
- [ ] Backend project setup with Clean Architecture
- [ ] Database schema implementation
- [ ] Basic CRUD operations for workflows
- [ ] Authentication and authorization
- [ ] Basic API endpoints

### Phase 2: Workflow Designer
- [ ] React frontend setup
- [ ] Drag-and-drop canvas implementation
- [ ] Task palette and node components
- [ ] Basic task configuration forms
- [ ] Workflow validation

### Phase 3: Task Types Implementation
- [ ] HTTP callout task
- [ ] Script execution task
- [ ] Data transformation task
- [ ] Storage push task
- [ ] Control flow tasks

### Phase 4: Execution Engine
- [ ] Workflow execution engine
- [ ] Task execution framework
- [ ] Variable substitution system
- [ ] Error handling and retry logic
- [ ] Execution history tracking

### Phase 5: Monitoring and Triggers
- [ ] Real-time monitoring dashboard
- [ ] Manual execution triggers
- [ ] Cron scheduling system
- [ ] Webhook trigger endpoints
- [ ] Execution analytics

### Phase 6: Advanced Features
- [ ] Import/export functionality
- [ ] Advanced monitoring features
- [ ] Performance optimizations
- [ ] Security hardening
- [ ] Documentation and testing

## Best Practices

### Code Quality
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

### Security
- **Input validation** at all layers
- **SQL parameterization** for all queries
- **HTTPS** enforcement
- **CORS** configuration
- **Rate limiting** implementation

### Performance
- **Lazy loading** for large workflows
- **Virtual scrolling** for long lists
- **Debounced** API calls
- **Optimistic updates** for better UX
- **Caching** strategies

### User Experience
- **Responsive design** for all screen sizes
- **Keyboard shortcuts** for power users
- **Undo/redo** functionality
- **Auto-save** for workflow changes
- **Progressive loading** indicators

This specification provides a comprehensive foundation for building a robust, scalable, and user-friendly workflow management system that follows modern development practices and security standards. 