using StackExchange.Redis;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class WishlistRepository(RedisContext redis)
{
    public async Task<WishlistItem> AddAsync(Guid userId, string productsId)
    {
        var db = redis.Db;
        var hashKey = WishlistRedisKeys.Items(userId);
        var orderedKey = WishlistRedisKeys.OrderedItems(userId);

        var existing = await db.HashGetAsync(hashKey, productsId);
        if (existing.HasValue)
            return WishlistRedisValue.Parse(userId, productsId, existing);

        var now = DateTime.UtcNow;
        var item = new WishlistItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductsId = productsId,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var added = await db.HashSetAsync(
            hashKey,
            productsId,
            WishlistRedisValue.Format(item),
            When.NotExists);

        if (!added)
        {
            existing = await db.HashGetAsync(hashKey, productsId);
            return WishlistRedisValue.Parse(userId, productsId, existing);
        }

        await db.SortedSetAddAsync(orderedKey, productsId, now.Ticks);

        return item;
    }

    public async Task<bool> RemoveAsync(Guid userId, string productsId)
    {
        var db = redis.Db;
        var removed = await db.HashDeleteAsync(WishlistRedisKeys.Items(userId), productsId);

        if (removed)
            await db.SortedSetRemoveAsync(WishlistRedisKeys.OrderedItems(userId), productsId);

        return removed;
    }
}
