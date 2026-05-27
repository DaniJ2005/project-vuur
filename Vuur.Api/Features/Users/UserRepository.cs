using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class UserRepository(PostgresContext db)
{
    public async Task<User> CreateAsync(User user)
    {
        const string sql = """
        INSERT INTO users (id, first_name, last_name, email, password_hash, role_id, created_at, updated_at)
        VALUES (@Id, @FirstName, @LastName, @Email, @PasswordHash, @RoleId, @CreatedAt, @UpdatedAt)
        RETURNING *;
        """;

        user.Id = Guid.NewGuid();
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
}
