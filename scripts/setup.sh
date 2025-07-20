#!/bin/bash

echo "🚀 Setting up Workflow Management System..."

# Check if .NET 8 is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET 8 SDK is not installed. Please install it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done

echo "📦 Restoring .NET packages..."
dotnet restore

echo "🔧 Running database migrations..."
dotnet ef database update --project src/WorkflowSystem.Infrastructure --startup-project src/WorkflowSystem.API

echo "📦 Installing frontend dependencies..."
cd ClientApp
npm install

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Backend: dotnet run --project src/WorkflowSystem.API"
echo "2. Frontend: cd ClientApp && npm start"
echo ""
echo "The application will be available at:"
echo "- Backend API: https://localhost:7001"
echo "- Frontend: http://localhost:3000"
echo "- Swagger UI: https://localhost:7001/swagger"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "To stop Docker services:"
echo "docker-compose down" 