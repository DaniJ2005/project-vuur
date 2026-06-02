using StackExchange.Redis;
using Vuur.Api.Config;
namespace Vuur.Api.Data;

public class RedisContext
{
    private readonly IConnectionMultiplexer _connection;
    public IDatabase Db => _connection.GetDatabase();

    private static readonly TimeSpan RefreshTokenTtl = TimeSpan.FromDays(7);

    private static string RefreshTokenKey(string token) => $"refresh_token:{token}";

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

    public async Task<Guid?> GetRefreshTokenAsync(string token)
    {
        var value = await Db.StringGetAsync(RefreshTokenKey(token));
        return value.IsNullOrEmpty ? null : Guid.Parse((string)value!);
    }

    public async Task SetRefreshTokenAsync(string token, Guid userId)
        => await Db.StringSetAsync(RefreshTokenKey(token), userId.ToString(), RefreshTokenTtl);

    public async Task DeleteRefreshTokenAsync(string token)
        => await Db.KeyDeleteAsync(RefreshTokenKey(token));
}
