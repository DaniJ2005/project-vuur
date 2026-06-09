namespace Vuur.Api.Features.Cart
{
    public record CartItem{
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string ProductsId { get; set; } = null!; // MongoDB ObjectId
        public int Amount { get; set; } = 1;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
