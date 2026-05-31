using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Vuur.Api.Data;
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
        
        SetAuthCookies(response!);
        return Ok(new { expiresAt = response!.AccessTokenExpiresAt });
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var (success, error, response) = await authService.LoginAsync(req);
        if (!success) return Unauthorized(new { error });

        SetAuthCookies(response!);
        return Ok(new { expiresAt = response!.AccessTokenExpiresAt });
    }

    // POST /api/auth/refresh
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { error = "No refresh token present." });

        var (success, error, response) = await authService.RefreshAsync(new RefreshRequest(refreshToken));
        if (!success) return Unauthorized(new { error });

        SetAuthCookies(response!);
        return Ok(new { expiresAt = response!.AccessTokenExpiresAt });
    }

    // POST /api/auth/logout
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (refreshToken is not null)
            await authService.LogoutAsync(refreshToken);

        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("refresh_token", new CookieOptions
        {
            Path = "/api/auth/refresh",
        });
        return NoContent();
    }

    // GET /api/auth/me
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

    private void SetAuthCookies(AuthResponse response)
    {
        var isHttps = HttpContext.Request.IsHttps;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure   = isHttps,
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires  = response.AccessTokenExpiresAt,
        };

        Response.Cookies.Append("access_token", response.AccessToken, cookieOptions);

        Response.Cookies.Append("refresh_token", response.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure   = isHttps,
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires  = DateTime.UtcNow.AddDays(30),
            Path     = "/api/auth/refresh",
        });
    }
}
