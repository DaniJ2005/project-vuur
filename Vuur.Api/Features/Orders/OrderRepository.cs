using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Orders;

public class OrderRepository(PostgresContext db)
{
    /// <summary>
    /// Persists an order together with its line items in a single transaction.
    /// The order id/timestamps and each item's id/order_id/timestamps are assigned
    /// here. Returns the persisted order. Game keys are assigned later (on payment).
    /// </summary>
    public async Task<Order> CreateAsync(Order order, IReadOnlyList<OrderItem> items)
    {
        order.Id = Guid.NewGuid();
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        const string orderSql = """
            INSERT INTO orders (
                id, user_id, customer_email, customer_first_name, customer_last_name,
                status, requires_shipping, shipping_method, shipping_price, total_amount,
                ship_street, ship_house_number, ship_house_ext, ship_post_code, ship_city, ship_country_code,
                created_at, updated_at)
            VALUES (
                @Id, @UserId, @CustomerEmail, @CustomerFirstName, @CustomerLastName,
                @Status, @RequiresShipping, @ShippingMethod, @ShippingPrice, @TotalAmount,
                @ShipStreet, @ShipHouseNumber, @ShipHouseExt, @ShipPostCode, @ShipCity, @ShipCountryCode,
                @CreatedAt, @UpdatedAt)
            RETURNING *;
            """;

        const string itemSql = """
            INSERT INTO order_items (
                id, order_id, product_id, product_name, product_type, platform, unit_price, quantity, created_at, updated_at)
            VALUES (
                @Id, @OrderId, @ProductId, @ProductName, @ProductType, @Platform, @UnitPrice, @Quantity, @CreatedAt, @UpdatedAt);
            """;

        using var conn = db.CreateConnection();
        using var tx = conn.BeginTransaction();

        var created = await conn.QuerySingleAsync<Order>(orderSql, order, tx);

        var now = DateTime.UtcNow;
        foreach (var item in items)
        {
            item.Id = Guid.NewGuid();
            item.OrderId = created.Id;
            item.CreatedAt = now;
            item.UpdatedAt = now;
        }

        if (items.Count > 0)
        {
            // Dapper runs the insert once per element when given a collection.
            await conn.ExecuteAsync(itemSql, items, tx);
        }

        tx.Commit();
        return created;
    }
}
