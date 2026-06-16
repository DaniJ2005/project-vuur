using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Vuur.Api.Features.Products;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string ProductName { get; set; } = null!;
    public string? ProductDescription { get; set; }

    public string Genre { get; set; } = null!;

    // Elk Product heeft nu meerdere varianten voor verscillende platformen formaaten met eigen prijzen.
    public List<ProductVariant> Variants { get; set; } = new();


    [BsonRepresentation(BsonType.Decimal128)]
    public decimal MinPrice { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Rating { get; set; }

    // Voor property flags zoals: "bestseller", "new", "featured", etc...
    public List<string> Flags { get; set; } = new();

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProductVariant
{
    // "Steam", "Xbox", "Playstation", "PC", "Switch"
    public string Platform { get; set; } = null!;

    // "key" or "disc"
    public string Format { get; set; } = null!;

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal OriginalPrice { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal DiscountPercent { get; set; }
}
