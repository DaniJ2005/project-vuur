using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Users;

[ApiController]
[Route("/api/wishlist")]
[Authorize]
[Produces("application/json")]
public class WishlistController(WishlistService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);


    // Get all wishlist items for the current user.
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<WishlistItemResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var items = await service.GetAsync(CurrentUserId);
        return Ok(items);
    }

    // Add a product to the wishlist.
    [HttpPost]
    [ProducesResponseType(typeof(WishlistItemResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Add([FromBody] WishlistAddRequest req)
    {
        var item = await service.AddAsync(CurrentUserId, req.ProductsId);
        return CreatedAtAction(nameof(GetAll), new { }, item);
    }

    // Remove a product from the wishlist.
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
