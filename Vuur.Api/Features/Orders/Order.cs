namespace Vuur.Api.Features.Orders;


public class Order
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    // Contact snapshot (recipient name lives here, not on the address).
    public string CustomerEmail { get; set; } = null!;
    public string CustomerFirstName { get; set; } = null!;
    public string CustomerLastName { get; set; } = null!;

    public string Status { get; set; } = null!;

    public bool RequiresShipping { get; set; }

    public string? ShippingMethod { get; set; }
    public decimal ShippingPrice { get; set; }
    public decimal TotalAmount { get; set; }

    public string? ShipStreet { get; set; }
    public string? ShipHouseNumber { get; set; }
    public string? ShipHouseExt { get; set; }
    public string? ShipPostCode { get; set; }
    public string? ShipCity { get; set; }
    public string? ShipCountryCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
