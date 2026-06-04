using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vuur.Api.Data;
using Vuur.Api.Features.Products;
using Vuur.Api.Shared;

namespace Vuur.Api.Features.Admin;

[ApiController]
[Route("/api/admin")]
[Produces("application/json")]
[Authorize(Roles = "admin")]
public class AdminController(
    PostgresContext postgres,
    RedisContext redis,
    IProductReadRepository productReader,
    AdminUserRepository adminUserRepo) : ControllerBase
{
    private static readonly IReadOnlySet<string> ValidOrderStatuses =
        new HashSet<string> { "pending", "paid", "fulfilled", "cancelled" };

    // ── Users

    // GET /api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
        => Ok(await adminUserRepo.GetAllAsync());

    // POST /api/admin/users
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest req)
    {
        var created = await adminUserRepo.CreateAsync(req);
        if (created is null)
            return BadRequest(new { error = "Invalid role specified. Use 'customer' or 'admin'." });
        return Ok(created);
    }

    // PUT /api/admin/users/{id}
    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] AdminUpdateUserRequest req)
    {
        var updated = await adminUserRepo.UpdateAsync(id, req);
        if (updated is null)
            return NotFound(new { error = "User not found or invalid role." });
        return Ok(updated);
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var deleted = await adminUserRepo.DeleteAsync(id);
        return deleted ? NoContent() : NotFound(new { error = "User not found." });
    }

    // ── Orders

    // GET /api/admin/orders
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        const string sql = """
            SELECT id::text             AS "id",
                   user_id::text        AS "userId",
                   customer_email       AS "customerEmail",
                   customer_first_name  AS "customerFirstName",
                   customer_last_name   AS "customerLastName",
                   status,
                   requires_shipping    AS "requiresShipping",
                   shipping_method      AS "shippingMethod",
                   shipping_price       AS "shippingPrice",
                   total_amount         AS "totalAmount",
                   created_at           AS "createdAt",
                   updated_at           AS "updatedAt"
            FROM   orders
            ORDER  BY created_at DESC;
            """;
        return Ok(await QueryRowsAsync(sql));
    }

    // PATCH /api/admin/orders/{id}/status
    [HttpPatch("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] AdminUpdateOrderStatusRequest req)
    {
        if (!ValidOrderStatuses.Contains(req.Status))
            return BadRequest(new { error = $"Invalid status. Valid values: {string.Join(", ", ValidOrderStatuses)}." });

        const string sql = """
            UPDATE orders
            SET    status     = @Status,
                   updated_at = @Now
            WHERE  id = @Id
            RETURNING id::text AS id, status, updated_at AS "updatedAt";
            """;

        using var conn = postgres.CreateConnection();
        var result = await conn.QuerySingleOrDefaultAsync(sql, new { Status = req.Status, Now = DateTime.UtcNow, Id = id });
        return result is null ? NotFound(new { error = "Order not found." }) : Ok(result);
    }

    // DELETE /api/admin/orders/{id}
    [HttpDelete("orders/{id:guid}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        const string sql = "DELETE FROM orders WHERE id = @Id;";
        using var conn = postgres.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        return rows > 0 ? NoContent() : NotFound(new { error = "Order not found." });
    }

    // ── Addresses

    // GET /api/admin/addresses
    [HttpGet("addresses")]
    public async Task<IActionResult> GetAddresses()
    {
        const string sql = """
            SELECT a.id::text        AS "id",
                   a.user_id::text   AS "userId",
                   u.email           AS "userEmail",
                   a.label,
                   a.street,
                   a.house_number    AS "houseNumber",
                   a.house_ext       AS "houseExt",
                   a.post_code       AS "postCode",
                   a.city,
                   a.country_code    AS "countryCode",
                   a.is_default      AS "isDefault",
                   a.created_at      AS "createdAt",
                   a.updated_at      AS "updatedAt"
            FROM   addresses a
            JOIN   users u ON u.id = a.user_id
            ORDER  BY a.created_at DESC;
            """;
        return Ok(await QueryRowsAsync(sql));
    }

    // DELETE /api/admin/addresses/{id}
    [HttpDelete("addresses/{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        const string sql = "DELETE FROM addresses WHERE id = @Id;";
        using var conn = postgres.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        return rows > 0 ? NoContent() : NotFound(new { error = "Address not found." });
    }

    // ── Wishlist

    // GET /api/admin/wishlist
    [HttpGet("wishlist")]
    public async Task<IActionResult> GetWishlist()
    {
        const string sql = """
            SELECT w.id::text        AS "id",
                   w.user_id::text   AS "userId",
                   u.email           AS "userEmail",
                   w.products_id     AS "productsId",
                   w.created_at      AS "createdAt",
                   w.updated_at      AS "updatedAt"
            FROM   wishlist w
            JOIN   users u ON u.id = w.user_id
            ORDER  BY w.created_at DESC;
            """;
        return Ok(await QueryRowsAsync(sql));
    }

    // DELETE /api/admin/wishlist/{id}
    [HttpDelete("wishlist/{id:guid}")]
    public async Task<IActionResult> DeleteWishlistItem(Guid id)
    {
        const string sql = "DELETE FROM wishlist WHERE id = @Id;";
        using var conn = postgres.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { Id = id });
        return rows > 0 ? NoContent() : NotFound(new { error = "Wishlist item not found." });
    }

    // ── MongoDB products

    // GET /api/admin/mongo/products
    [HttpGet("mongo/products")]
    public async Task<IActionResult> GetMongoProducts()
        => Ok(await productReader.GetAllAsync());

    // ── Redis refresh tokens

    // GET /api/admin/redis/refresh-tokens
    [HttpGet("redis/refresh-tokens")]
    public async Task<IActionResult> GetRefreshTokens()
    {
        var tokens = await redis.GetRefreshTokensAsync();
        return Ok(tokens.Select(t => new AdminRefreshTokenResponse(
            t.Token,
            t.Token.Length <= 10 ? t.Token : $"{t.Token[..6]}...{t.Token[^4..]}",
            t.UserId,
            t.ExpiresAt)));
    }

    // DELETE /api/admin/redis/refresh-tokens/{token}
    [HttpDelete("redis/refresh-tokens/{token}")]
    public async Task<IActionResult> RevokeRefreshToken(string token)
    {
        await redis.DeleteRefreshTokenAsync(token);
        return NoContent();
    }

    // ── Analytics

    // GET /api/admin/analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var totalOrders   = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM orders;");
        var totalPayments = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM payments;");
        var totalWishlist = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM wishlist;");
        var totalUsers    = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM users;");
        var totalProducts = (await productReader.GetAllAsync()).Count;
        var totalDistinct = await QueryScalarAsync<int>("SELECT COUNT(DISTINCT product_id)::int FROM order_items;");

        var topRows = await QueryRowsAsync("""
            SELECT   product_id         AS "productId",
                     SUM(quantity)::int AS "orderCount"
            FROM     order_items
            GROUP BY product_id
            ORDER BY SUM(quantity) DESC
            LIMIT    5;
            """);

        var topProducts = new List<AdminAnalyticsTopProductResponse>();
        foreach (var row in topRows)
        {
            var productId  = row.TryGetValue("productId",  out var pid)   ? pid?.ToString()  ?? string.Empty : string.Empty;
            var orderCount = row.TryGetValue("orderCount", out var count) && int.TryParse(count?.ToString(), out var n) ? n : 0;
            var product    = await productReader.GetByIdAsync(productId);
            topProducts.Add(new AdminAnalyticsTopProductResponse(productId, product?.ProductName ?? "Onbekend product", orderCount));
        }

        return Ok(new AdminAnalyticsResponse(
            totalOrders, totalPayments, totalWishlist, totalUsers,
            totalProducts, totalDistinct, 0, topProducts));
    }

    // ── Activity log

    // GET /api/admin/activity
    [HttpGet("activity")]
    public async Task<IActionResult> GetActivity()
    {
        const string sql = """
            SELECT id, description, timestamp FROM (
                SELECT o.id::text AS id,
                       CONCAT(COALESCE(u.first_name || ' ' || u.last_name, o.customer_email),
                              ' plaatste bestelling ', o.id::text) AS description,
                       o.created_at AS timestamp
                FROM   orders o
                LEFT JOIN users u ON u.id = o.user_id
                UNION ALL
                SELECT p.id::text AS id,
                       CONCAT(COALESCE(u.first_name || ' ' || u.last_name, o.customer_email),
                              ' betaalde order ', p.order_id::text) AS description,
                       p.created_at AS timestamp
                FROM   payments p
                JOIN   orders o ON o.id = p.order_id
                LEFT JOIN users u ON u.id = o.user_id
                UNION ALL
                SELECT w.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name,
                              ' voegde product ', w.products_id, ' toe aan wishlist') AS description,
                       w.created_at AS timestamp
                FROM   wishlist w
                JOIN   users u ON u.id = w.user_id
                UNION ALL
                SELECT a.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' voegde een adres toe') AS description,
                       a.created_at AS timestamp
                FROM   addresses a
                JOIN   users u ON u.id = a.user_id
                UNION ALL
                SELECT u.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' maakte een account aan') AS description,
                       u.created_at AS timestamp
                FROM   users u
            ) x
            ORDER BY timestamp DESC
            LIMIT 20;
            """;

        var rows = await QueryRowsAsync(sql);
        return Ok(rows.Select(row =>
        {
            var rawTs = row.TryGetValue("timestamp", out var ts) ? ts?.ToString() : null;
            var timestamp = DateTime.TryParse(rawTs, null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var parsed)
                ? parsed : DateTime.MinValue;
            return new AdminActivityResponse(
                row["id"]?.ToString() ?? string.Empty,
                row["description"]?.ToString() ?? string.Empty,
                timestamp);
        }));
    }

    // ── Helpers

    private async Task<T> QueryScalarAsync<T>(string sql)
    {
        using var conn = postgres.CreateConnection();
        return await conn.ExecuteScalarAsync<T>(sql);
    }

    private async Task<IReadOnlyList<Dictionary<string, object?>>> QueryRowsAsync(string sql)
    {
        using var conn = postgres.CreateConnection();
        var rows = await conn.QueryAsync(sql);
        return rows
            .Select(row => ((IDictionary<string, object?>)row)
                .ToDictionary(kv => kv.Key, kv => kv.Value))
            .ToList();
    }
}