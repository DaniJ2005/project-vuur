using StackExchange.Redis;

namespace Vuur.Api.Features.RefreshTokens;

public class RefreshTokensRepository
{
    private readonly IDatabase _db;

    public static readonly TimeSpan RefreshTokenTtl = TimeSpan.FromDays(7);

    public static string RefreshTokenKey(string token)
        => $"refresh_token:{token}";

    public RefreshTokensRepository(IConnectionMultiplexer connection)
    {
        _db = connection.GetDatabase();
    }

    public async Task SetRefreshTokenAsync(string token, Guid userId)
        => await _db.StringSetAsync(RefreshTokenKey(token), userId.ToString(), RefreshTokenTtl);

    public async Task DeleteRefreshTokenAsync(string token)
        => await _db.KeyDeleteAsync(RefreshTokenKey(token));
}