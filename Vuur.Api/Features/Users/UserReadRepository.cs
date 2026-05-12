using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

/// <summary>
/// Read-side repository: queries only, no mutations.
/// </summary>
public class UserReadRepository(PostgresContext db)
{
    public async Task<User?> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM users WHERE id = @Id LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = "SELECT * FROM users WHERE email = @Email LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Email = email.ToLowerInvariant() });
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        const string sql = "SELECT COUNT(1) FROM users WHERE email = @Email;";
        using var conn = db.CreateConnection();
        var count = await conn.ExecuteScalarAsync<int>(sql, new { Email = email.ToLowerInvariant() });
        return count > 0;
    }

    /// <summary>
    /// Returns a valid (non-expired, non-revoked) refresh token row,
    /// including the associated user_id.
    /// </summary>
    public async Task<RefreshTokenRecord?> GetValidRefreshTokenAsync(string token)
    {
        const string sql = """
            SELECT rt.id, rt.user_id, rt.token, rt.expires_at
            FROM   refresh_tokens rt
            WHERE  rt.token      = @Token
              AND  rt.revoked_at IS NULL
              AND  rt.expires_at  > @Now
            LIMIT 1;
            """;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<RefreshTokenRecord>(sql,
            new { Token = token, Now = DateTime.UtcNow });
    }
}

// Lightweight projection — no need for a full domain object
public record RefreshTokenRecord(Guid Id, Guid UserId, string Token, DateTime ExpiresAt);
