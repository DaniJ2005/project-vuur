using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Orders;

public class OrderReadRepository(PostgresContext db)
{
    public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId)
    {
        const string sql = "SELECT * FROM orders WHERE user_id = @UserId ORDER BY created_at DESC;";
        using var conn = db.CreateConnection();
        return await conn.QueryAsync<Order>(sql, new { UserId = userId });
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM orders WHERE id = @Id LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Order>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        const string sql = "SELECT * FROM orders ORDER BY created_at DESC;";
        using var conn = db.CreateConnection();
        return await conn.QueryAsync<Order>(sql);
    }
}