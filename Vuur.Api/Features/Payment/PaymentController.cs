using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Orders;


[ApiController]
[Route("/api/payments")]
[Authorize]
[Produces("application/json")]
public class PaymentController(PaymentService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);

    private bool IsAdmin => User.IsInRole("admin");

    [HttpGet]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(IEnumerable<PaymentResponse>), 200)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> GetAll()
    {
        var payments = await service.GetAllAsync();
        return Ok(payments);
    }

    [HttpGet("order/{orderId:guid}")]
    [ProducesResponseType(typeof(PaymentResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> GetByOrderId(Guid orderId)
    {
        var (success, error, response) = await service.GetByOrderIdAsync(orderId, CurrentUserId, IsAdmin);
        if (!success) return error == "Access denied." ? Forbid() : NotFound(new { error });
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PaymentResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest req)
    {
        var (success, error, response) = await service.CreateAsync(CurrentUserId, IsAdmin, req);
        if (!success) return error == "Access denied." ? Forbid() : BadRequest(new { error });
        return CreatedAtAction(nameof(GetByOrderId), new { orderId = response!.OrderId }, response);
    }
}