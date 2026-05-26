using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Products;

public record CreateProductRequest(
    [Required] string ProductName,

    string ProductDescription,
    [Required] string Platform,
    [Required] string Genre,
    [Required] string Type,

    [Required] decimal Price,
    [Required] decimal OriginalPrice,
    [Required] decimal DiscountPercent,

    [Required] decimal Rating,

    [Required] bool IsNew,
    [Required] bool IsFeatured
);

public record UpdateProductRequest(
    string? ProductName,
    string? ProductDescription,

    string? Platform,
    string? Genre,
    string? Type,

    decimal? Price,
    decimal? OriginalPrice,
    decimal? DiscountPercent,

    decimal? Rating,
    bool? IsNew,
    bool? IsFeatured
);