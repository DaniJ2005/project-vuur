using StackExchange.Redis;
using Vuur.Api.Config;

namespace Vuur.Api.Data;

public class RedisContext
{
    private readonly IConnectionMultiplexer _connection;

    public RedisContext(EnvironmentVariables env)
    {
        // Redis draait onder de docker service-naam 'redis' op de standaard port.
        // Voor lokale dev exposed docker-compose.override.yml dezelfde port op
        // de host, dus deze connection string werkt in beide omgevingen identiek
        // zolang je via docker compose draait.
        var connectionString = $"redis:6379,password={env.RedisPassword}";
        _connection = ConnectionMultiplexer.Connect(connectionString);
    }

    public IDatabase GetDatabase(int db = -1) => _connection.GetDatabase(db);

    // Convenience shortcut
    public IDatabase Db => GetDatabase();
}
