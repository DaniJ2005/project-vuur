using Npgsql;
using System.Data;

namespace Vuur.Api.Data;

/// <summary>
/// Provides raw NpgsqlConnections for use with Dapper.
/// Inject this into repositories and write your own SQL.
/// </summary>
public class PostgresContext
{
    private readonly string _connectionString;

    public PostgresContext(IConfiguration configuration)
    {
        _connectionString = configuration["POSTGRES_CONNECTION_STRING"]
            ?? throw new InvalidOperationException("POSTGRES_CONNECTION_STRING is not configured.");
    }

    public IDbConnection CreateConnection()
    {
        var conn = new NpgsqlConnection(_connectionString);
        conn.Open();
        return conn;
    }
}
