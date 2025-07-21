using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStartingNodesForExistingWorkflows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add starting nodes for existing workflows that don't have any tasks
            migrationBuilder.Sql(@"
                INSERT INTO ""Tasks"" (""Id"", ""Name"", ""Type"", ""Configuration"", ""PositionX"", ""PositionY"", ""IsActive"", ""CreatedAt"", ""WorkflowId"")
                SELECT 
                    gen_random_uuid() as ""Id"",
                    'Start Workflow' as ""Name"",
                    'start' as ""Type"",
                    '{}' as ""Configuration"",
                    0.0 as ""PositionX"",
                    0.0 as ""PositionY"",
                    true as ""IsActive"",
                    NOW() as ""CreatedAt"",
                    w.""Id"" as ""WorkflowId""
                FROM ""Workflows"" w
                WHERE NOT EXISTS (
                    SELECT 1 FROM ""Tasks"" t 
                    WHERE t.""WorkflowId"" = w.""Id""
                )
                AND w.""IsActive"" = true;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove starting nodes that were added by this migration
            migrationBuilder.Sql(@"
                DELETE FROM ""Tasks"" 
                WHERE ""Name"" = 'Start Workflow' 
                AND ""Type"" = 'start' 
                AND ""Configuration"" = '{}'
                AND ""PositionX"" = 0.0 
                AND ""PositionY"" = 0.0;
            ");
        }
    }
}
