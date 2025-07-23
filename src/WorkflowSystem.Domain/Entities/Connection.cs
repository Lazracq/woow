using System;

namespace WorkflowSystem.Domain.Entities
{
    public class Connection : BaseEntity
    {
        public Guid WorkflowId { get; set; }
        public Guid FromTaskId { get; set; }
        public Guid ToTaskId { get; set; }
        public string AssociationType { get; set; } = string.Empty;
        public string? Label { get; set; }

        public virtual Workflow Workflow { get; set; } = null!;
        public virtual Task FromTask { get; set; } = null!;
        public virtual Task ToTask { get; set; } = null!;
    }
} 