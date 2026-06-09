namespace Vuur.Api.Features.Cart;

internal static class CartRedisKeys
{
    public static string Items(Guid userId) => $"cart:{userId}:items";

    public static string OrderedItems(Guid userId) => $"cart:{userId}:ordered";
}