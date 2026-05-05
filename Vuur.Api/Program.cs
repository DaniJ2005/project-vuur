using Vuur.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Load .env in development and push values into configuration
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        DotNetEnv.Env.Load(envPath);
        // Push loaded env vars into IConfiguration so contexts can read them
        builder.Configuration.AddEnvironmentVariables();
    }
}

// PostgreSQL
builder.Services.AddSingleton<PostgresContext>();

// MongoDB
builder.Services.AddSingleton<MongoContext>();

// Redis
builder.Services.AddSingleton<RedisContext>();

// Repositories


// Standard services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Run SQL migrations via DbUp (before the app starts serving requests)
var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
    ?? app.Configuration["POSTGRES_CONNECTION_STRING"]
    ?? throw new InvalidOperationException("POSTGRES_CONNECTION_STRING is not configured.");

MigrationRunner.Run(connectionString);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
