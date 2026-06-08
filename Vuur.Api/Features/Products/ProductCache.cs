using System.Text.Json;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

/// <summary>
/// Redis-backed cache for the product catalog.
/// All entries expire after <see cref="Ttl"/>.
/// Write operations (create/update/delete) must call the relevant Invalidate method.
/// </summary>
public class ProductCache(RedisContext redis)
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(10);

    private static string AllKey => "products:all";
    private static string SingleKey(string id) => $"products:{id}";

    public async Task<IReadOnlyList<Product>?> GetAllAsync()
    {
        var value = await redis.Db.StringGetAsync(AllKey);
        if (value.IsNullOrEmpty) return null;
        return JsonSerializer.Deserialize<IReadOnlyList<Product>>((string)value!);
    }

    public async Task SetAllAsync(IReadOnlyList<Product> products)
        => await redis.Db.StringSetAsync(AllKey, JsonSerializer.Serialize(products), Ttl);

    public async Task<Product?> GetByIdAsync(string id)
    {
        var value = await redis.Db.StringGetAsync(SingleKey(id));
        if (value.IsNullOrEmpty) return null;
        return JsonSerializer.Deserialize<Product>((string)value!);
    }

    public async Task SetByIdAsync(Product product)
        => await redis.Db.StringSetAsync(SingleKey(product.Id), JsonSerializer.Serialize(product), Ttl);

    /// <summary>Invalidates the single-product entry and the all-products list.</summary>
    public async Task InvalidateAsync(string id)
    {
        await redis.Db.KeyDeleteAsync(SingleKey(id));
        await redis.Db.KeyDeleteAsync(AllKey);
    }

    /// <summary>Invalidates only the all-products list (used after create).</summary>
    public async Task InvalidateAllAsync()
        => await redis.Db.KeyDeleteAsync(AllKey);
}
