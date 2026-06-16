namespace Vuur.Api.Features.Orders;

/// <summary>
/// A single game activation key. Minted per purchased unit at order time and
/// linked to the order line. Maps to the `game_keys` table (V008, V009).
/// </summary>
public class GameKey
{
    public Guid Id { get; set; }

    /// <summary>MongoDB ObjectId of the product this key unlocks.</summary>
    public string ProductId { get; set; } = null!;

    /// <summary>The activation code. Treat as a secret — only expose to the buyer.</summary>
    public string KeyCode { get; set; } = null!;

    /// <summary>The order line that this key was minted for.</summary>
    public Guid? OrderItemId { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
