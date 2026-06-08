using StackExchange.Redis;
using Vuur.Api.Config;
using Vuur.Api.Features.RefreshTokens;
namespace Vuur.Api.Data;

public class RedisContext
{
    public readonly IConnectionMultiplexer _connection;
    public IDatabase Db => _connection.GetDatabase();

    public RedisContext(EnvironmentVariables env, IWebHostEnvironment webHostEnv)
    {
        var password = env.RedisPassword
            ?? throw new InvalidOperationException("REDIS_PASSWORD is not configured.");

        var host = webHostEnv.IsDevelopment() ? "localhost" : "vuur_redis";

        var options = new ConfigurationOptions
        {
            EndPoints = { $"{host}:6379" },
            Password = password,
            AbortOnConnectFail = false
        };

        _connection = ConnectionMultiplexer.Connect(options);
    }
}
