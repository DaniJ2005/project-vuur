using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class UserReadRepository(PostgresContext db)
{
    public async Task<UserWithRole?> GetByIdAsync(Guid id)
    {
        const string sql = """
        SELECT u.*, r.role_name
        FROM   users u
        JOIN   roles r ON r.id = u.role_id
        WHERE  u.id = @Id
        LIMIT  1;
        """;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<UserWithRole>(sql, new { Id = id });
    }

    public async Task<User?> GetByIdAsUserAsync(Guid id)
    {
        const string sql = "SELECT * FROM users WHERE id = @Id LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = """
            SELECT u.*, r.role_name
            FROM   users u
            JOIN   roles r ON r.id = u.role_id
            WHERE  u.email = @Email
            LIMIT  1;
            """;

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

    public async Task<Role?> GetRoleByNameAsync(string roleName)
    {
        const string sql = "SELECT * FROM roles WHERE role_name = @RoleName LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Role>(sql, new { RoleName = roleName });
    }
}

public class UserWithRole
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
