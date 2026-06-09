using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Orders;

// ─── Requests ────────────────────────────────────────────────────────────────

/// <summary>One requested line. Price/name are NOT sent by the client — the
/// server snapshots them from the catalogue so they can't be tampered with.</summary>
public record CreateOrderItemRequest(
    [Required] string ProductId,
    [Range(1, int.MaxValue)] int Quantity
);

/// <summary>Delivery address. Omit (null) for key-only orders.</summary>
public record ShippingAddressRequest(
    [Required, MaxLength(200)] string Street,
    [Required, MaxLength(20)] string HouseNumber,
    [MaxLength(20)] string? HouseExt,
    [Required, MaxLength(20)] string PostCode,
    [Required, MaxLength(100)] string City,
    [Required, MaxLength(2)] string CountryCode
);

public record CreateOrderRequest(
    [Required, EmailAddress] string CustomerEmail,
    [Required, MaxLength(100)] string CustomerFirstName,
    [Required, MaxLength(100)] string CustomerLastName,
    [Required, MinLength(1)] List<CreateOrderItemRequest> Items,
    [MaxLength(50)] string? ShippingMethod,
    ShippingAddressRequest? ShippingAddress
);

// ─── Responses ───────────────────────────────────────────────────────────────

public record OrderItemResponse(
    Guid Id,
    string ProductId,
    string ProductName,
    string ProductType,        // 'key' | 'disc'
    string? Platform,
    decimal UnitPrice,
    int Quantity,
    IReadOnlyList<string> Keys // assigned activation codes; empty for disc items
);

/// <summary>Nested view of the snapshotted ship_* columns; null for key-only orders.</summary>
public record ShippingAddressResponse(
    string Street,
    string HouseNumber,
    string HouseExt,
    string PostCode,
    string City,
    string CountryCode
);

public record OrderResponse(
    Guid Id,
    Guid? UserId,
    string CustomerEmail,
    string CustomerFirstName,
    string CustomerLastName,
    string Status,
    bool RequiresShipping,
    string? ShippingMethod,
    decimal ShippingPrice,
    decimal TotalAmount,
    ShippingAddressResponse? ShippingAddress,
    IReadOnlyList<OrderItemResponse> Items,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
