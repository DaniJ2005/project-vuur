namespace Vuur.Api.Features.Users
{
    public class Address
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string CountryCode { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
