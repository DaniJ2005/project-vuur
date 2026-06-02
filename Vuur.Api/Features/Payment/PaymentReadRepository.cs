using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Orders;

public class PaymentReadRepository(PostgresContext db)
{
    public async Task<Payment?> GetByOrderIdAsync(Guid orderId)
    {
        const string sql = "SELECT * FROM payments WHERE order_id = @OrderId LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Payment>(sql, new { OrderId = orderId });
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        const string sql = "SELECT * FROM payments ORDER BY created_at DESC;";
        using var conn = db.CreateConnection();
        return await conn.QueryAsync<Payment>(sql);
    }
}