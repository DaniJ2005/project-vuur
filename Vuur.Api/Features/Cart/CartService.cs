namespace Vuur.Api.Features.Cart;

public class CartService(CartRepository repo, CartReadRepository readRepo)
{
    public async Task<IEnumerable<CartItemResponse>> GetAsync(Guid userId)
    {
        var items = await readRepo.GetByUserIdAsync(userId);
        return items.Select(ToResponse);
    }

    public async Task<CartItemResponse> AddAsync(Guid userId, string productsId)
    {
        var item = await repo.AddAsync(userId, productsId);
        return ToResponse(item);
    }

    public async Task<(bool success, string? error, CartItemResponse? item)> UpdateAmountAsync(
        Guid userId,
        string productsId,
        int amount)
    {
        var item = await repo.UpdateAmountAsync(userId, productsId, amount);
        return item is null
            ? (false, "Product not found in shopping cart.", null)
            : (true, null, ToResponse(item));
    }

    public async Task<(bool success, string? error)> RemoveAsync(Guid userId, string productsId)
    {
        var removed = await repo.RemoveAsync(userId, productsId);
        return removed ? (true, null) : (false, "Product not found in shopping cart.");
    }

    private static CartItemResponse ToResponse(CartItem c) =>
        new(c.Id, c.UserId, c.ProductsId, c.Amount, c.CreatedAt);
}