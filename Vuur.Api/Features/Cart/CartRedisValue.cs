using System.Globalization;
using StackExchange.Redis;

namespace Vuur.Api.Features.Cart;

internal static class CartRedisValue
{
    private const char Separator = '|';

    public static string Format(CartItem item) =>
        string.Join(
            Separator,
            item.Id.ToString("D"),
            item.CreatedAt.ToUniversalTime().Ticks.ToString(CultureInfo.InvariantCulture),
            item.UpdatedAt.ToUniversalTime().Ticks.ToString(CultureInfo.InvariantCulture));

    public static CartItem Parse(Guid userId, RedisValue productsId, RedisValue value)
    {
        var parts = ((string)value!).Split(Separator);
        var createdAt = new DateTime(long.Parse(parts[1], CultureInfo.InvariantCulture), DateTimeKind.Utc);

        return new CartItem
        {
            Id = Guid.Parse(parts[0]),
            UserId = userId,
            ProductsId = (string)productsId!,
            CreatedAt = createdAt,
            UpdatedAt = parts.Length > 2
                ? new DateTime(long.Parse(parts[2], CultureInfo.InvariantCulture), DateTimeKind.Utc)
                : createdAt,
        };
    }
}