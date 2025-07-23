using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPriorityComplexityTagsToWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Complexity",
                table: "Workflows",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Workflows",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Workflows",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Complexity",
                table: "Workflows");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Workflows");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Workflows");
        }
    }
}
