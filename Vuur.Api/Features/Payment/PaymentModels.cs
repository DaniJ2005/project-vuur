using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Orders;

public record CreatePaymentRequest(
    [Required] Guid OrderId,
    [Required] string ProductsId
);

public record PaymentResponse(
    Guid Id,
    Guid OrderId,
    string ProductsId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);