#!/bin/bash

echo "🧪 Testing Workflow System API..."

# Base URL
BASE_URL="http://localhost:5776/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo -e "${YELLOW}Testing $method $endpoint...${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
    echo ""
}

# Check if API is running
echo "🔍 Checking if API is running..."
if ! curl -s "$BASE_URL/executions" > /dev/null; then
    echo -e "${RED}❌ API is not running. Please start the API first:${NC}"
    echo "dotnet run --project src/WorkflowSystem.API"
    exit 1
fi

echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Test endpoints
echo "📊 Testing execution statistics..."
test_endpoint "GET" "/executions/stats"

echo "📋 Testing executions list..."
test_endpoint "GET" "/executions"

echo "🌱 Seeding sample data..."
test_endpoint "POST" "/executions/seed"

echo "📊 Testing execution statistics after seeding..."
test_endpoint "GET" "/executions/stats"

echo "📋 Testing executions list after seeding..."
test_endpoint "GET" "/executions"

echo "🎉 API testing complete!" 