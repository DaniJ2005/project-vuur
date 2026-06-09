using StackExchange.Redis;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Cart;

public class CartRepository(RedisContext redis)
{
    public async Task<CartItem> AddAsync(Guid userId, string productsId)
    {
        var db = redis.Db;
        var hashKey = CartRedisKeys.Items(userId);
        var orderedKey = CartRedisKeys.OrderedItems(userId);

        var existing = await db.HashGetAsync(hashKey, productsId);
        if (existing.HasValue)
        {
            var existingItem = CartRedisValue.Parse(userId, productsId, existing);
            existingItem.Amount++;
            existingItem.UpdatedAt = DateTime.UtcNow;

            await db.HashSetAsync(hashKey, productsId, CartRedisValue.Format(existingItem));

            return existingItem;
        }

        var now = DateTime.UtcNow;
        var item = new CartItem
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
            CartRedisValue.Format(item),
            When.NotExists);

        if (!added)
        {
            existing = await db.HashGetAsync(hashKey, productsId);
            var existingItem = CartRedisValue.Parse(userId, productsId, existing);
            existingItem.Amount++;
            existingItem.UpdatedAt = DateTime.UtcNow;

            await db.HashSetAsync(hashKey, productsId, CartRedisValue.Format(existingItem));

            return existingItem;
        }

        await db.SortedSetAddAsync(orderedKey, productsId, now.Ticks);

        return item;
    }

    public async Task<CartItem?> UpdateAmountAsync(Guid userId, string productsId, int amount)
    {
        var db = redis.Db;
        var hashKey = CartRedisKeys.Items(userId);
        var existing = await db.HashGetAsync(hashKey, productsId);

        if (!existing.HasValue)
            return null;

        var item = CartRedisValue.Parse(userId, productsId, existing);
        item.Amount = amount;
        item.UpdatedAt = DateTime.UtcNow;

        await db.HashSetAsync(hashKey, productsId, CartRedisValue.Format(item));

        return item;
    }

    public async Task<bool> RemoveAsync(Guid userId, string productsId)
    {
        var db = redis.Db;
        var removed = await db.HashDeleteAsync(CartRedisKeys.Items(userId), productsId);

        if (removed)
            await db.SortedSetRemoveAsync(CartRedisKeys.OrderedItems(userId), productsId);

        return removed;
    }
}