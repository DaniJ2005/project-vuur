using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Orders;

/// <summary>
/// Place and retrieve orders.
/// </summary>
[ApiController]
[Route("/api/orders")]
[Produces("application/json")]
public class OrderController(OrderService service) : ControllerBase
{
    /// <summary>
    /// The current user's id, or null for an anonymous (guest) request.
    /// Authenticated endpoints use <c>CurrentUserId!.Value</c> since the
    /// [Authorize] filter guarantees a token is present.
    /// </summary>
    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue("sub"), out var id) ? id : null;

    /// <summary>
    /// The email on the current user's JWT, or null for an anonymous (guest) request.
    /// Authoritative for logged-in users — never trust an email from the request body
    /// when a token is present.
    /// </summary>
    private string? CurrentUserEmail => User.FindFirstValue("email");


    private bool IsAdmin => User.IsInRole("admin");

    /// <summary>Get all orders for the current user. Admins see all orders.</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<OrderResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var orders = IsAdmin
            ? await service.GetAllAsync()
            : await service.GetByUserIdAsync(CurrentUserId!.Value);

        return Ok(orders);
    }

    /// <summary>Get a single order by ID.</summary>
    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(OrderResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var (success, error, response) = await service.GetByIdAsync(id, CurrentUserId!.Value, IsAdmin);
        if (!success) return error == "Access denied." ? Forbid() : NotFound(new { error });
        return Ok(response);
    }

    /// <summary>Place a new order.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var response = await service.CreateAsync(CurrentUserId, CurrentUserEmail, req);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }
}