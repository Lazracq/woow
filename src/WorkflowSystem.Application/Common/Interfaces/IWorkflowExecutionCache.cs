using System;
using WorkflowSystem.Domain.Entities;

namespace WorkflowSystem.Application.Common.Interfaces
{
    public interface IWorkflowExecutionCache
    {
        System.Threading.Tasks.Task<Execution?> GetExecutionAsync(Guid executionId);
        System.Threading.Tasks.Task SetExecutionAsync(Guid executionId, Execution execution, TimeSpan? expiration = null);
        System.Threading.Tasks.Task RemoveExecutionAsync(Guid executionId);
        System.Threading.Tasks.Task<Workflow?> GetWorkflowAsync(Guid workflowId);
        System.Threading.Tasks.Task SetWorkflowAsync(Guid workflowId, Workflow workflow, TimeSpan? expiration = null);
        System.Threading.Tasks.Task RemoveWorkflowAsync(Guid workflowId);
    }
} 