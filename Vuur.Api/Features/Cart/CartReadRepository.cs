using StackExchange.Redis;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Cart;

public class CartReadRepository(RedisContext redis)
{
    public async Task<IEnumerable<CartItem>> GetByUserIdAsync(Guid userId)
    {
        var db = redis.Db;
        var productIds = await db.SortedSetRangeByRankAsync(
            CartRedisKeys.OrderedItems(userId),
            order: Order.Descending);

        if (productIds.Length == 0)
            return [];

        var values = await db.HashGetAsync(CartRedisKeys.Items(userId), productIds);

        return productIds
            .Zip(values)
            .Where(pair => pair.Second.HasValue)
            .Select(pair => CartRedisValue.Parse(userId, pair.First, pair.Second));
    }
}