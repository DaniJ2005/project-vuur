namespace Vuur.Api.Features.Orders;

/// <summary>
/// A placed order. Self-contained historical record: the delivery address,
/// totals and customer contact are snapshotted at purchase time (they do not
/// reference the mutable addresses book or the catalogue).
/// Line items live in <see cref="OrderItem"/>; maps to the `orders` table (V008).
/// </summary>
public class Order
{
    public Guid Id { get; set; }

    /// <summary>Null for anonymous (guest) orders.</summary>
    public Guid? UserId { get; set; }

    // Contact snapshot (recipient name lives here, not on the address).
    public string CustomerEmail { get; set; } = null!;
    public string CustomerFirstName { get; set; } = null!;
    public string CustomerLastName { get; set; } = null!;

    /// <summary>pending | paid | fulfilled | cancelled</summary>
    public string Status { get; set; } = null!;

    /// <summary>True when the order contains a physical (disc) item.</summary>
    public bool RequiresShipping { get; set; }

    public string? ShippingMethod { get; set; }
    public decimal ShippingPrice { get; set; }
    public decimal TotalAmount { get; set; }

    // Delivery address snapshot — all null for key-only orders.
    public string? ShipStreet { get; set; }
    public string? ShipHouseNumber { get; set; }
    public string? ShipHouseExt { get; set; }
    public string? ShipPostCode { get; set; }
    public string? ShipCity { get; set; }
    public string? ShipCountryCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
