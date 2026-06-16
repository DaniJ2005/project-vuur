using Dapper;
using Microsoft.AspNetCore.Identity;
using Vuur.Api.Config;
using Vuur.Api.Data;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Data.Seeding;

internal static class AdminSeeder
{
    public static async Task SeedAsync(PostgresContext postgres, EnvironmentVariables env)
    {
        var conn = postgres.CreateMasterConnection();

        var adminRoleId = await conn.ExecuteScalarAsync<Guid>(
            "SELECT id FROM roles WHERE role_name = 'admin'");

        var hasher = new PasswordHasher<User>();
        var passwordHash = hasher.HashPassword(new User(), env.AdminPassword);

        const string sql = """
            INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, created_at, updated_at)
            VALUES (@Id, @Email, @PasswordHash, @FirstName, @LastName, @RoleId, NOW(), NOW())
            ON CONFLICT (email) DO NOTHING
            """;

        var affected = await conn.ExecuteAsync(sql, new
        {
            Id           = Guid.NewGuid(),
            Email        = env.AdminEmail,
            PasswordHash = passwordHash,
            FirstName    = "Admin",
            LastName     = "Vuur",
            RoleId       = adminRoleId,
        });

        if (affected > 0)
            Console.WriteLine($"[Seeder] Admin account created: {env.AdminEmail}");
        else
            Console.WriteLine($"[Seeder] Admin account already exists — skipped.");
    }
}