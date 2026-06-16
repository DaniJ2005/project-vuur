using Npgsql;
using System.Data;
using Vuur.Api.Config;

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

    // Runtime credentials
    private readonly string user;
    private readonly string pass;

    // Master credentials
    // always the base POSTGRES_USER, used for migrations + seeding
    private readonly string masterUser;
    private readonly string masterPass;

    public DbRole Role { get; }
    public enum DbRole { Admin, Dev, Support, ReadOnly }

    public PostgresContext(EnvironmentVariables env)
    {
        host = env.PostgresHost ?? "postgres";
        port = env.PostgresPort ?? "5432";
        db = env.PostgresDb;

        // every dev has this
        masterUser = env.PostgresUser;
        masterPass = env.PostgresPassword;
        
        // Pick the highest privilege role that is fully configured
        if (IsSet(env.PostgresAdminUser, env.PostgresAdminPassword))
        {
            user = env.PostgresAdminUser!;
            pass = env.PostgresAdminPassword!;
            Role  = DbRole.Admin;
        }
        else if (IsSet(env.PostgresDevUser, env.PostgresDevPassword))
        {
            user = env.PostgresDevUser!;
            pass = env.PostgresDevPassword!;
            Role  = DbRole.Dev;
        }
        else if (IsSet(env.PostgresSupportUser, env.PostgresSupportPassword))
        {
            user = env.PostgresSupportUser!;
            pass = env.PostgresSupportPassword!;
            Role  = DbRole.Support;
        }
        else if (IsSet(env.PostgresReadonlyUser, env.PostgresReadonlyPassword))
        {
            user = env.PostgresReadonlyUser!;
            pass = env.PostgresReadonlyPassword!;
            Role  = DbRole.ReadOnly;
        }
        else
        {
            user = masterUser;
            pass = masterPass;
            Role  = DbRole.Admin;
        }
    }

    public IDbConnection CreateConnection()
    {
        var conn = new NpgsqlConnection(Build(masterUser, masterPass));
        conn.Open();
        return conn;
    }

    public IDbConnection CreateRoleConnection()
    {
        var conn = new NpgsqlConnection(Build(user, pass));
        conn.Open();
        return conn;
    }

    public IDbConnection CreateMasterConnection()
    {
        var conn = new NpgsqlConnection(Build(masterUser, masterPass));
        conn.Open();
        return conn;
    }

    public void RunMigrations()
        =>  MigrationRunner.Run(Build(masterUser, masterPass));

    public bool CanWrite    => Role is DbRole.Admin or DbRole.Dev;
    public bool CanSeePII   => Role is DbRole.Admin or DbRole.Support;
    public bool IsAdmin => Role is DbRole.Admin;

    private string Build(string user, string pass) =>
        $"Host={host};Port={port};Database={db};Username={user};Password={pass}";

    private static bool IsSet(string? user, string? pass) =>
        !string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(pass);
}
