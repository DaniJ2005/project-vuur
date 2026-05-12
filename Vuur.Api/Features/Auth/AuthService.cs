using Microsoft.AspNetCore.Identity;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Features.Auth;

public class AuthService(
    UserRepository     userRepo,
    UserReadRepository userReadRepo,
    TokenService       tokenService)
{
    private readonly PasswordHasher<User> _hasher = new();

    // ── Register

    public async Task<(bool success, string? error, AuthResponse? response)> RegisterAsync(RegisterRequest req)
    {
        var emailNorm = req.Email.ToLowerInvariant();

        if (await userReadRepo.EmailExistsAsync(emailNorm))
            return (false, "Email is already in use.", null);

        var user = new User
        {
            FirstName = req.FirstName,
            LastName  = req.LastName,
            Email    = emailNorm,
            Role     = "customer"
        };

        user.PasswordHash = _hasher.HashPassword(user, req.Password);

        var created = await userRepo.CreateAsync(user);

        return await IssueTokensAsync(created);
    }

    // ── Login

    public async Task<(bool success, string? error, AuthResponse? response)> LoginAsync(LoginRequest req)
    {
        var user = await userReadRepo.GetByEmailAsync(req.Email);
        if (user is null)
            return (false, "Invalid email or password.", null);

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
        if (result == PasswordVerificationResult.Failed)
            return (false, "Invalid email or password.", null);

        // Rehash transparently if the work factor has changed
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            var newHash = _hasher.HashPassword(user, req.Password);
            await userRepo.UpdatePasswordAsync(user.Id, newHash);
        }

        return await IssueTokensAsync(user);
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    public async Task<(bool success, string? error, AuthResponse? response)> RefreshAsync(RefreshRequest req)
    {
        var record = await userReadRepo.GetValidRefreshTokenAsync(req.RefreshToken);
        if (record is null)
            return (false, "Refresh token is invalid or expired.", null);

        var user = await userReadRepo.GetByIdAsync(record.UserId);
        if (user is null)
            return (false, "User not found.", null);

        // Rotate: revoke old token, issue new pair
        await userRepo.RevokeRefreshTokenAsync(req.RefreshToken);

        return await IssueTokensAsync(user);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public async Task<bool> LogoutAsync(string refreshToken)
        => await userRepo.RevokeRefreshTokenAsync(refreshToken);

    // ── Shared ────────────────────────────────────────────────────────────────

    private async Task<(bool, string?, AuthResponse)> IssueTokensAsync(User user)
    {
        var (accessToken, accessExp)   = tokenService.GenerateAccessToken(user);
        var (refreshToken, refreshExp) = tokenService.GenerateRefreshToken();

        await userRepo.SaveRefreshTokenAsync(user.Id, refreshToken, refreshExp);

        return (true, null, new AuthResponse(accessToken, refreshToken, accessExp));
    }
}
