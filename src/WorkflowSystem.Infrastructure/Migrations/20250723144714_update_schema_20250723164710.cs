using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class update_schema_20250723164710 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserDescription",
                table: "Tasks",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserDescription",
                table: "Tasks");
        }
    }
}
