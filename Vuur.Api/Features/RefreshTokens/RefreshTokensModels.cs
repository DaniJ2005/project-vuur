namespace Vuur.Api.Features.RefreshTokens;

public record RedisRefreshTokenEntry(
    string Token,
    string UserId,
    DateTime? ExpiresAt
);