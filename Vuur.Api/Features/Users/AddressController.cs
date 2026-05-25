using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Vuur.Api.Features.Users;

/// <summary>
/// Manage delivery addresses for the authenticated user.
/// </summary>
[ApiController]
[Route("/api/addresses")]
[Authorize]
[Produces("application/json")]
public class AddressController(AddressService service) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue("sub")!);


    private bool IsAdmin => User.IsInRole("admin");

    /// <summary>Get all addresses for the current user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AddressResponse>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var addresses = await service.GetByUserIdAsync(CurrentUserId);
        return Ok(addresses);
    }

    /// <summary>Add a new address.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AddressResponse), 201)]
    [ProducesResponseType(typeof(object), 400)]
    public async Task<IActionResult> Create([FromBody] AddressRequest req)
    {
        var response = await service.CreateAsync(CurrentUserId, req);
        return CreatedAtAction(nameof(GetAll), new { }, response);
    }

    /// <summary>Update an existing address.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AddressResponse), 200)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> Update(Guid id, [FromBody] AddressRequest req)
    {
        var (success, error, response) = await service.UpdateAsync(id, CurrentUserId, req);
        if (!success) return error == "Access denied." ? Forbid() : NotFound(new { error });
        return Ok(response);
    }

    /// <summary>Delete an address.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(typeof(object), 404)]
    [ProducesResponseType(typeof(object), 403)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var (success, error) = await service.DeleteAsync(id, CurrentUserId, IsAdmin);
        if (!success) return error == "Access denied." ? Forbid() : NotFound(new { error });
        return NoContent();
    }
}