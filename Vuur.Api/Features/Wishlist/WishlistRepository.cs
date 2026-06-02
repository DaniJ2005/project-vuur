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
        {
            var existingItem = WishlistRedisValue.Parse(userId, productsId, existing);
            existingItem.Amount++;
            existingItem.UpdatedAt = DateTime.UtcNow;

            await db.HashSetAsync(hashKey, productsId, WishlistRedisValue.Format(existingItem));

            return existingItem;
        }

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
            var existingItem = WishlistRedisValue.Parse(userId, productsId, existing);
            existingItem.Amount++;
            existingItem.UpdatedAt = DateTime.UtcNow;

            await db.HashSetAsync(hashKey, productsId, WishlistRedisValue.Format(existingItem));

            return existingItem;
        }

        await db.SortedSetAddAsync(orderedKey, productsId, now.Ticks);

        return item;
    }

    public async Task<WishlistItem?> UpdateAmountAsync(Guid userId, string productsId, int amount)
    {
        var db = redis.Db;
        var hashKey = WishlistRedisKeys.Items(userId);
        var existing = await db.HashGetAsync(hashKey, productsId);

        if (!existing.HasValue)
            return null;

        var item = WishlistRedisValue.Parse(userId, productsId, existing);
        item.Amount = amount;
        item.UpdatedAt = DateTime.UtcNow;

        await db.HashSetAsync(hashKey, productsId, WishlistRedisValue.Format(item));

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
