using Vuur.Api.Features.Orders;

namespace Vuur.Api.Features.Orders;

public class PaymentService(
    PaymentRepository repo,
    PaymentReadRepository readRepo,
    OrderReadRepository orderReadRepo)
{
    public async Task<(bool success, string? error, PaymentResponse? response)> CreateAsync(Guid userId, bool isAdmin, CreatePaymentRequest req)
    {
        var order = await orderReadRepo.GetByIdAsync(req.OrderId);
        if (order is null) return (false, "Order not found.", null);
        if (!isAdmin && order.UserId != userId) return (false, "Access denied.", null);

        var existing = await readRepo.GetByOrderIdAsync(req.OrderId);
        if (existing is not null) return (false, "Payment already exists for this order.", null);

        var payment = new Payment
        {
            OrderId = req.OrderId,
            ProductsId = req.ProductsId,
        };

        var created = await repo.CreateAsync(payment);
        return (true, null, ToResponse(created));
    }

    public async Task<(bool success, string? error, PaymentResponse? response)> GetByOrderIdAsync(Guid orderId, Guid userId, bool isAdmin)
    {
        var order = await orderReadRepo.GetByIdAsync(orderId);
        if (order is null) return (false, "Order not found.", null);
        if (!isAdmin && order.UserId != userId) return (false, "Access denied.", null);

        var payment = await readRepo.GetByOrderIdAsync(orderId);
        if (payment is null) return (false, "No payment found for this order.", null);

        return (true, null, ToResponse(payment));
    }

    public async Task<IEnumerable<PaymentResponse>> GetAllAsync()
    {
        var payments = await readRepo.GetAllAsync();
        return payments.Select(ToResponse);
    }

    private static PaymentResponse ToResponse(Payment p) =>
        new(p.Id, p.OrderId, p.ProductsId, p.CreatedAt, p.UpdatedAt);
}