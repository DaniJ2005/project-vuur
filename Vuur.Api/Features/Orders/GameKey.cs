namespace Vuur.Api.Features.Orders;

public class GameKey
{
    public Guid Id { get; set; }

    public string ProductId { get; set; } = null!;

    public string KeyCode { get; set; } = null!;

    public Guid? OrderItemId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
