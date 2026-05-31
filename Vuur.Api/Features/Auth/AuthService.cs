using Microsoft.AspNetCore.Identity;
using Vuur.Api.Data;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Features.Auth;

public class AuthService(
    UserRepository userRepo,
    UserReadRepository userReadRepo,
    TokenService tokenService,
    RedisContext redis)
{
    private readonly PasswordHasher<User> _hasher = new();

    public async Task<(bool success, string? error, AuthResponse? response)> RegisterAsync(RegisterRequest req)
    {
        var emailNorm = req.Email.ToLowerInvariant();

        if (await userReadRepo.EmailExistsAsync(emailNorm))
            return (false, "Email is already in use.", null);

        var customerRole = await userReadRepo.GetRoleByNameAsync("customer");
        if (customerRole is null)
            return (false, "Default role not found. Check seed data.", null);

        var user = new User
        {
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Email = emailNorm,
            RoleId = customerRole.Id,
        };

        user.PasswordHash = _hasher.HashPassword(user, req.Password);

        var created = await userRepo.CreateAsync(user);

        return await IssueTokensAsync(created);
    }

    public async Task<(bool success, string? error, AuthResponse? response)> LoginAsync(LoginRequest req)
    {
        var user = await userReadRepo.GetByEmailAsync(req.Email);
        if (user is null)
            return (false, "Invalid email or password.", null);

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
        if (result == PasswordVerificationResult.Failed)
            return (false, "Invalid email or password.", null);

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            var newHash = _hasher.HashPassword(user, req.Password);
            await userRepo.UpdatePasswordAsync(user.Id, newHash);
        }

        return await IssueTokensAsync(user);
    }
    public async Task<(bool success, string? error, AuthResponse? response)> RefreshAsync(RefreshRequest req)
    {
        var userId = await redis.GetRefreshTokenAsync(req.RefreshToken);
        if (userId is null)
            return (false, "Refresh token is invalid or expired.", null);

        var user = await userReadRepo.GetByIdAsUserAsync(userId.Value);
        if (user is null)
            return (false, "User not found.", null);

        await redis.DeleteRefreshTokenAsync(req.RefreshToken);

        return await IssueTokensAsync(user);
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        await redis.DeleteRefreshTokenAsync(refreshToken);
        return true;
    }

    private async Task<(bool, string?, AuthResponse)> IssueTokensAsync(User user)
    {
        var (accessToken, accessExp) = tokenService.GenerateAccessToken(user);
        var (refreshToken, refreshExp) = tokenService.GenerateRefreshToken();

        await redis.SetRefreshTokenAsync(refreshToken, user.Id);

        return (true, null, new AuthResponse(accessToken, refreshToken, accessExp));
    }
}