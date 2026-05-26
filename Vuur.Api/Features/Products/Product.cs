using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Vuur.Api.Features.Products
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!; // MongoDB ObjectId

        public string ProductName { get; set; } = null!;

        public string? ProductDescription { get; set; }

        public string Platform { get; set; } = null!;

        public string Genre { get; set; } = null!;

        public string Type { get; set; } = null!;

        public decimal Price { get; set; }

        public decimal OriginalPrice { get; set; }

        public decimal DiscountPercent { get; set; }

        public decimal Rating { get; set; }

        public bool IsNew { get; set; }

        public bool IsFeatured { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}