namespace Vuur.Api.Features.Orders;


public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }

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
