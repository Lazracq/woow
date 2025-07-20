# Workflow Management System - Project Structure

## Overview

This is a comprehensive workflow management system built with .NET 8 (Clean Architecture) and React 18 (TypeScript). The system supports defining, executing, and monitoring workflows with a drag-and-drop interface.

## Project Structure

```
woow/
├── README.md                           # Main project documentation
├── WORKFLOW_SYSTEM_SPECIFICATION.md   # Detailed system specification
├── PROJECT_STRUCTURE.md               # This file
├── WorkflowSystem.sln                 # .NET solution file
├── scripts/
│   └── setup.sh                      # Setup script for initial configuration
├── src/                              # Backend (.NET 8)
│   ├── WorkflowSystem.Domain/        # Domain Layer (Clean Architecture)
│   │   ├── Entities/                 # Domain entities
│   │   │   ├── BaseEntity.cs
│   │   │   ├── Workflow.cs
│   │   │   ├── Task.cs
│   │   │   ├── Variable.cs
│   │   │   ├── Trigger.cs
│   │   │   ├── Execution.cs
│   │   │   └── ExecutionStep.cs
│   │   ├── Enums/                    # Domain enums
│   │   │   ├── TaskType.cs
│   │   │   ├── ExecutionStatus.cs
│   │   │   ├── TriggerType.cs
│   │   │   └── VariableType.cs
│   │   └── ValueObjects/             # Value objects for DTOs
│   │       └── WorkflowDefinition.cs
│   ├── WorkflowSystem.Application/    # Application Layer (CQRS)
│   │   ├── Common/
│   │   │   └── Interfaces/           # Repository interfaces
│   │   │       ├── IWorkflowRepository.cs
│   │   │       ├── IExecutionRepository.cs
│   │   │       ├── IWorkflowExecutionEngine.cs
│   │   │       └── IApplicationDbContext.cs
│   │   ├── Workflows/
│   │   │   ├── Commands/             # CQRS Commands
│   │   │   │   └── CreateWorkflow/
│   │   │   │       ├── CreateWorkflowCommand.cs
│   │   │   │       └── CreateWorkflowCommandValidator.cs
│   │   │   └── Queries/              # CQRS Queries
│   │   │       └── GetWorkflows/
│   │   │           ├── GetWorkflowsQuery.cs
│   │   │           └── WorkflowsVm.cs
│   │   └── DependencyInjection.cs
│   ├── WorkflowSystem.Infrastructure/ # Infrastructure Layer
│   │   ├── Persistence/              # Entity Framework
│   │   │   └── ApplicationDbContext.cs
│   │   ├── Repositories/             # Repository implementations
│   │   │   ├── WorkflowRepository.cs
│   │   │   └── ExecutionRepository.cs
│   │   └── DependencyInjection.cs
│   └── WorkflowSystem.API/           # Web API Layer
│       ├── Controllers/              # API Controllers
│       │   └── WorkflowsController.cs
│       ├── Program.cs                 # Application entry point
│       └── appsettings.json          # Configuration
└── ClientApp/                        # Frontend (React 18 + TypeScript)
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/               # React components
    │   │   └── Layout/
    │   │       └── Layout.tsx
    │   ├── pages/                    # Page components
    │   │   ├── Dashboard.tsx
    │   │   ├── Workflows.tsx
    │   │   ├── WorkflowDesigner.tsx
    │   │   ├── Executions.tsx
    │   │   └── ExecutionDetails.tsx
    │   ├── services/                 # API services
    │   │   └── api.ts
    │   ├── types/                    # TypeScript types
    │   │   └── workflow.ts
    │   ├── App.tsx                   # Main app component
    │   └── index.tsx                 # Entry point
    └── package.json                  # Frontend dependencies
```

## Implemented Features

### Backend (.NET 8)

✅ **Clean Architecture Pattern**
- Domain Layer with entities and business logic
- Application Layer with CQRS pattern
- Infrastructure Layer with Entity Framework
- Web API Layer with controllers

