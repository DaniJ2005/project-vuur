using Dapper;
using System.Net;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class AddressRepository(PostgresContext db)
{
    public async Task<Address> CreateAsync(Address address)
    {
        const string sql = """
            INSERT INTO addresses
                (id, user_id, label, street, house_number, house_ext,
                 post_code, city, country_code, is_default,
                 created_at, updated_at)
            VALUES
                (@Id, @UserId, @Label, @Street, @HouseNumber, @HouseExt,
                 @PostCode, @City, @CountryCode, @IsDefault,
                 @CreatedAt, @UpdatedAt)
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
            SET label        = @Label,
                street       = @Street,
                house_number = @HouseNumber,
                house_ext    = @HouseExt,
                post_code    = @PostCode,
                city         = @City,
                country_code = @CountryCode,
                is_default   = @IsDefault,
                updated_at   = @UpdatedAt
            WHERE id = @Id AND user_id = @UserId
            RETURNING *;
            """;

        address.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Address>(sql, address);
    }

    /// <summary>Clear the default flag on all of the user's addresses except one.</summary>
    public async Task ClearDefaultAsync(Guid userId, Guid exceptId)
    {
        const string sql = """
            UPDATE addresses
            SET is_default = false, updated_at = now()
            WHERE user_id = @UserId AND id <> @ExceptId AND is_default;
            """;

        using var conn = db.CreateConnection();
        await conn.ExecuteAsync(sql, new { UserId = userId, ExceptId = exceptId });
    }

    /// <summary>Set a single address as the user's default (caller must clear others first).</summary>
    public async Task<Address?> SetDefaultAsync(Guid id, Guid userId)
    {
        const string sql = """
            UPDATE addresses
            SET is_default = true, updated_at = now()
            WHERE id = @Id AND user_id = @UserId
            RETURNING *;
            """;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Address>(sql, new { Id = id, UserId = userId });
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        const string sql = "DELETE FROM addresses WHERE id = @Id AND user_id = @UserId;";
        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }
}