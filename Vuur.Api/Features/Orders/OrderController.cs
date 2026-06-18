using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Orders;


[ApiController]
[Route("/api/orders")]
[Produces("application/json")]
public class OrderController(OrderService service) : ControllerBase
{

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue("sub"), out var id) ? id : null;


    private string? CurrentUserEmail => User.FindFirstValue("email");


    private bool IsAdmin => User.IsInRole("admin");

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

    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var response = await service.CreateAsync(CurrentUserId, CurrentUserEmail, req);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }
}