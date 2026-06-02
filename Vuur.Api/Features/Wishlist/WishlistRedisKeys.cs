namespace Vuur.Api.Features.Users;

internal static class WishlistRedisKeys
{
    public static string Items(Guid userId) => $"wishlist:{userId}:items";

    public static string OrderedItems(Guid userId) => $"wishlist:{userId}:ordered";
}
