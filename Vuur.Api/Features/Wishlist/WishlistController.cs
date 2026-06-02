using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Users;

/// <summary>
/// Manage the authenticated user's product wishlist.
/// </summary>
[ApiController]
[Route("/api/wishlist")]
[Authorize]
[Produces("application/json")]
public class WishlistController(WishlistService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);


    /// <summary>Get all wishlist items for the current user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WishlistItemResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var items = await service.GetAsync(CurrentUserId);
        return Ok(items);
    }

    /// <summary>Add a product to the wishlist.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(WishlistItemResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Add([FromBody] WishlistAddRequest req)
    {
        var item = await service.AddAsync(CurrentUserId, req.ProductsId);
        return CreatedAtAction(nameof(GetAll), new { }, item);
    }

    /// <summary>Update the amount for a product in the wishlist.</summary>
    [HttpPut("{productsId}/amount")]
    [ProducesResponseType(typeof(WishlistItemResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    public async Task<IActionResult> UpdateAmount(string productsId, [FromBody] WishlistUpdateAmountRequest req)
    {
        var (success, error, item) = await service.UpdateAmountAsync(CurrentUserId, productsId, req.Amount);
        if (!success) return NotFound(new { error });
        return Ok(item);
    }

    /// <summary>Remove a product from the wishlist.</summary>
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
