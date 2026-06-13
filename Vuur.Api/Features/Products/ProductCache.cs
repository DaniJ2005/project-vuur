using System.Text.Json;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

/// <summary>
/// Redis-backed cache for single products and the filter facets. The paginated catalog
/// list itself is not cached (it varies per filter/sort/cursor). All entries expire after
/// <see cref="Ttl"/>; write operations must call the relevant Invalidate method.
/// </summary>
public class ProductCache(RedisContext redis)
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(10);

    private static string SingleKey(string id) => $"products:{id}";
    private const string FacetsKey = "products:facets";

    // ── Single product ───────────────────────────────────────────────────────────
    public async Task<Product?> GetByIdAsync(string id)
    {
        var value = await redis.Db.StringGetAsync(SingleKey(id));
        if (value.IsNullOrEmpty) return null;
        return JsonSerializer.Deserialize<Product>((string)value!);
    }

    public async Task SetByIdAsync(Product product)
        => await redis.Db.StringSetAsync(SingleKey(product.Id), JsonSerializer.Serialize(product), Ttl);

    /// <summary>Invalidates the single-product entry and the facets (genre/platform may have changed).</summary>
    public async Task InvalidateAsync(string id)
    {
        await redis.Db.KeyDeleteAsync(SingleKey(id));
        await redis.Db.KeyDeleteAsync(FacetsKey);
    }

    // ── Facets ───────────────────────────────────────────────────────────────────
    public async Task<ProductFacets?> GetFacetsAsync()
    {
        var value = await redis.Db.StringGetAsync(FacetsKey);
        if (value.IsNullOrEmpty) return null;
        return JsonSerializer.Deserialize<ProductFacets>((string)value!);
    }

    public async Task SetFacetsAsync(ProductFacets facets)
        => await redis.Db.StringSetAsync(FacetsKey, JsonSerializer.Serialize(facets), Ttl);

    public async Task InvalidateFacetsAsync()
        => await redis.Db.KeyDeleteAsync(FacetsKey);
}
