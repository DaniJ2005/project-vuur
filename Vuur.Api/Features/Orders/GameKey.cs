namespace Vuur.Api.Features.Orders;

/// <summary>
/// A single game activation key in inventory. Assigned to an order line when
/// sold. Maps to the `game_keys` table (V008).
/// </summary>
public class GameKey
{
    public Guid Id { get; set; }

    /// <summary>MongoDB ObjectId of the product this key unlocks.</summary>
    public string ProductId { get; set; } = null!;

    /// <summary>The activation code. Treat as a secret — only expose to the buyer.</summary>
    public string KeyCode { get; set; } = null!;

    /// <summary>available | reserved | sold</summary>
    public string Status { get; set; } = null!;

    /// <summary>The order line that consumed this key; null while unsold.</summary>
    public Guid? OrderItemId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
