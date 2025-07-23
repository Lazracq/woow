using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConnectionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Connections",
                table: "Tasks");

            migrationBuilder.CreateTable(
                name: "Connection",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromTaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToTaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssociationType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connection", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Connection_Tasks_FromTaskId",
                        column: x => x.FromTaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Connection_Tasks_ToTaskId",
                        column: x => x.ToTaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Connection_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Connection_FromTaskId",
                table: "Connection",
                column: "FromTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Connection_ToTaskId",
                table: "Connection",
                column: "ToTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Connection_WorkflowId",
                table: "Connection",
                column: "WorkflowId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Connection");

            migrationBuilder.AddColumn<string>(
                name: "Connections",
                table: "Tasks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
