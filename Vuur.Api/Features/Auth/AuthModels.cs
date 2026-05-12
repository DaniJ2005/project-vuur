using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Auth;

public record RegisterRequest(
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(100)] string LastName,
    [Required, EmailAddress]   string Email,
    [Required, MinLength(8)]   string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required]               string Password
);

public record RefreshRequest(
    [Required] string RefreshToken
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt
);

public record UserResponse(
    Guid   Id,
    string FirstName,
    string LastName,
    string Email,
    string Role
);
