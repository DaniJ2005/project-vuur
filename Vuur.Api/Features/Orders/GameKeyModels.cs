using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Orders;

// DTOs for managing the game-key inventory (admin stocking + listing).
// Optional — only needed if you expose key-inventory endpoints.

public record AddGameKeysRequest(
    [Required] string ProductId,
    [Required, MinLength(1)] List<string> Keys
);

public record GameKeyResponse(
    Guid Id,
    string ProductId,
    string KeyCode,
    Guid? OrderItemId,
    DateTime? AssignedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
