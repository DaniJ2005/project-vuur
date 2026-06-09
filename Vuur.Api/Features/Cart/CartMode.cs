using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Cart;

public record CartAddRequest(
    [Required] string ProductsId
);

public record CartUpdateAmountRequest(
    [Range(1, int.MaxValue)] int Amount
);

public record CartItemResponse(
    Guid Id,
    Guid UserId,
    string ProductsId,
    int Amount,
    DateTime CreatedAt
);