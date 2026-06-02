using Dapper;
using Microsoft.AspNetCore.Mvc;
using Vuur.Api.Data;
using Vuur.Api.Features.Products;

namespace Vuur.Api.Features.Admin;

[ApiController]
[Route("/api/admin")]
[Produces("application/json")]
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

    [HttpDelete("redis/refresh-tokens/{token}")]
    public async Task<IActionResult> DeleteRefreshToken(string token)
    {
        await redis.DeleteRefreshTokenAsync(token);
        return NoContent();
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

internal record AdminPostgresTable(
    string Name,
    string SelectSql,
    string? DeleteSql
);
