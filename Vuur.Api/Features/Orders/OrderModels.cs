using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Orders;


// Prijs wordt niet meegestuurd in de CreateOrderRequest omdat die op het backend wordt bepaald
// Dit voorkomt dat de client de prijs probeert te manipuleren
public record CreateOrderItemRequest(
    [Required] string ProductId,
    [Required] string Platform,
    [Required] string Format,                 // 'key' | 'disc' — selects the variant
    [Range(1, int.MaxValue)] int Quantity
);

// ShippingAddressRequest is optioneel  (key-only orders hebben geen verzendadres nodig)
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


public record OrderItemResponse(
    Guid Id,
    string ProductId,
    string ProductName,
    string ProductType, // 'key' | 'disc'
    string? Platform,
    decimal UnitPrice,
    int Quantity
);

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
