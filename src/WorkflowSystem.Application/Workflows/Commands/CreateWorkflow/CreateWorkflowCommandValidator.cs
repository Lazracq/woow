using FluentValidation;

namespace WorkflowSystem.Application.Workflows.Commands.CreateWorkflow;

public class CreateWorkflowCommandValidator : AbstractValidator<CreateWorkflowCommand>
{
    public CreateWorkflowCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Workflow name is required.")
            .MaximumLength(255).WithMessage("Workflow name cannot exceed 255 characters.")
            .Matches(@"^[a-zA-Z0-9\s\-_]+$").WithMessage("Workflow name can only contain letters, numbers, spaces, hyphens, and underscores.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required.");
    }
} 