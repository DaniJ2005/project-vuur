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

    /// <summary>
    /// Loads all line items belonging to the given orders in one query (so the
    /// service can hydrate many orders without an N+1).
    /// </summary>
    public async Task<IReadOnlyList<OrderItem>> GetItemsByOrderIdsAsync(IReadOnlyList<Guid> orderIds)
    {
        if (orderIds.Count == 0) return [];

        const string sql = "SELECT * FROM order_items WHERE order_id = ANY(@OrderIds) ORDER BY created_at;";
        using var conn = db.CreateConnection();
        var rows = await conn.QueryAsync<OrderItem>(sql, new { OrderIds = orderIds.ToArray() });
        return rows.ToList();
    }
}
