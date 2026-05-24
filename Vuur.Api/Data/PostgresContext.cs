using Npgsql;
using System.Data;

namespace Vuur.Api.Data;

/// <summary>
/// Provides raw NpgsqlConnections for use with Dapper.
/// Inject this into repositories and write your own SQL.
/// </summary>
public class PostgresContext
{
    private readonly string host;
    private readonly string port;
    private readonly string db;
    private readonly string user;
    private readonly string pass;

    public PostgresContext(IConfiguration config)
    {
        host = config["POSTGRES_HOST"] ?? "localhost";
        port = config["POSTGRES_PORT"] ?? "5433";
        db = config["POSTGRES_DB"] ?? throw new InvalidOperationException("POSTGRES_DB is not configured.");
        user = config["POSTGRES_USER"] ?? throw new InvalidOperationException("POSTGRES_USER is not configured.");
        pass = config["POSTGRES_PASSWORD"] ?? throw new InvalidOperationException("POSTGRES_PASSWORD is not configured.");
    }

    public IDbConnection CreateConnection()
    {
        string connectionString = $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
        var conn = new NpgsqlConnection(connectionString);
        conn.Open();
        return conn;
    }

    public void RunMigrations()
    {
        string connectionString = $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
        MigrationRunner.Run(connectionString);
    }
}
