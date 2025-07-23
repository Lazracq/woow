using FluentValidation;

namespace WorkflowSystem.Application.Workflows.Commands.AddConnection
{
    public class AddConnectionCommandValidator : AbstractValidator<AddConnectionCommand>
    {
        public AddConnectionCommandValidator()
        {
            RuleFor(x => x.WorkflowId).NotEmpty();
            RuleFor(x => x.NodeId).NotEmpty();
            RuleFor(x => x.TargetNodeId).NotEmpty();
            RuleFor(x => x.NodeId).NotEqual(x => x.TargetNodeId).WithMessage("Source and target node cannot be the same");
        }
    }
} 