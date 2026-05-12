using StackExchange.Redis;

namespace Vuur.Api.Data;

public class RedisContext
{
    private readonly IConnectionMultiplexer _connection;

    public RedisContext(IConfiguration configuration)
    {
        var connectionString = configuration["REDIS_CONNECTION_STRING"]
            ?? throw new InvalidOperationException("REDIS_CONNECTION_STRING is not configured.");

        _connection = ConnectionMultiplexer.Connect(connectionString);
    }

    public IDatabase GetDatabase(int db = -1) => _connection.GetDatabase(db);

    // Convenience shortcut
    public IDatabase Db => GetDatabase();
}
