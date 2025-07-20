# Workflow Management System

A comprehensive web application for defining, executing, and monitoring workflows with a drag-and-drop interface.

## Features

- **Workflow Designer**: Drag-and-drop interface for creating workflows
- **Multiple Task Types**: HTTP Callout, Script Execution, Data Transformation, Storage Push, Control Flow
- **Variables System**: Global and system variables with template syntax
- **Multiple Triggers**: Manual execution, Cron scheduling, Webhook triggers
- **Real-time Monitoring**: Dashboard with execution details and history
- **Import/Export**: JSON-based workflow sharing

## Technology Stack

### Backend
- **.NET 8** with Clean Architecture
- **PostgreSQL** for data persistence
- **Entity Framework Core** for ORM
- **JWT Authentication**
- **SignalR** for real-time updates

### Frontend
- **React 18** with TypeScript
- **React Flow** for drag-and-drop workflow designer
- **Material-UI** for UI components
- **React Query** for data fetching
- **Zustand** for state management

## Project Structure

```
woow/
├── src/
│   ├── WorkflowSystem.API/           # Web API layer
│   ├── WorkflowSystem.Application/    # Application layer
│   ├── WorkflowSystem.Domain/         # Domain layer
│   ├── WorkflowSystem.Infrastructure/ # Infrastructure layer
│   └── WorkflowSystem.Tests/          # Test projects
├── ClientApp/                        # React frontend
├── docs/                            # Documentation
└── scripts/                         # Database and deployment scripts
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Docker & Docker Compose

### Backend Setup
```bash
# Start Docker services (PostgreSQL & Redis)
docker-compose up -d

# Restore packages
dotnet restore

# Run database migrations
dotnet ef database update --project src/WorkflowSystem.Infrastructure --startup-project src/WorkflowSystem.API

# Run the API
dotnet run --project src/WorkflowSystem.API
```

### Frontend Setup
```bash
cd ClientApp
npm install
npm start
```

## Development

### Backend Development
- Follow Clean Architecture principles
- Use CQRS pattern for commands and queries
- Implement proper validation and error handling
- Write unit tests for business logic

### Frontend Development
- Use TypeScript for type safety
- Follow component composition patterns
- Implement proper error boundaries
- Write unit tests for critical components

## API Documentation

The API documentation is available at `/swagger` when running in development mode.

## Contributing

1. Follow the established coding standards
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

MIT License 