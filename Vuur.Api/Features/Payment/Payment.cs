namespace Vuur.Api.Features.Orders
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string ProductsId { get; set; } = null!; // MongoDB ObjectId
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
