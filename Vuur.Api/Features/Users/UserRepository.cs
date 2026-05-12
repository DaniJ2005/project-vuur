using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

/// <summary>
/// Write-side repository: insert, update, delete.
/// </summary>
public class UserRepository(PostgresContext db)
{
    public async Task<User> CreateAsync(User user)
    {
        const string sql = """
            INSERT INTO users (id, first_name, last_name, email, password_hash, role, created_at, updated_at)
            VALUES (@Id, @FirstName, @LastName, @Email, @PasswordHash, @Role, @CreatedAt, @UpdatedAt)
            RETURNING *;
            """;

        user.Id        = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleAsync<User>(sql, user);
    }

    public async Task<bool> UpdatePasswordAsync(Guid userId, string newHash)
    {
        const string sql = """
            UPDATE users
            SET password_hash = @Hash,
                updated_at    = @Now
            WHERE id = @Id;
            """;

        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Hash = newHash, Now = DateTime.UtcNow, Id = userId });
        return rows > 0;
    }

    public async Task SaveRefreshTokenAsync(Guid userId, string token, DateTime expiresAt)
    {
        const string sql = """
            INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
            VALUES (gen_random_uuid(), @UserId, @Token, @ExpiresAt, @Now);
            """;

        using var conn = db.CreateConnection();
        await conn.ExecuteAsync(sql, new { UserId = userId, Token = token, ExpiresAt = expiresAt, Now = DateTime.UtcNow });
    }

    public async Task<bool> RevokeRefreshTokenAsync(string token)
    {
        const string sql = """
            UPDATE refresh_tokens
            SET revoked_at = @Now
            WHERE token = @Token AND revoked_at IS NULL;
            """;

        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Token = token, Now = DateTime.UtcNow });
        return rows > 0;
    }

    public async Task RevokeAllRefreshTokensForUserAsync(Guid userId)
    {
        const string sql = """
            UPDATE refresh_tokens
            SET revoked_at = @Now
            WHERE user_id = @UserId AND revoked_at IS NULL;
            """;

        using var conn = db.CreateConnection();
        await conn.ExecuteAsync(sql, new { UserId = userId, Now = DateTime.UtcNow });
    }
}
