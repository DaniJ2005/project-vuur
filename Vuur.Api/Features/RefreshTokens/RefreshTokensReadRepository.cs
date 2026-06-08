using StackExchange.Redis;

namespace Vuur.Api.Features.RefreshTokens;

public class RefreshTokensReadRepository
{
    private readonly IConnectionMultiplexer _connection;
    private readonly IDatabase _db;

    public RefreshTokensReadRepository(IConnectionMultiplexer connection)
    {
        _connection = connection;
        _db = connection.GetDatabase();
    }

    public async Task<Guid?> GetAsync(string token)
    {
        var value = await _db.StringGetAsync(RefreshTokensRepository.RefreshTokenKey(token));
        return value.IsNullOrEmpty ? null : Guid.Parse((string)value!);
    }

    public async Task<IReadOnlyList<RedisRefreshTokenEntry>> GetAllAsync()
    {
        var endpoint = _connection.GetEndPoints().FirstOrDefault();
        if (endpoint is null)
            return [];

        var server = _connection.GetServer(endpoint);
        var keys = server.Keys(pattern: "refresh_token:*").ToArray();

        var entries = new List<RedisRefreshTokenEntry>(keys.Length);

        foreach (var key in keys)
        {
            var value = await _db.StringGetAsync(key);
            var ttl = await _db.KeyTimeToLiveAsync(key);

            entries.Add(new RedisRefreshTokenEntry(
                key.ToString().Replace("refresh_token:", "", StringComparison.Ordinal),
                value.ToString(),
                ttl is null ? null : DateTime.UtcNow.Add(ttl.Value)
            ));
        }

        return entries;
    }
}