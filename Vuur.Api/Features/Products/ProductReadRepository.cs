using System.Globalization;
using System.Text.RegularExpressions;
using MongoDB.Bson;
using MongoDB.Driver;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

public class ProductReadRepository(MongoContext mongo) : IProductReadRepository
{
    private IMongoCollection<Product> Collection => mongo.Products;

    public async Task<IReadOnlyList<Product>> GetAllAsync()
        => await Collection
            .Find(Builders<Product>.Filter.Empty)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<Product?> GetByIdAsync(string id)
        => await Collection
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

    public async Task<IReadOnlyList<Product>> GetByIdsAsync(IReadOnlyList<string> ids)
        => await Collection
            .Find(Builders<Product>.Filter.In(p => p.Id, ids))
            .ToListAsync();

    // ── Cursor (keyset) pagination ───────────────────────────────────────────────

    public async Task<ProductPage> GetPageAsync(ProductQuery q)
    {
        var f = Builders<Product>.Filter;
        var baseFilter = BuildFilter(q, f);

        var cursor = CursorCodec.Decode(q.Cursor);
        var queryFilter = cursor is null ? baseFilter : f.And(baseFilter, Keyset(q.Sort, cursor, f));

        var limit = Math.Clamp(q.Limit, 1, 60);

        var items = await Collection
            .Find(queryFilter)
            .Sort(SortDef(q.Sort))
            .Limit(limit + 1)
            .ToListAsync();

        var hasMore = items.Count > limit;
        if (hasMore) items.RemoveAt(items.Count - 1);

        var nextCursor = hasMore && items.Count > 0
            ? CursorCodec.Encode(SortValue(q.Sort, items[^1]), items[^1].Id)
            : null;

        // Counting the full filtered set is only worth it once, for the first page header.
        long? total = cursor is null ? await Collection.CountDocumentsAsync(baseFilter) : null;

        return new ProductPage(items, nextCursor, hasMore, total);
    }

    public async Task<ProductFacets> GetFacetsAsync()
    {
        var empty = Builders<Product>.Filter.Empty;
        var genres = await Collection.Distinct<string>("Genre", empty).ToListAsync();
        var platforms = await Collection.Distinct<string>("Variants.Platform", empty).ToListAsync();
        genres.Sort(StringComparer.OrdinalIgnoreCase);
        platforms.Sort(StringComparer.OrdinalIgnoreCase);
        return new ProductFacets(genres, platforms);
    }

    // ── Query building helpers ───────────────────────────────────────────────────

    private static FilterDefinition<Product> BuildFilter(ProductQuery q, FilterDefinitionBuilder<Product> f)
    {
        var parts = new List<FilterDefinition<Product>>();

        if (!string.IsNullOrWhiteSpace(q.Search))
            parts.Add(f.Regex(p => p.ProductName, new BsonRegularExpression(Regex.Escape(q.Search), "i")));

        // A product matches a platform/format filter when it has a variant for it.
        if (!string.IsNullOrWhiteSpace(q.Platform) && !string.IsNullOrWhiteSpace(q.Format))
            parts.Add(f.ElemMatch(p => p.Variants, v => v.Platform == q.Platform && v.Format == q.Format));
        else if (!string.IsNullOrWhiteSpace(q.Platform))
            parts.Add(f.Eq("Variants.Platform", q.Platform));
        else if (!string.IsNullOrWhiteSpace(q.Format))
            parts.Add(f.Eq("Variants.Format", q.Format));

        if (!string.IsNullOrWhiteSpace(q.Genre))
            parts.Add(f.Eq(p => p.Genre, q.Genre));

        if (q.MaxPrice is not null)
            parts.Add(f.Lte(p => p.MinPrice, q.MaxPrice.Value));

        if (!string.IsNullOrWhiteSpace(q.Flag))
            parts.Add(f.AnyEq(p => p.Flags, q.Flag));

        return parts.Count > 0 ? f.And(parts) : f.Empty;
    }

    private static SortDefinition<Product> SortDef(string sort)
    {
        var s = Builders<Product>.Sort;
        return sort switch
        {
            "price_asc"  => s.Ascending(p => p.MinPrice).Ascending(p => p.Id),
            "price_desc" => s.Descending(p => p.MinPrice).Descending(p => p.Id),
            "rating"     => s.Descending(p => p.Rating).Descending(p => p.Id),
            "name"       => s.Ascending(p => p.ProductName).Ascending(p => p.Id),
            _            => s.Descending(p => p.CreatedAt).Descending(p => p.Id), // newest
        };
    }

    // Keyset predicate matching the active sort: "everything strictly after the cursor row".
    private static FilterDefinition<Product> Keyset(string sort, CursorData c, FilterDefinitionBuilder<Product> f)
    {
        switch (sort)
        {
            case "price_asc":
            {
                var v = decimal.Parse(c.V, CultureInfo.InvariantCulture);
                return f.Or(f.Gt(p => p.MinPrice, v),
                            f.And(f.Eq(p => p.MinPrice, v), f.Gt(p => p.Id, c.Id)));
            }
            case "price_desc":
            {
                var v = decimal.Parse(c.V, CultureInfo.InvariantCulture);
                return f.Or(f.Lt(p => p.MinPrice, v),
                            f.And(f.Eq(p => p.MinPrice, v), f.Lt(p => p.Id, c.Id)));
            }
            case "rating":
            {
                var v = decimal.Parse(c.V, CultureInfo.InvariantCulture);
                return f.Or(f.Lt(p => p.Rating, v),
                            f.And(f.Eq(p => p.Rating, v), f.Lt(p => p.Id, c.Id)));
            }
            case "name":
                return f.Or(f.Gt(p => p.ProductName, c.V),
                            f.And(f.Eq(p => p.ProductName, c.V), f.Gt(p => p.Id, c.Id)));
            default: // newest
            {
                var v = DateTime.Parse(c.V, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
                return f.Or(f.Lt(p => p.CreatedAt, v),
                            f.And(f.Eq(p => p.CreatedAt, v), f.Lt(p => p.Id, c.Id)));
            }
        }
    }

    // The cursor value for the last row of a page, matching the sort field.
    private static string SortValue(string sort, Product p) => sort switch
    {
        "price_asc" or "price_desc" => p.MinPrice.ToString(CultureInfo.InvariantCulture),
        "rating"                    => p.Rating.ToString(CultureInfo.InvariantCulture),
        "name"                      => p.ProductName,
        _                           => p.CreatedAt.ToString("O", CultureInfo.InvariantCulture),
    };
}
