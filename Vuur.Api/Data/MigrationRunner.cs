using DbUp;
using System.Reflection;

namespace Vuur.Api.Data;

/// <summary>
/// Runs all .sql files found in the Migrations/ folder (embedded as resources).
/// DbUp tracks which scripts have already run in a _SchemaVersions table —
/// so only new scripts execute. Safe to call on every startup.
/// </summary>
public static class MigrationRunner
{
    public static void Run(string connectionString)
    {
        // Ensure the database exists before running migrations
        EnsureDatabase.For.PostgresqlDatabase(connectionString);

        var upgrader = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(
                Assembly.GetExecutingAssembly(),
                // Only pick up files under the Migrations/ namespace
                filter: name => name.Contains(".Migrations."))
            .WithTransactionPerScript()   // each script runs in its own transaction
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            throw new Exception($"Database migration failed: {result.Error.Message}", result.Error);
        }

        Console.WriteLine("Database migrations applied successfully.");
    }
}
