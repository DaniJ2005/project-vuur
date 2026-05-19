using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Users;

public record AddressRequest(
    [Required, MaxLength(200)] string Street,
    [Required, MaxLength(100)] string City,
    [Required, MaxLength(2)] string CountryCode  // NL, BE, DE
);

public record AddressResponse(
    Guid Id,
    Guid UserId,
    string Street,
    string City,
    string CountryCode,
    DateTime CreatedAt,
    DateTime UpdatedAt
);