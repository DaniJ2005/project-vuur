using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Users;

public record AddressRequest(
    [Required, MaxLength(100)] string Label,
    [Required, MaxLength(200)] string Street,
    [Required, MaxLength(20)] string HouseNumber,
    [MaxLength(20)] string? HouseExt,
    [Required, MaxLength(20)] string PostCode,
    [Required, MaxLength(100)] string City,
    [Required, MaxLength(2)] string CountryCode,  // NL, BE, DE of FR
    bool IsDefault
);

public record AddressResponse(
    Guid Id,
    Guid UserId,
    string Label,
    string Street,
    string HouseNumber,
    string HouseExt,
    string PostCode,
    string City,
    string CountryCode,
    bool IsDefault,
    DateTime CreatedAt,
    DateTime UpdatedAt
);