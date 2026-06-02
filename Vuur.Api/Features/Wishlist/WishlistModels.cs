using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Users;

public record WishlistAddRequest(
    [Required] string ProductsId
);

public record WishlistItemResponse(
    Guid Id,
    Guid UserId,
    string ProductsId,
    DateTime CreatedAt
);