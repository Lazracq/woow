using WorkflowSystem.Domain.Entities;
using Task = WorkflowSystem.Domain.Entities.Task;
using WorkflowSystem.Domain.ValueObjects;

namespace WorkflowSystem.Application.Common.Interfaces;

public interface IWorkflowRepository
{
    System.Threading.Tasks.Task<Workflow?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Workflow>> GetAllAsync(CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IEnumerable<Workflow>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Workflow> AddAsync(Workflow workflow, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Workflow> UpdateAsync(Workflow workflow, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<WorkflowDefinition> ExportAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Workflow> ImportAsync(WorkflowDefinition definition, Guid userId, CancellationToken cancellationToken = default);
} 