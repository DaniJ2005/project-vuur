using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class WishlistRepository(PostgresContext db)
{
    public async Task<WishlistItem> AddAsync(Guid userId, string productsId)
    {
        const string sql = """
            INSERT INTO wishlist (id, user_id, products_id, created_at, updated_at)
            VALUES (@Id, @UserId, @ProductsId, @CreatedAt, @UpdatedAt)
            ON CONFLICT (user_id, products_id) DO UPDATE
            SET updated_at = now()
            RETURNING *;
            """;

        var id = Guid.NewGuid();
        var now = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleAsync<WishlistItem>(sql, new
        {
            Id = id,
            UserId = userId,
            ProductsId = productsId,
            CreatedAt = now,
            UpdatedAt = now,
        });
    }

    public async Task<bool> RemoveAsync(Guid userId, string productsId)
    {
        const string sql = "DELETE FROM wishlist WHERE user_id = @UserId AND products_id = @ProductsId;";
        using var conn = db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { UserId = userId, ProductsId = productsId });
        return rows > 0;
    }
}
