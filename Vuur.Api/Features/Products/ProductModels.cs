using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Products;

public record CreateProductRequest(
    [Required, MaxLength(200)] string ProductName,
    string? ProductDescription,
    [Required] string Platform,
    [Required] string Genre,
    [Required] string Type,
    [Range(0, double.MaxValue)] decimal Price,
    [Range(0, double.MaxValue)] decimal OriginalPrice,
    [Range(0, 100)] decimal DiscountPercent,
    [Range(0, 5)] decimal Rating,
    bool IsNew,
    bool IsFeatured
);

public record UpdateProductRequest(
    [MaxLength(200)] string? ProductName,
    string? ProductDescription,
    string? Platform,
    string? Genre,
    string? Type,
    [Range(0, double.MaxValue)] decimal? Price,
    [Range(0, double.MaxValue)] decimal? OriginalPrice,
    [Range(0, 100)] decimal? DiscountPercent,
    [Range(0, 5)] decimal? Rating,
    bool? IsNew,
    bool? IsFeatured
);
