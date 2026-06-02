using Dapper;
using Microsoft.AspNetCore.Mvc;
using Vuur.Api.Data;
using Vuur.Api.Features.Products;
using System.Text;
using System.Linq;

namespace Vuur.Api.Features.Admin;

using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("/api/admin")]
[Produces("application/json")]
[Authorize(Roles = "admin")]
public class AdminController(
    PostgresContext postgres,
    RedisContext redis,
    IProductReadRepository<Product> productReader) : ControllerBase
{
    private static readonly IReadOnlyDictionary<string, AdminPostgresTable> Tables =
        new Dictionary<string, AdminPostgresTable>(StringComparer.OrdinalIgnoreCase)
        {
            ["users"] = new(
                "users",
                """
                SELECT id::text AS "id", first_name AS "firstName", last_name AS "lastName", email,
                       created_at AS "createdAt", updated_at AS "updatedAt"
                FROM users u
                ORDER BY created_at DESC;
                """,
                "DELETE FROM users WHERE id = @Id;"),
            ["addresses"] = new(
                "addresses",
                """
                SELECT id::text AS "id", user_id::text AS "userId", address AS "street", city,
                       country_code AS "countryCode", created_at AS "createdAt", updated_at AS "updatedAt"
                FROM addresses
                ORDER BY created_at DESC;
                """,
                "DELETE FROM addresses WHERE id = @Id;"),
            ["orders"] = new(
                "orders",
                """
                SELECT id::text AS "id", user_id::text AS "userId", products_id AS "productsId",
                       created_at AS "createdAt", updated_at AS "updatedAt"
                FROM orders
                ORDER BY created_at DESC;
                """,
                "DELETE FROM orders WHERE id = @Id;"),
            ["payments"] = new(
                "payments",
                """
                SELECT id::text AS "id", order_id::text AS "orderId", products_id AS "productsId",
                       created_at AS "createdAt", updated_at AS "updatedAt"
                FROM payments
                ORDER BY created_at DESC;
                """,
                "DELETE FROM payments WHERE id = @Id;"),
            ["wishlist"] = new(
                "wishlist",
                """
                SELECT id::text AS "id", user_id::text AS "userId", products_id AS "productsId",
                       created_at AS "createdAt", updated_at AS "updatedAt"
                FROM wishlist
                ORDER BY created_at DESC;
                """,
                "DELETE FROM wishlist WHERE id = @Id;"),
        };

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

    [HttpDelete("postgres/{tableName}/{id:guid}")]
    public async Task<IActionResult> DeletePostgresRow(string tableName, Guid id)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table cannot be modified." });

        using var conn = postgres.CreateConnection();
        var rows = await conn.ExecuteAsync(table.DeleteSql, new { Id = id });
        return rows > 0 ? NoContent() : NotFound(new { error = "Row not found." });
    }

    [HttpPost("postgres/{tableName}")]
    public async Task<IActionResult> CreatePostgresRow(string tableName, [FromBody] Dictionary<string, object?> payload)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table cannot be modified." });

        if (payload == null || payload.Count == 0)
            return BadRequest(new { error = "Payload required." });

        // Filter out empty strings and 'id' field (auto-generated)
        var filteredPayload = payload
            .Where(kv => kv.Key != "id" && !string.IsNullOrWhiteSpace(kv.Value?.ToString()))
            .ToDictionary(kv => kv.Key, kv => kv.Value);

        if (filteredPayload.Count == 0)
            return BadRequest(new { error = "No valid fields to insert." });

        using var conn = postgres.CreateConnection();

        // Convert keys from camelCase to snake_case for DB columns
        var columns = filteredPayload.Keys.Select(k => ToSnakeCase(k)).ToArray();
        var paramNames = columns.Select(c => "@" + c).ToArray();

        var insertSql = $"INSERT INTO {table.Name} ({string.Join(", ", columns)}) VALUES ({string.Join(", ", paramNames)}) RETURNING id::text AS id;";

        var parameters = new DynamicParameters();
        foreach (var kv in filteredPayload)
        {
            var convertedValue = ConvertJsonElement(kv.Value);
            parameters.Add("@" + ToSnakeCase(kv.Key), convertedValue);
        }

        var newId = await conn.ExecuteScalarAsync<string?>(insertSql, parameters);

        if (string.IsNullOrEmpty(newId)) return StatusCode(500, new { error = "Insert failed." });

        // Return the inserted row using the table's select SQL (which aliases keys to camelCase)
        var rows = await QueryRowsAsync(table.SelectSql);
        var created = rows.FirstOrDefault(r => r.TryGetValue("id", out var id) && id?.ToString() == newId);
        return created is not null ? Ok(created) : NotFound(new { error = "Inserted row not found." });
    }

    [HttpPut("postgres/{tableName}/{id:guid}")]
    public async Task<IActionResult> UpdatePostgresRow(string tableName, Guid id, [FromBody] Dictionary<string, object?> payload)
    {
        if (!Tables.TryGetValue(tableName, out var table) || table.DeleteSql is null)
            return NotFound(new { error = "Unknown table or table cannot be modified." });

        if (payload == null || payload.Count == 0)
            return BadRequest(new { error = "Payload required." });

        // Filter out 'id' field and empty strings
        var filteredPayload = payload
            .Where(kv => kv.Key != "id" && !string.IsNullOrWhiteSpace(kv.Value?.ToString()))
            .ToDictionary(kv => kv.Key, kv => kv.Value);

        if (filteredPayload.Count == 0)
            return BadRequest(new { error = "No valid fields to update." });

        using var conn = postgres.CreateConnection();

        var assignments = filteredPayload.Keys.Select(k => $"{ToSnakeCase(k)} = @{ToSnakeCase(k)}").ToArray();
        var updateSql = $"UPDATE {table.Name} SET {string.Join(", ", assignments)} WHERE id = @Id RETURNING id::text AS id;";

        var parameters = new DynamicParameters();
        parameters.Add("@Id", id);
        foreach (var kv in filteredPayload)
        {
            var convertedValue = ConvertJsonElement(kv.Value);
            parameters.Add("@" + ToSnakeCase(kv.Key), convertedValue);
        }

        var updatedId = await conn.ExecuteScalarAsync<string?>(updateSql, parameters);

        if (string.IsNullOrEmpty(updatedId)) return NotFound(new { error = "Row not found or not updated." });

        var rows = await QueryRowsAsync(table.SelectSql);
        var updated = rows.FirstOrDefault(r => r.TryGetValue("id", out var vid) && vid?.ToString() == updatedId);
        return updated is not null ? Ok(updated) : NotFound(new { error = "Updated row not found." });
    }

    [HttpGet("mongo/products")]
    public async Task<IActionResult> GetMongoProducts()
    {
        var products = await productReader.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("redis/refresh-tokens")]
    public async Task<IActionResult> GetRefreshTokens()
    {
        var tokens = await redis.GetRefreshTokensAsync();
        return Ok(tokens.Select(token => new AdminRefreshTokenResponse(
            token.Token,
            token.Token.Length <= 10 ? token.Token : $"{token.Token[..6]}...{token.Token[^4..]}",
            token.UserId,
            token.ExpiresAt)));
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        var totalOrders = await QuerySingleValueAsync<int>("SELECT COUNT(*) FROM orders");
        var totalPayments = await QuerySingleValueAsync<int>("SELECT COUNT(*) FROM payments");
        var totalWishlistItems = await QuerySingleValueAsync<int>("SELECT COUNT(*) FROM wishlist");
        var totalUsers = await QuerySingleValueAsync<int>("SELECT COUNT(*) FROM users");
        var totalProducts = (await productReader.GetAllAsync()).Count;
        var totalDistinctOrderedProducts = await QuerySingleValueAsync<int>("SELECT COUNT(DISTINCT products_id) FROM orders");

        var topProducts = await QueryRowsAsync(@"
            SELECT products_id AS ""productId"", COUNT(*) AS ""orderCount""
            FROM orders
            GROUP BY products_id
            ORDER BY COUNT(*) DESC
            LIMIT 5;");

        var topProductSummaries = new List<AdminAnalyticsTopProductResponse>();
        foreach (var row in topProducts)
        {
            var productId = row.TryGetValue("productId", out var pid) ? pid?.ToString() ?? string.Empty : string.Empty;
            var orderCount = row.TryGetValue("orderCount", out var count) && int.TryParse(count?.ToString(), out var value) ? value : 0;
            var product = await productReader.GetByIdAsync(productId);
            topProductSummaries.Add(new AdminAnalyticsTopProductResponse(
                productId,
                product?.ProductName ?? "Onbekend product",
                orderCount));
        }

        return Ok(new AdminAnalyticsResponse(
            totalOrders,
            totalPayments,
            totalWishlistItems,
            totalUsers,
            totalProducts,
            totalDistinctOrderedProducts,
            0,
            topProductSummaries));
    }

    [HttpGet("activity")]
    public async Task<IActionResult> GetActivity()
    {
        const string sql = @"
            SELECT id, description, timestamp FROM (
                SELECT o.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' plaatste bestelling ', o.id::text) AS description,
                       o.created_at AS timestamp
                FROM orders o
                JOIN users u ON u.id = o.user_id
                UNION ALL
                SELECT p.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' betaalde order ', p.order_id::text) AS description,
                       p.created_at AS timestamp
                FROM payments p
                JOIN orders o ON o.id = p.order_id
                JOIN users u ON u.id = o.user_id
                UNION ALL
                SELECT w.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' voegde product ', w.products_id, ' toe aan wishlist') AS description,
                       w.created_at AS timestamp
                FROM wishlist w
                JOIN users u ON u.id = w.user_id
                UNION ALL
                SELECT a.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' voegde een adres toe') AS description,
                       a.created_at AS timestamp
                FROM addresses a
                JOIN users u ON u.id = a.user_id
                UNION ALL
                SELECT u.id::text AS id,
                       CONCAT(u.first_name, ' ', u.last_name, ' maakte een account aan') AS description,
                       u.created_at AS timestamp
                FROM users u
            ) x
            ORDER BY timestamp DESC
            LIMIT 20;
        ";

        var rows = await QueryRowsAsync(sql);
        return Ok(rows.Select(row =>
        {
            var timestampRaw = row.TryGetValue("timestamp", out var ts) ? ts?.ToString() : null;
            var timestamp = DateTime.TryParse(timestampRaw, null, System.Globalization.DateTimeStyles.RoundtripKind, out var parsed)
                ? parsed
                : DateTime.MinValue;

            return new AdminActivityResponse(
                row["id"]?.ToString() ?? string.Empty,
                row["description"]?.ToString() ?? string.Empty,
                timestamp);
        }));
    }

    [HttpDelete("redis/refresh-tokens/{token}")]
    public async Task<IActionResult> DeleteRefreshToken(string token)
    {
        await redis.DeleteRefreshTokenAsync(token);
        return NoContent();
    }

    private async Task<T> QuerySingleValueAsync<T>(string sql)
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

    private static object? ConvertJsonElement(object? value)
    {
        if (value == null) return null;

        // If it's already a JsonElement, convert it to its native type
        if (value is System.Text.Json.JsonElement je)
        {
            return je.ValueKind switch
            {
                System.Text.Json.JsonValueKind.Null => null,
                System.Text.Json.JsonValueKind.True => true,
                System.Text.Json.JsonValueKind.False => false,
                System.Text.Json.JsonValueKind.Number => je.TryGetInt32(out var intVal) ? intVal : (je.TryGetInt64(out var longVal) ? longVal : je.GetDouble()),
                System.Text.Json.JsonValueKind.String => je.GetString(),
                _ => je.GetRawText()
            };
        }

        return value;
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        var sb = new StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0) sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }
}

public record AdminTableResponse(
    string Name,
    bool CanDelete,
    IReadOnlyList<Dictionary<string, object?>> Rows
);

public record AdminRefreshTokenResponse(
    string Token,
    string TokenPreview,
    string UserId,
    DateTime? ExpiresAt
);

public record AdminAnalyticsResponse(
    int TotalOrders,
    int TotalPayments,
    int TotalWishlistItems,
    int TotalUsers,
    int TotalProducts,
    int TotalDistinctOrderedProducts,
    int TotalPageViews,
    IReadOnlyList<AdminAnalyticsTopProductResponse> TopProducts
);

public record AdminAnalyticsTopProductResponse(
    string ProductId,
    string ProductName,
    int OrderCount
);

public record AdminActivityResponse(
    string Id,
    string Description,
    DateTime Timestamp
);

internal record AdminPostgresTable(
    string Name,
    string SelectSql,
    string? DeleteSql
);
