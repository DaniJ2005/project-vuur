using System.Text;
using System.Text.Json;

namespace Vuur.Api.Features.Products;

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

public record ProductPage(
    IReadOnlyList<Product> Items,
    string? NextCursor,
    bool HasMore,
    long? Total);

public record ProductFacets(IReadOnlyList<string> Genres, IReadOnlyList<string> Platforms);

public record CursorData(string V, string Id);


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
