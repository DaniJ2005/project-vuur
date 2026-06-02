namespace Vuur.Api.Features.Users
{
    public class Role
    {
        public Guid Id { get; set; }
        public string RoleName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
