using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Orders;

/// <summary>
/// Place and retrieve orders.
/// </summary>
[ApiController]
[Route("/api/orders")]
[Authorize]
[Produces("application/json")]
public class OrderController(OrderService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);


    private bool IsAdmin => User.IsInRole("admin");

    /// <summary>Get all orders for the current user. Admins see all orders.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OrderResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var orders = IsAdmin
            ? await service.GetAllAsync()
            : await service.GetByUserIdAsync(CurrentUserId);

        return Ok(orders);
    }

    /// <summary>Get a single order by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var (success, error, response) = await service.GetByIdAsync(id, CurrentUserId, IsAdmin);
        if (!success) return error == "Access denied." ? Forbid() : NotFound(new { error });
        return Ok(response);
    }

    /// <summary>Place a new order.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var response = await service.CreateAsync(CurrentUserId, req);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }
}