using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Features.Auth;

[ApiController]
[Route("/api/auth")]
public class AuthController(AuthService authService, UserReadRepository userReadRepo) : ControllerBase
{
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var (success, error, response) = await authService.RegisterAsync(req);
        if (!success) return Conflict(new { error });
        return Ok(response);
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (success, error, response) = await authService.LoginAsync(req);
        if (!success) return Unauthorized(new { error });
        return Ok(response);
    }

    // POST /api/auth/refresh
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var (success, error, response) = await authService.RefreshAsync(req);
        if (!success) return Unauthorized(new { error });
        return Ok(response);
    }

    // POST /api/auth/logout
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req)
    {
        await authService.LogoutAsync(req.RefreshToken);
        return NoContent();
    }

    // GET /api/auth/me  — requires a valid JWT
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue("sub");

        if (!Guid.TryParse(userId, out var id))
            return Unauthorized();

        var user = await userReadRepo.GetByIdAsync(id);
        if (user is null) return NotFound();

        return Ok(new UserResponse(user.Id, user.FirstName, user.LastName, user.Email, user.RoleName));
    }
}
