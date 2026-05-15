using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Orders;

public class OrderRepository(PostgresContext db)
{
    public async Task<Order> CreateAsync(Order order)
    {
        const string sql = """
            INSERT INTO orders (id, user_id, products_id, created_at, updated_at)
            VALUES (@Id, @UserId, @ProductsId, @CreatedAt, @UpdatedAt)
            RETURNING *;
            """;

        order.Id = Guid.NewGuid();
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleAsync<Order>(sql, order);
    }
}