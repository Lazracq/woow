using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkflowSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameConnectionTableToConnections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connection_Tasks_FromTaskId",
                table: "Connection");

            migrationBuilder.DropForeignKey(
                name: "FK_Connection_Tasks_ToTaskId",
                table: "Connection");

            migrationBuilder.DropForeignKey(
                name: "FK_Connection_Workflows_WorkflowId",
                table: "Connection");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Connection",
                table: "Connection");

            migrationBuilder.RenameTable(
                name: "Connection",
                newName: "Connections");

            migrationBuilder.RenameIndex(
                name: "IX_Connection_WorkflowId",
                table: "Connections",
                newName: "IX_Connections_WorkflowId");

            migrationBuilder.RenameIndex(
                name: "IX_Connection_ToTaskId",
                table: "Connections",
                newName: "IX_Connections_ToTaskId");

            migrationBuilder.RenameIndex(
                name: "IX_Connection_FromTaskId",
                table: "Connections",
                newName: "IX_Connections_FromTaskId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Connections",
                table: "Connections",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Tasks_FromTaskId",
                table: "Connections",
                column: "FromTaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Tasks_ToTaskId",
                table: "Connections",
                column: "ToTaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Workflows_WorkflowId",
                table: "Connections",
                column: "WorkflowId",
                principalTable: "Workflows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Tasks_FromTaskId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Tasks_ToTaskId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Workflows_WorkflowId",
                table: "Connections");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Connections",
                table: "Connections");

            migrationBuilder.RenameTable(
                name: "Connections",
                newName: "Connection");

            migrationBuilder.RenameIndex(
                name: "IX_Connections_WorkflowId",
                table: "Connection",
                newName: "IX_Connection_WorkflowId");

            migrationBuilder.RenameIndex(
                name: "IX_Connections_ToTaskId",
                table: "Connection",
                newName: "IX_Connection_ToTaskId");

            migrationBuilder.RenameIndex(
                name: "IX_Connections_FromTaskId",
                table: "Connection",
                newName: "IX_Connection_FromTaskId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Connection",
                table: "Connection",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Connection_Tasks_FromTaskId",
                table: "Connection",
                column: "FromTaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connection_Tasks_ToTaskId",
                table: "Connection",
                column: "ToTaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connection_Workflows_WorkflowId",
                table: "Connection",
                column: "WorkflowId",
                principalTable: "Workflows",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
