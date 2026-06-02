using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Users;

public record WishlistAddRequest(
    [Required] string ProductsId
);

public record WishlistUpdateAmountRequest(
    [Range(1, int.MaxValue)] int Amount
);

public record WishlistItemResponse(
    Guid Id,
    Guid UserId,
    string ProductsId,
    int Amount,
    DateTime CreatedAt
);
