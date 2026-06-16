using System.ComponentModel.DataAnnotations;

namespace Vuur.Api.Features.Products;

// Voor een enkel product variant (bijvoorbeeld: [PS5 disc], [Xbox Key], etc...)
public record ProductVariantDto(
    [Required] string Platform,
    [Required] string Format, // "key" | "disc"
    [Range(0, double.MaxValue)] decimal Price,
    [Range(0, double.MaxValue)] decimal OriginalPrice,
    [Range(0, 100)] decimal DiscountPercent
);

public record CreateProductRequest(
    [Required, MaxLength(200)] string ProductName,
    string? ProductDescription,
    [Required] string Genre,
    [Required, MinLength(1)] IReadOnlyList<ProductVariantDto> Variants,
    [Range(0, 5)] decimal Rating,
    IReadOnlyList<string>? Flags
);

public record UpdateProductRequest(
    [MaxLength(200)] string? ProductName,
    string? ProductDescription,
    string? Genre,
    IReadOnlyList<ProductVariantDto>? Variants,
    [Range(0, 5)] decimal? Rating,
    IReadOnlyList<string>? Flags
);
