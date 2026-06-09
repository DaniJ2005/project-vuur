using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Cart;

/// <summary>
/// Manage the authenticated user's shopping cart.
/// </summary>
[ApiController]
[Route("/api/cart")]
[Authorize]
[Produces("application/json")]
public class CartController(CartService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);


    /// <summary>Get all cart items for the current user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CartItemResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var items = await service.GetAsync(CurrentUserId);
        return Ok(items);
    }

    /// <summary>Add a product to the shopping cart.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(CartItemResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Add([FromBody] CartAddRequest req)
    {
        var item = await service.AddAsync(CurrentUserId, req.ProductsId);
        return CreatedAtAction(nameof(GetAll), new { }, item);
    }

    /// <summary>Update the amount for a product in the shopping cart.</summary>
    [HttpPut("{productsId}/amount")]
    [ProducesResponseType(typeof(CartItemResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    public async Task<IActionResult> UpdateAmount(string productsId, [FromBody] CartUpdateAmountRequest req)
    {
        var (success, error, item) = await service.UpdateAmountAsync(CurrentUserId, productsId, req.Amount);
        if (!success) return NotFound(new { error });
        return Ok(item);
    }

    /// <summary>Remove a product from the shopping cart.</summary>
    [HttpDelete("{productsId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(typeof(object), 404)]
    public async Task<IActionResult> Remove(string productsId)
    {
        var (success, error) = await service.RemoveAsync(CurrentUserId, productsId);
        if (!success) return NotFound(new { error });
        return NoContent();
    }
}