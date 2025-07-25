using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using WorkflowSystem.Application.Common.Interfaces;
using WorkflowSystem.Domain.Entities;
using System.Linq;
using WorkflowSystem.Application.Common.Utils;

namespace WorkflowSystem.Application.Workflows.Commands.DeleteConnection
{
    public class DeleteConnectionCommand : IRequest<Unit>
    {
        public Guid WorkflowId { get; set; }
        public Guid ConnectionId { get; set; }
    }

    public class DeleteConnectionCommandHandler : IRequestHandler<DeleteConnectionCommand, Unit>
    {
        private readonly IWorkflowRepository _workflowRepository;

        public DeleteConnectionCommandHandler(IWorkflowRepository workflowRepository)
        {
            _workflowRepository = workflowRepository;
        }

        public async Task<Unit> Handle(DeleteConnectionCommand request, CancellationToken cancellationToken)
        {
            // Sanitize IDs (defensive, even though they are GUIDs)
            var workflowId = request.WorkflowId;
            var connectionId = request.ConnectionId;
            var workflow = await _workflowRepository.GetByIdAsync(workflowId, cancellationToken);
            if (workflow == null)
                throw new InvalidOperationException("Workflow not found");

            var connection = workflow.Connections.FirstOrDefault(c => c.Id == connectionId);
            if (connection == null)
                throw new InvalidOperationException("Connection not found");

            workflow.Connections.Remove(connection);
            await _workflowRepository.UpdateAsync(workflow, cancellationToken);
            return Unit.Value;
        }
    }
} 