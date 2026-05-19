using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Vuur.Api.Features.Products;

public class ProductDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("product_name")]
    public string ProductName { get; set; } = null!;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; }
}