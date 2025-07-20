using Microsoft.EntityFrameworkCore;
using WorkflowSystem.Application;
using WorkflowSystem.Infrastructure;
using WorkflowSystem.Infrastructure.Services;
using WorkflowSystem.Infrastructure.Jobs;
using WorkflowSystem.Worker;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add Application Layer
builder.Services.AddApplication();

// Add Infrastructure Layer
builder.Services.AddInfrastructure(builder.Configuration);

// Add Worker Services
builder.Services.AddHostedService<WorkflowExecutionWorker>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<WorkflowSystem.Infrastructure.Persistence.ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run(); 