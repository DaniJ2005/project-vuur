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
    IProductReadRepository productReader) : ControllerBase
{
    // ── Table definitions ─────────────────────────────────────────────────────
    //
    // SelectSql must alias all columns to camelCase so the JSON response is
    // consistent with the rest of the API. Queries are kept in sync with the
    // migration history:
    //   V003 created addresses with column 'address'
    //   V007 renamed it to 'street' and added label/house_number/house_ext/post_code/is_default
    //   V004 created orders with products_id
    //   V008 dropped products_id and replaced it with order_items + status + totals

    private static readonly IReadOnlyDictionary<string, AdminPostgresTable> Tables =
        new Dictionary<string, AdminPostgresTable>(StringComparer.OrdinalIgnoreCase)
        {
            ["users"] = new(
                Name: "users",
                SelectSql: """
                    SELECT id::text          AS "id",
                           first_name        AS "firstName",
                           last_name         AS "lastName",
                           email,
                           created_at        AS "createdAt",
                           updated_at        AS "updatedAt"
                    FROM   users
                    ORDER  BY created_at DESC;
                    """,
                DeleteSql: "DELETE FROM users WHERE id = @Id;"),

            ["addresses"] = new(
                Name: "addresses",
                SelectSql: """
                    SELECT id::text          AS "id",
                           user_id::text     AS "userId",
                           label,
                           street,
                           house_number      AS "houseNumber",
                           house_ext         AS "houseExt",
                           post_code         AS "postCode",
                           city,
                           country_code      AS "countryCode",
                           is_default        AS "isDefault",
                           created_at        AS "createdAt",
                           updated_at        AS "updatedAt"
                    FROM   addresses
                    ORDER  BY created_at DESC;
                    """,
                DeleteSql: "DELETE FROM addresses WHERE id = @Id;"),

            ["orders"] = new(
                Name: "orders",
                SelectSql: """
                    SELECT id::text              AS "id",
                           user_id::text         AS "userId",
                           customer_email        AS "customerEmail",
                           customer_first_name   AS "customerFirstName",
                           customer_last_name    AS "customerLastName",
                           status,
                           requires_shipping     AS "requiresShipping",
                           total_amount          AS "totalAmount",
                           created_at            AS "createdAt",
                           updated_at            AS "updatedAt"
                    FROM   orders
                    ORDER  BY created_at DESC;
                    """,
                DeleteSql: "DELETE FROM orders WHERE id = @Id;"),

            ["payments"] = new(
                Name: "payments",
                SelectSql: """
                    SELECT id::text          AS "id",
                           order_id::text    AS "orderId",
                           created_at        AS "createdAt",
                           updated_at        AS "updatedAt"
                    FROM   payments
                    ORDER  BY created_at DESC;
                    """,
                DeleteSql: "DELETE FROM payments WHERE id = @Id;"),

            ["wishlist"] = new(
                Name: "wishlist",
                SelectSql: """
                    SELECT id::text          AS "id",
                           user_id::text     AS "userId",
                           products_id       AS "productsId",
                           created_at        AS "createdAt",
                           updated_at        AS "updatedAt"
                    FROM   wishlist
                    ORDER  BY created_at DESC;
                    """,
                DeleteSql: "DELETE FROM wishlist WHERE id = @Id;"),
        };

    // ── Postgres endpoints ────────────────────────────────────────────────────

    // GET /api/admin/postgres
    [HttpGet("postgres")]
    public async Task<IActionResult> GetPostgres()
    {
        var tables = new List<AdminTableResponse>();

        foreach (var table in Tables.Values)
        {
            tables.Add(new AdminTableResponse(
                table.Name,
                table.DeleteSql is not null,
                await QueryRowsAsync(table.SelectSql)));
        }

        return Ok(tables);
    }

    // DELETE /api/admin/postgres/{tableName}/{id}
    [HttpDelete("postgres/{tableName}/{id:guid}")]
    public async Task<IActionResult> DeletePostgresRow(string tableName, Guid id)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table is read-only." });

        using var conn = postgres.CreateConnection();
        var affected = await conn.ExecuteAsync(table.DeleteSql, new { Id = id });
        return affected > 0 ? NoContent() : NotFound(new { error = "Row not found." });
    }

    // POST /api/admin/postgres/{tableName}
    [HttpPost("postgres/{tableName}")]
    public async Task<IActionResult> CreatePostgresRow(
        string tableName,
        [FromBody] Dictionary<string, object?> payload)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table is read-only." });

        var fields = payload
            .Where(kv => kv.Key != "id" && !string.IsNullOrWhiteSpace(kv.Value?.ToString()))
            .ToDictionary(kv => SqlHelpers.ToSnakeCase(kv.Key), kv => SqlHelpers.ConvertJsonElement(kv.Value));

        if (fields.Count == 0)
            return BadRequest(new { error = "No valid fields to insert." });

        var columns   = string.Join(", ", fields.Keys);
        var paramRefs = string.Join(", ", fields.Keys.Select(k => "@" + k));
        var sql       = $"INSERT INTO {table.Name} ({columns}) VALUES ({paramRefs}) RETURNING id::text AS id;";

        var parameters = new DynamicParameters();
        foreach (var (key, value) in fields)
            parameters.Add("@" + key, value);

        using var conn = postgres.CreateConnection();
        var newId = await conn.ExecuteScalarAsync<string?>(sql, parameters);

        if (string.IsNullOrEmpty(newId))
            return StatusCode(500, new { error = "Insert failed." });

        var rows    = await QueryRowsAsync(table.SelectSql);
        var created = rows.FirstOrDefault(r => r.TryGetValue("id", out var v) && v?.ToString() == newId);
        return created is not null ? Ok(created) : NotFound(new { error = "Inserted row not found." });
    }

    // PUT /api/admin/postgres/{tableName}/{id}
    [HttpPut("postgres/{tableName}/{id:guid}")]
    public async Task<IActionResult> UpdatePostgresRow(
        string tableName,
        Guid id,
        [FromBody] Dictionary<string, object?> payload)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table is read-only." });

        var fields = payload
            .Where(kv => kv.Key != "id" && !string.IsNullOrWhiteSpace(kv.Value?.ToString()))
            .ToDictionary(kv => SqlHelpers.ToSnakeCase(kv.Key), kv => SqlHelpers.ConvertJsonElement(kv.Value));

        if (fields.Count == 0)
            return BadRequest(new { error = "No valid fields to update." });

        var assignments = string.Join(", ", fields.Keys.Select(k => $"{k} = @{k}"));
        var sql         = $"UPDATE {table.Name} SET {assignments} WHERE id = @Id RETURNING id::text AS id;";

        var parameters = new DynamicParameters();
        parameters.Add("@Id", id);
        foreach (var (key, value) in fields)
            parameters.Add("@" + key, value);

        using var conn = postgres.CreateConnection();
        var updatedId = await conn.ExecuteScalarAsync<string?>(sql, parameters);

        if (string.IsNullOrEmpty(updatedId))
            return NotFound(new { error = "Row not found or nothing changed." });

        var rows    = await QueryRowsAsync(table.SelectSql);
        var updated = rows.FirstOrDefault(r => r.TryGetValue("id", out var v) && v?.ToString() == updatedId);
        return updated is not null ? Ok(updated) : NotFound(new { error = "Updated row not found." });
    }

    // ── MongoDB endpoints ─────────────────────────────────────────────────────

    // GET /api/admin/mongo/products
    [HttpGet("mongo/products")]
    public async Task<IActionResult> GetMongoProducts()
        => Ok(await productReader.GetAllAsync());

    // ── Redis endpoints ───────────────────────────────────────────────────────

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

    // ── Analytics ─────────────────────────────────────────────────────────────

    // GET /api/admin/analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var totalOrders       = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM orders;");
        var totalPayments     = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM payments;");
        var totalWishlist     = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM wishlist;");
        var totalUsers        = await QueryScalarAsync<int>("SELECT COUNT(*)::int FROM users;");
        var totalProducts     = (await productReader.GetAllAsync()).Count;

        // V008: orders no longer have products_id — count distinct products via order_items
        var totalDistinct     = await QueryScalarAsync<int>(
            "SELECT COUNT(DISTINCT product_id)::int FROM order_items;");

        var topRows = await QueryRowsAsync("""
            SELECT   product_id   AS "productId",
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
            var orderCount = row.TryGetValue("orderCount", out var count)
                             && int.TryParse(count?.ToString(), out var n) ? n : 0;

            var product = await productReader.GetByIdAsync(productId);
            topProducts.Add(new AdminAnalyticsTopProductResponse(
                productId,
                product?.ProductName ?? "Onbekend product",
                orderCount));
        }

        return Ok(new AdminAnalyticsResponse(
            TotalOrders:                  totalOrders,
            TotalPayments:                totalPayments,
            TotalWishlistItems:           totalWishlist,
            TotalUsers:                   totalUsers,
            TotalProducts:                totalProducts,
            TotalDistinctOrderedProducts: totalDistinct,
            TotalPageViews:               0,
            TopProducts:                  topProducts));
    }

    // ── Activity log ──────────────────────────────────────────────────────────

    // GET /api/admin/activity
    [HttpGet("activity")]
    public async Task<IActionResult> GetActivity()
    {
        // V008: orders no longer carry products_id; order_items replaced it.
        // The wishlist table still has products_id (unchanged by any migration).
        const string sql = """
            SELECT id, description, timestamp FROM (

                SELECT o.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name,
                              ' plaatste bestelling ', o.id::text) AS description,
                       o.created_at AS timestamp
                FROM   orders o
                LEFT JOIN users u ON u.id = o.user_id

                UNION ALL

                SELECT p.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name,
                              ' betaalde order ', p.order_id::text) AS description,
                       p.created_at AS timestamp
                FROM   payments p
                JOIN   orders  o ON o.id = p.order_id
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
                       CONCAT(u.first_name, ' ', u.last_name,
                              ' voegde een adres toe') AS description,
                       a.created_at AS timestamp
                FROM   addresses a
                JOIN   users u ON u.id = a.user_id

                UNION ALL

                SELECT u.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name,
                              ' maakte een account aan') AS description,
                       u.created_at AS timestamp
                FROM   users u

            ) x
            ORDER  BY timestamp DESC
            LIMIT  20;
            """;

        var rows = await QueryRowsAsync(sql);
        return Ok(rows.Select(row =>
        {
            var rawTs     = row.TryGetValue("timestamp",   out var ts)  ? ts?.ToString()  : null;
            var timestamp = DateTime.TryParse(rawTs, null,
                                System.Globalization.DateTimeStyles.RoundtripKind, out var parsed)
                            ? parsed
                            : DateTime.MinValue;

            return new AdminActivityResponse(
                row["id"]?.ToString()          ?? string.Empty,
                row["description"]?.ToString() ?? string.Empty,
                timestamp);
        }));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

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
