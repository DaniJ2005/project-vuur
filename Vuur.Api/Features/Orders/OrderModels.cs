using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Orders;

public record CreateOrderRequest(
    [Required] string ProductsId
);

public record OrderResponse(
    Guid Id,
    Guid UserId,
    string ProductsId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);