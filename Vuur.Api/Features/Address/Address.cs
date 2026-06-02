namespace Vuur.Api.Features.Users
{
    public class Address
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Label { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string HouseNumber { get; set; } = null!;
        public string HouseExt { get; set; } = null!;
        public string PostCode { get; set; } = null!;
        public string City { get; set; } = null!;
        public string CountryCode { get; set; } = null!;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
