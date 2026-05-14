namespace Vuur.Api.Features.Orders;

public class OrderService(OrderRepository repo, OrderReadRepository readRepo)
{
    public async Task<OrderResponse> CreateAsync(Guid userId, CreateOrderRequest req)
    {
        var order = new Order
        {
            UserId = userId,
            ProductsId = req.ProductsId,
        };

        var created = await repo.CreateAsync(order);
        return ToResponse(created);
    }

    public async Task<IEnumerable<OrderResponse>> GetByUserIdAsync(Guid userId)
    {
        var orders = await readRepo.GetByUserIdAsync(userId);
        return orders.Select(ToResponse);
    }

    public async Task<(bool success, string? error, OrderResponse? response)> GetByIdAsync(Guid id, Guid userId, bool isAdmin)
    {
        var order = await readRepo.GetByIdAsync(id);
        if (order is null) return (false, "Order not found.", null);
        if (!isAdmin && order.UserId != userId) return (false, "Access denied.", null);
        return (true, null, ToResponse(order));
    }

    public async Task<IEnumerable<OrderResponse>> GetAllAsync()
    {
        var orders = await readRepo.GetAllAsync();
        return orders.Select(ToResponse);
    }

    private static OrderResponse ToResponse(Order o) =>
        new(o.Id, o.UserId, o.ProductsId, o.CreatedAt, o.UpdatedAt);
}