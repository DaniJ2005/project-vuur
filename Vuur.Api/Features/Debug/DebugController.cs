using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vuur.Api.Features.Orders;

namespace Vuur.Api.Features.Debug;

/// <summary>
/// Place and retrieve orders.
/// </summary>
[ApiController]
[Route("/api/debug")]
// [Authorize]
[Produces("application/json")]
public class DebugController(OrderService orderService) : ControllerBase
{
  private Guid CurrentUserId => Guid.Parse(User.FindFirstValue("sub")!);
  private bool IsAdmin => User.IsInRole("admin");

  /// <summary>Debug GET endpoint.</summary>
  [HttpGet]
  [ProducesResponseType(typeof(IEnumerable<OrderResponse>), 200)]
  public async Task<IActionResult> Get()
  {
    var data = await orderService.GetAllAsync();

    return Ok(data);
  }

  /// <summary>Debug POST endpoint.</summary>
  [HttpPost]
  [ProducesResponseType(typeof(OrderResponse), 201)]
  [ProducesResponseType(typeof(object), 400)]
  public async Task<IActionResult> Post()
  {
    // var response = await orderService.CreateAsync();
    // return Ok(response);
    return Ok();
  }
}