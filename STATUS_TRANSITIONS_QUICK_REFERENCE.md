# Quick Reference: Status Transitions & Application Flow

## Status Definitions

### WorkflowStatus
- **Draft**: Initial state, workflow being created/edited
- **Active**: Ready for execution, can be triggered
- **Inactive**: Disabled, no new executions allowed
- **Archived**: Read-only, preserved for historical data

### ExecutionStatus
- **Pending**: Queued in Redis, waiting for worker
- **Running**: Currently being executed by worker
- **Completed**: Successfully finished
- **Failed**: Execution failed with error
- **Cancelled**: Manually cancelled by user
- **Paused**: Temporarily paused, can be resumed

## Application Architecture Summary

### Main Application (API)
```
┌─────────────────┐
│   API Layer     │ ← HTTP requests, workflow management
├─────────────────┤
│  Services       │ ← Business logic, queue management
├─────────────────┤
│ Repositories    │ ← Data access (read-replica for reads)
├─────────────────┤
│   Database      │ ← PostgreSQL (primary + read-replica)
└─────────────────┘
```

### Worker Services
```
┌─────────────────┐
│   Worker 1      │ ← Picks jobs from Redis queue
├─────────────────┤
│   Worker 2      │ ← Executes workflow tasks
├─────────────────┤
│   Worker N      │ ← Updates execution status
└─────────────────┘
```

### Redis Infrastructure
```
┌─────────────────┐
│   Queue         │ ← Job distribution
├─────────────────┤
│   Cache         │ ← Frequently accessed data
├─────────────────┤
│   Locks         │ ← Distributed locking
├─────────────────┤
│   Pub/Sub       │ ← Real-time notifications
└─────────────────┘
```

## Execution Flow Summary

1. **User requests workflow execution**
   - API validates workflow (must be Active)
   - Creates execution record (Pending)
   - Enqueues job in Redis

2. **Worker picks up job**
   - Dequeues from Redis queue
   - Updates status to Running
   - Executes workflow tasks

3. **Execution completes**
   - Success: Update to Completed
   - Failure: Update to Failed, retry if possible
   - Publish result via Redis Pub/Sub

4. **Real-time updates**
   - Clients receive notifications
   - UI updates automatically
   - Metrics are recorded

## Horizontal Scaling Strategy

### API Scaling
- **Trigger**: High HTTP request load
- **Action**: Scale API instances
- **Metric**: CPU/Memory usage

### Worker Scaling
- **Trigger**: Queue length increases
- **Action**: Scale worker instances
- **Metric**: Jobs in queue

### Database Scaling
- **Primary**: Write operations only
- **Read-Replica**: All read queries
- **Benefit**: Better performance, reduced load

## Key Configuration

```bash
# Database
DefaultConnection=Host=primary;Database=workflows
ReadOnlyConnection=Host=replica;Database=workflows

# Redis
Redis=localhost:6379

# Scaling
MaxWorkers=10
QueueTimeout=300
RetryAttempts=3
```

## Health Check Endpoints

```bash
# API Health
GET /health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}

# Worker Health
GET /health
{
  "status": "healthy",
  "workerId": "worker-123",
  "processedJobs": 150
}
```

## Monitoring Commands

```bash
# Check queue length
redis-cli LLEN workflow:execution:queue

# Check worker status
kubectl get pods -l app=workflowsystem-worker

# Check API health
curl http://api-service/health
```

## Common Status Transitions

| Scenario | From | To | Action |
|----------|------|----|---------|
| Create workflow | - | Draft | Save to database |
| Publish workflow | Draft | Active | Enable execution |
| Execute workflow | Active | Pending | Queue in Redis |
| Worker starts | Pending | Running | Update status |
| Execution succeeds | Running | Completed | Store results |
| Execution fails | Running | Failed | Log error, retry |
| User cancels | Running | Cancelled | Stop execution |
| System pause | Running | Paused | Save state |
| Resume execution | Paused | Running | Restore state |
| Disable workflow | Active | Inactive | Stop new executions |
| Archive workflow | Active | Archived | Preserve data | 