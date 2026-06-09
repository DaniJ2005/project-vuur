namespace Vuur.Api.Features.Users;

public class WishlistService(WishlistRepository repo, WishlistReadRepository readRepo)
{
    public async Task<IEnumerable<WishlistItemResponse>> GetAsync(Guid userId)
    {
        var items = await readRepo.GetByUserIdAsync(userId);
        return items.Select(ToResponse);
    }

    public async Task<WishlistItemResponse> AddAsync(Guid userId, string productsId)
    {
        var item = await repo.AddAsync(userId, productsId);
        return ToResponse(item);
    }

    public async Task<(bool success, string? error)> RemoveAsync(Guid userId, string productsId)
    {
        var removed = await repo.RemoveAsync(userId, productsId);
        return removed ? (true, null) : (false, "Product not found in wishlist.");
    }

    private static WishlistItemResponse ToResponse(WishlistItem w) =>
        new(w.Id, w.UserId, w.ProductsId, w.CreatedAt);
}