✅ **Domain Entities**
- `Workflow`: Core workflow entity with tasks, variables, triggers
- `Task`: Individual workflow steps with different types
- `Variable`: Global and system variables
- `Trigger`: Manual, Cron, and Webhook triggers
- `Execution`: Workflow execution tracking
- `ExecutionStep`: Individual task execution tracking

✅ **CQRS Implementation**
- Commands: CreateWorkflowCommand with validation
- Queries: GetWorkflowsQuery with pagination and filtering
- MediatR for command/query handling
- FluentValidation for input validation

✅ **Repository Pattern**
- IWorkflowRepository interface
- WorkflowRepository implementation
- IExecutionRepository interface
- ExecutionRepository implementation

✅ **Entity Framework Configuration**
- ApplicationDbContext with proper relationships
- PostgreSQL provider configuration
- Dependency injection setup

✅ **API Controllers**
- WorkflowsController with RESTful endpoints
- Proper request/response DTOs
- Swagger documentation support

### Frontend (React 18 + TypeScript)

✅ **Project Structure**
- TypeScript configuration
- Material-UI for components
- React Query for data fetching
- React Router for navigation

✅ **Type Definitions**
- Complete TypeScript interfaces for all entities
- Enum definitions for statuses and types
- Request/response DTOs

✅ **API Services**
- Axios-based API client
- Request/response interceptors
- Error handling and authentication

✅ **Components**
- Layout component with navigation
- Dashboard with metrics and active executions
- Workflows page with data table
- Placeholder pages for designer and executions

✅ **State Management**
- React Query for server state
- Zustand ready for client state
- Proper loading and error states

## Security & Best Practices

✅ **Security Measures**
- Input validation with FluentValidation
- SQL injection prevention with EF Core
- JWT authentication ready
- CORS configuration
- HTTPS enforcement

✅ **Performance Optimizations**
- Entity Framework with proper includes
- Pagination for large datasets
- Caching ready with React Query
- Async/await patterns

✅ **Code Quality**
- Clean Architecture principles
- SOLID principles
- TypeScript for type safety
- Proper error handling
- Comprehensive validation

## Next Steps

### Phase 1: Core Infrastructure (Current)
- ✅ Basic project structure
- ✅ Domain entities and business logic
- ✅ Repository pattern implementation
- ✅ API controllers and endpoints
- ✅ Frontend structure and basic pages

### Phase 2: Workflow Designer (Next)
- [ ] React Flow integration for drag-and-drop
- [ ] Task palette and node components
- [ ] Task configuration forms
- [ ] Workflow validation
- [ ] Real-time collaboration

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

### Phase 5: Monitoring and Triggers
- [ ] Real-time monitoring dashboard
- [ ] Manual execution triggers
- [ ] Cron scheduling system
- [ ] Webhook trigger endpoints

## Getting Started

1. **Prerequisites**
   - .NET 8 SDK
   - Node.js 18+
   - PostgreSQL 14+

2. **Setup**
   ```bash
   # Run the setup script
   ./scripts/setup.sh
   ```

3. **Run the Application**
   ```bash
   # Backend
   dotnet run --project src/WorkflowSystem.API
   
   # Frontend
   cd ClientApp && npm start
   ```

4. **Access Points**
   - Frontend: http://localhost:3000
   - Backend API: https://localhost:7001
   - Swagger UI: https://localhost:7001/swagger

## Architecture Benefits

- **Scalability**: Clean Architecture allows easy scaling and maintenance
- **Testability**: Separation of concerns enables comprehensive testing
- **Flexibility**: Easy to add new features and modify existing ones
- **Security**: Built-in security measures and validation
- **Performance**: Optimized for performance with proper patterns
- **User Experience**: Modern React UI with Material-UI components

This foundation provides a solid base for building a comprehensive workflow management system that follows modern development practices and can scale to meet enterprise needs. 