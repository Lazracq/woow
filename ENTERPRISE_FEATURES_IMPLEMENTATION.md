# Workflow Connections Specification (Updated)

## Connection Model
- Each workflow can have multiple connections between tasks (nodes).
- Each connection is represented by a `Connection` entity with:
  - `Id`: Unique identifier
  - `WorkflowId`: The workflow this connection belongs to
  - `FromTaskId`: The source node/task
  - `ToTaskId`: The target node/task
  - `AssociationType`: String describing the semantic/handle (e.g., "onSuccess", "onError", "case:1")
  - `Label`: (Optional) UI/business label

## API Endpoints

### Add Connection
- **POST** `/api/workflows/{workflowId}/connections`
- **Request Body:**
  ```json
  {
    "fromTaskId": "guid",
    "toTaskId": "guid",
    "associationType": "onSuccess", // or "case:1", etc.
    "label": "optional label"
  }
  ```
- **Response:** `{ "message": "Connection added successfully" }`

### Delete Connection
- **DELETE** `/api/workflows/{workflowId}/connections/{connectionId}`
- **Response:** `{ "message": "Connection deleted successfully" }`

## associationType
- Used to distinguish connection semantics and UI handle mapping.
- For standard nodes: use hardcoded values ("onSuccess", "onError", "input").
- For dynamic/case nodes: use a pattern ("case:1", "case:2", ...).
- The frontend uses this to map connections to node handles/ports.

## Workflow API Response Example
```json
{
  "id": "workflow-guid",
  "name": "My Workflow",
  "tasks": [
    { "id": "task1", "name": "Start", ... },
    { "id": "task2", "name": "Do Something", ... }
  ],
  "connections": [
    { "id": "conn1", "fromTaskId": "task1", "toTaskId": "task2", "associationType": "onSuccess", "label": null }
  ]
}
```

## Frontend Mapping
- Render all nodes from the `tasks` array.
- For each connection in `connections`, draw an edge from `fromTaskId` to `toTaskId` using `associationType` to select the correct handle/port.
- The UI can support any number of cases/branches by parsing `associationType`.

## Extensibility
- This model supports all node types (TaskNode, CaseNode, MergeNode, etc.) and any number of associations per node.
- Adding new connection types or node types is just a matter of using a new `associationType` value. 