using StackExchange.Redis;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class WishlistReadRepository(RedisContext redis)
{
    public async Task<IEnumerable<WishlistItem>> GetByUserIdAsync(Guid userId)
    {
        var db = redis.Db;
        var productIds = await db.SortedSetRangeByRankAsync(
            WishlistRedisKeys.OrderedItems(userId),
            order: Order.Descending);

        if (productIds.Length == 0)
            return [];

        var values = await db.HashGetAsync(WishlistRedisKeys.Items(userId), productIds);

        return productIds
            .Zip(values)
            .Where(pair => pair.Second.HasValue)
            .Select(pair => WishlistRedisValue.Parse(userId, pair.First, pair.Second));
    }
}
