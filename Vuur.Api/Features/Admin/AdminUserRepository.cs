using Dapper;
using Microsoft.AspNetCore.Identity;
using Vuur.Api.Data;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Features.Admin;

/// <summary>
/// Admin-only write operations on users that don't belong in the regular
/// UserRepository (which is scoped to self-service auth flows).
/// </summary>
public class AdminUserRepository(PostgresContext db)
{
    private readonly PasswordHasher<User> _hasher = new();

    public async Task<AdminUserResponse?> CreateAsync(AdminCreateUserRequest req)
    {
        var role = await GetRoleAsync(req.Role);
        if (role is null) return null;

        var user = new User
        {
            Id        = Guid.NewGuid(),
            FirstName = req.FirstName.Trim(),
            LastName  = req.LastName.Trim(),
            Email     = req.Email.ToLowerInvariant(),
            RoleId    = role.Id,
            RoleName  = role.RoleName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        user.PasswordHash = _hasher.HashPassword(user, req.Password);

        const string sql = """
            WITH inserted AS (
                INSERT INTO users
                    (id, first_name, last_name, email, password_hash, role_id, created_at, updated_at)
                VALUES
                    (@Id, @FirstName, @LastName, @Email, @PasswordHash, @RoleId, @CreatedAt, @UpdatedAt)
                RETURNING *
            )
            SELECT i.*, r.role_name
            FROM   inserted i
            JOIN   roles r ON r.id = i.role_id;
            """;

        using var conn = db.CreateConnection();
        var created = await conn.QuerySingleAsync<User>(sql, user);
        return ToResponse(created);
    }

    public async Task<AdminUserResponse?> UpdateAsync(Guid id, AdminUpdateUserRequest req)
    {
        // Build the SET clause dynamically based on which fields were provided.
        var sets  = new List<string> { "updated_at = @Now" };
        var param = new DynamicParameters();
        param.Add("@Id",  id);
        param.Add("@Now", DateTime.UtcNow);

        if (req.FirstName is not null) { sets.Add("first_name = @FirstName"); param.Add("@FirstName", req.FirstName.Trim()); }
        if (req.LastName  is not null) { sets.Add("last_name  = @LastName");  param.Add("@LastName",  req.LastName.Trim());  }
        if (req.Email     is not null) { sets.Add("email      = @Email");     param.Add("@Email",     req.Email.ToLowerInvariant()); }

        if (req.Role is not null)
        {
            var role = await GetRoleAsync(req.Role);
            if (role is null) return null;
            sets.Add("role_id = @RoleId");
            param.Add("@RoleId", role.Id);
        }

        var sql = $"""
            WITH updated AS (
                UPDATE users SET {string.Join(", ", sets)}
                WHERE id = @Id
                RETURNING *
            )
            SELECT u.*, r.role_name
            FROM   updated u
            JOIN   roles r ON r.id = u.role_id;
            """;

        using var conn = db.CreateConnection();
        var user = await conn.QuerySingleOrDefaultAsync<User>(sql, param);
        return user is null ? null : ToResponse(user);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM users WHERE id = @Id;";
        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<IReadOnlyList<AdminUserResponse>> GetAllAsync()
    {
        const string sql = """
            SELECT u.*, r.role_name
            FROM   users u
            JOIN   roles r ON r.id = u.role_id
            ORDER  BY u.created_at DESC;
            """;

        using var conn = db.CreateConnection();
        var users = await conn.QueryAsync<User>(sql);
        return users.Select(ToResponse).ToList();
    }

    private async Task<Role?> GetRoleAsync(string roleName)
    {
        const string sql = "SELECT * FROM roles WHERE role_name = @Name LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Role>(sql, new { Name = roleName.ToLowerInvariant() });
    }

    private static AdminUserResponse ToResponse(User u) =>
        new(u.Id, u.FirstName, u.LastName, u.Email, u.RoleName, u.CreatedAt, u.UpdatedAt);
}