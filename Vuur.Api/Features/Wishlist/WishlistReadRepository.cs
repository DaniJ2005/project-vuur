using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class WishlistReadRepository(PostgresContext db)
{
    public async Task<IEnumerable<WishlistItem>> GetByUserIdAsync(Guid userId)
    {
        const string sql = "SELECT * FROM wishlist WHERE user_id = @UserId ORDER BY created_at DESC;";
        using var conn = db.CreateConnection();
        return await conn.QueryAsync<WishlistItem>(sql, new { UserId = userId });
    }
}
