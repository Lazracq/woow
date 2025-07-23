using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using WorkflowSystem.Application.Common.Interfaces;
using FluentValidation;
using System.Linq;
using WorkflowSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace WorkflowSystem.Application.Workflows.Commands.AddConnection
{
    public class AddConnectionCommand : IRequest<Unit>
    {
        public Guid WorkflowId { get; set; }
        public Guid NodeId { get; set; }
        public Guid TargetNodeId { get; set; }
        public string? AssociationType { get; set; } = string.Empty;
        public string? Label { get; set; } = string.Empty;
    }

    public class AddConnectionCommandHandler : IRequestHandler<AddConnectionCommand, Unit>
    {
        private readonly IApplicationDbContext _context;
        private readonly IWorkflowExecutionCache _cache;

        public AddConnectionCommandHandler(IApplicationDbContext context, IWorkflowExecutionCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Unit> Handle(AddConnectionCommand request, CancellationToken cancellationToken)
        {
            // Always get a tracked entity from the DbContext
            var workflow = await _context.Workflows
                .Include(w => w.Tasks)
                .Include(w => w.Connections)
                .FirstOrDefaultAsync(w => w.Id == request.WorkflowId, cancellationToken);
            if (workflow == null)
                throw new InvalidOperationException("Workflow not found");

            var sourceTask = workflow.Tasks.FirstOrDefault(t => t.Id == request.NodeId);
            var targetTask = workflow.Tasks.FirstOrDefault(t => t.Id == request.TargetNodeId);
            if (sourceTask == null || targetTask == null)
                throw new InvalidOperationException("Source or target task not found");

            // Check for duplicate connection
            if (workflow.Connections.Any(c => c.FromTaskId == request.NodeId && c.ToTaskId == request.TargetNodeId && c.AssociationType == request.AssociationType))
                return Unit.Value;

            var connection = new Connection
            {
                WorkflowId = request.WorkflowId,
                FromTaskId = request.NodeId,
                ToTaskId = request.TargetNodeId,
                AssociationType = request.AssociationType ?? string.Empty,
                Label = request.Label
            };

            // Add to the context directly (not just to navigation property)
            _context.Connections.Add(connection);

            await _context.SaveChangesAsync(cancellationToken);

            // Update cache after DB save
            await _cache.SetWorkflowAsync(workflow.Id, workflow);
            return Unit.Value;
        }
    }
} 