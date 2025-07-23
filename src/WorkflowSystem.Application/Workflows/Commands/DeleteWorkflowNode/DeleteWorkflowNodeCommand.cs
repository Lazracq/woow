using MediatR;
using WorkflowSystem.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WorkflowSystem.Application.Workflows.Commands.DeleteWorkflowNode
{
    public class DeleteWorkflowNodeCommand : IRequest<Unit>
    {
        public Guid WorkflowId { get; set; }
        public Guid NodeId { get; set; }
    }

    public class DeleteWorkflowNodeCommandHandler : IRequestHandler<DeleteWorkflowNodeCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public DeleteWorkflowNodeCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteWorkflowNodeCommand request, CancellationToken cancellationToken)
        {
            var task = await _context.Tasks.FindAsync(request.NodeId);
            if (task == null)
            {
                throw new InvalidOperationException($"Task with ID {request.NodeId} not found.");
            }
            if (task.WorkflowId != request.WorkflowId)
            {
                throw new InvalidOperationException($"Task {request.NodeId} does not belong to workflow {request.WorkflowId}.");
            }
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
} 