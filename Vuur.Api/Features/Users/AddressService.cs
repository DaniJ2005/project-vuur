namespace Vuur.Api.Features.Users;

public class AddressService(AddressRepository repo, AddressReadRepository readRepo)
{
    public async Task<AddressResponse> CreateAsync(Guid userId, AddressRequest req)
    {
        var address = new Address
        {
            UserId = userId,
            Street = req.Street,
            City = req.City,
            CountryCode = req.CountryCode.ToUpperInvariant(),
        };

        var created = await repo.CreateAsync(address);
        return ToResponse(created);
    }

    public async Task<IEnumerable<AddressResponse>> GetByUserIdAsync(Guid userId)
    {
        var addresses = await readRepo.GetByUserIdAsync(userId);
        return addresses.Select(ToResponse);
    }

    public async Task<(bool success, string? error, AddressResponse? response)> UpdateAsync(Guid id, Guid userId, AddressRequest req)
    {
        var existing = await readRepo.GetByIdAsync(id);
        if (existing is null) return (false, "Address not found.", null);
        if (existing.UserId != userId) return (false, "Access denied.", null);

        existing.Street = req.Street;
        existing.City = req.City;
        existing.CountryCode = req.CountryCode.ToUpperInvariant();

        var updated = await repo.UpdateAsync(existing);
        return (true, null, ToResponse(updated!));
    }

    public async Task<(bool success, string? error)> DeleteAsync(Guid id, Guid userId, bool isAdmin)
    {
        var existing = await readRepo.GetByIdAsync(id);
        if (existing is null) return (false, "Address not found.");
        if (!isAdmin && existing.UserId != userId) return (false, "Access denied.");

        var deleted = await repo.DeleteAsync(id, isAdmin ? existing.UserId : userId);
        return deleted ? (true, null) : (false, "Address not found.");
    }

    private static AddressResponse ToResponse(Address a) =>
        new(a.Id, a.UserId, a.Street, a.City, a.CountryCode, a.CreatedAt, a.UpdatedAt);
}