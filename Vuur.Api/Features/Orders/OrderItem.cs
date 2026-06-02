namespace Vuur.Api.Features.Orders;

/// <summary>
/// A single line of an order. Product name/type/price are snapshotted at
/// purchase time so historical orders don't change when the catalogue does.
/// Maps to the `order_items` table (V008).
/// </summary>
public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }

    /// <summary>MongoDB ObjectId of the catalogue product.</summary>
    public string ProductId { get; set; } = null!;

    // Snapshots at purchase time.
    public string ProductName { get; set; } = null!;
    public string ProductType { get; set; } = null!; // 'key' | 'disc'
    public string? Platform { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
