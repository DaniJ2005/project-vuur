using Dapper;
using System.Net;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class AddressRepository(PostgresContext db)
{
    public async Task<Address> CreateAsync(Address address)
    {
        const string sql = """
            INSERT INTO addresses (id, user_id, address, city, country_code, created_at, updated_at)
            VALUES (@Id, @UserId, @Street, @City, @CountryCode, @CreatedAt, @UpdatedAt)
            RETURNING *;
            """;

        address.Id = Guid.NewGuid();
        address.CreatedAt = DateTime.UtcNow;
        address.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleAsync<Address>(sql, address);
    }

    public async Task<Address?> UpdateAsync(Address address)
    {
        const string sql = """
            UPDATE addresses
            SET address      = @Street,
                city         = @City,
                country_code = @CountryCode,
                updated_at   = @UpdatedAt
            WHERE id = @Id AND user_id = @UserId
            RETURNING *;
            """;

        address.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Address>(sql, address);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        const string sql = "DELETE FROM addresses WHERE id = @Id AND user_id = @UserId;";
        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }
}