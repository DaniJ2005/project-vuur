namespace Vuur.Api.Features.Orders
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string ProductsId { get; set; } = null!; // MongoDB ObjectId
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
