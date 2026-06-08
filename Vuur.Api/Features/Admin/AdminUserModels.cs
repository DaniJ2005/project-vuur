namespace Vuur.Api.Features.Admin;

using System.ComponentModel.DataAnnotations;

public record AdminCreateUserRequest(
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(100)] string LastName,
    [Required, EmailAddress]   string Email,
    [Required, MinLength(8)]   string Password,
    [Required]                 string Role          // "customer" | "admin"
);

public record AdminUpdateUserRequest(
    [MaxLength(100)] string? FirstName,
    [MaxLength(100)] string? LastName,
    [EmailAddress]   string? Email,
    string?                  Role
);

public record AdminUserResponse(
    Guid   Id,
    string FirstName,
    string LastName,
    string Email,
    string RoleName,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AdminUpdateOrderStatusRequest(
    [Required] string Status   // pending | paid | fulfilled | cancelled
);