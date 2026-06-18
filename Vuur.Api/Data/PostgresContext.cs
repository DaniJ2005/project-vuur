using Npgsql;
using System.Data;
using Vuur.Api.Config;

namespace Vuur.Api.Data;


public class PostgresContext
{
    private readonly string host;
    private readonly string port;
    private readonly string db;
    private readonly string user;
    private readonly string pass;

    public PostgresContext(EnvironmentVariables env)
    {
        host = env.PostgresHost ?? "postgres";
        port = env.PostgresPort ?? "5432";
        db = env.PostgresDb;
        user = env.PostgresUser;
        pass = env.PostgresPassword;
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
