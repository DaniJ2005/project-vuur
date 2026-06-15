using System.Text;
using System.Text.Json;

namespace Vuur.Api.Features.Products;

/// <summary>Catalog query parameters for the cursor-paginated product list.</summary>
public record ProductQuery(
    int Limit,
    string? Cursor,
    string Sort,            // newest | price_asc | price_desc | rating | name
    string? Search,
    string? Platform,
    string? Format,
    string? Genre,
    decimal? MaxPrice,
    string? Flag);

/// <summary>One page of catalog results. <see cref="Total"/> is only filled on the first page.</summary>
public record ProductPage(
    IReadOnlyList<Product> Items,
    string? NextCursor,
    bool HasMore,
    long? Total);

/// <summary>Distinct values that power the catalog filter sidebar.</summary>
public record ProductFacets(IReadOnlyList<string> Genres, IReadOnlyList<string> Platforms);

/// <summary>The decoded keyset cursor: the sort field value + the _id tiebreaker.</summary>
public record CursorData(string V, string Id);

/// <summary>
/// Encodes/decodes the opaque pagination cursor as base64url JSON. Decoding never throws —
/// a malformed cursor is treated as "start from the beginning".
/// </summary>
public static class CursorCodec
{
    public static string Encode(string sortValue, string id)
    {
        var json = JsonSerializer.SerializeToUtf8Bytes(new CursorData(sortValue, id));
        return Convert.ToBase64String(json).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static CursorData? Decode(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor)) return null;

        try
        {
            var s = cursor.Replace('-', '+').Replace('_', '/');
            s += (s.Length % 4) switch { 2 => "==", 3 => "=", _ => "" };
            var bytes = Convert.FromBase64String(s);
            return JsonSerializer.Deserialize<CursorData>(bytes);
        }
        catch
        {
            return null;
        }
    }
}
