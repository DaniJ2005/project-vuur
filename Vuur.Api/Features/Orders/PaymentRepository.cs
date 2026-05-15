using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Orders;

public class PaymentRepository(PostgresContext db)
{
    public async Task<Payment> CreateAsync(Payment payment)
    {
        const string sql = """
            INSERT INTO payments (id, order_id, products_id, created_at, updated_at)
            VALUES (@Id, @OrderId, @ProductsId, @CreatedAt, @UpdatedAt)
            RETURNING *;
            """;

        payment.Id = Guid.NewGuid();
        payment.CreatedAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;

        using var conn = db.CreateConnection();
        return await conn.QuerySingleAsync<Payment>(sql, payment);
    }
}