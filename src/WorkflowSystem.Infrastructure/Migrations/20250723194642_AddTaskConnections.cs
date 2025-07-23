using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskConnections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Connections",
                table: "Tasks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Connections",
                table: "Tasks");
        }
    }
}
