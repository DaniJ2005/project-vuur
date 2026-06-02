namespace Vuur.Api.Features.Users;

public class AddressService(AddressRepository AddressRepo, AddressReadRepository AddressReadRepo)
{
    public async Task<AddressResponse> CreateAsync(Guid userId, AddressRequest req)
    {
        var existing = await AddressReadRepo.GetByUserIdAsync(userId);
        // First address is always the default; otherwise honour the request.
        var isDefault = req.IsDefault || !existing.Any();

        var address = new Address
        {
            UserId = userId,
            Label = req.Label,
            Street = req.Street,
            HouseNumber = req.HouseNumber,
            HouseExt = req.HouseExt ?? "",
            PostCode = req.PostCode,
            City = req.City,
            CountryCode = req.CountryCode.ToUpperInvariant(),
            IsDefault = isDefault,
        };

        // Clear any existing default before inserting a new one (the partial
        // unique index allows only one default per user).
        if (isDefault) await AddressRepo.ClearDefaultAsync(userId, Guid.Empty);

        var created = await AddressRepo.CreateAsync(address);
        return ToResponse(created);
    }

    public async Task<IEnumerable<AddressResponse>> GetByUserIdAsync(Guid userId)
    {
        var addresses = await AddressReadRepo.GetByUserIdAsync(userId);
        return addresses.Select(ToResponse);
    }

    public async Task<(bool success, string? error, AddressResponse? response)> UpdateAsync(Guid id, Guid userId, AddressRequest req)
    {
        var existing = await AddressReadRepo.GetByIdAsync(id);
        if (existing is null) return (false, "Address not found.", null);
        if (existing.UserId != userId) return (false, "Access denied.", null);

        existing.Label = req.Label;
        existing.Street = req.Street;
        existing.HouseNumber = req.HouseNumber;
        existing.HouseExt = req.HouseExt ?? "";
        existing.PostCode = req.PostCode;
        existing.City = req.City;
        existing.CountryCode = req.CountryCode.ToUpperInvariant();
        existing.IsDefault = req.IsDefault;

        // Demote other defaults first so the single UPDATE can't collide with
        // the partial unique index.
        if (req.IsDefault) await AddressRepo.ClearDefaultAsync(userId, id);

        var updated = await AddressRepo.UpdateAsync(existing);
        return (true, null, ToResponse(updated!));
    }

    public async Task<(bool success, string? error, AddressResponse? response)> SetDefaultAsync(Guid id, Guid userId)
    {
        var existing = await AddressReadRepo.GetByIdAsync(id);
        if (existing is null) return (false, "Address not found.", null);
        if (existing.UserId != userId) return (false, "Access denied.", null);

        await AddressRepo.ClearDefaultAsync(userId, id);
        var updated = await AddressRepo.SetDefaultAsync(id, userId);
        return (true, null, ToResponse(updated!));
    }

    public async Task<(bool success, string? error)> DeleteAsync(Guid id, Guid userId, bool isAdmin)
    {
        var existing = await AddressReadRepo.GetByIdAsync(id);
        if (existing is null) return (false, "Address not found.");
        if (!isAdmin && existing.UserId != userId) return (false, "Access denied.");

        var deleted = await AddressRepo.DeleteAsync(id, isAdmin ? existing.UserId : userId);
        return deleted ? (true, null) : (false, "Address not found.");
    }

    private static AddressResponse ToResponse(Address a) =>
        new(a.Id, a.UserId, a.Label, a.Street, a.HouseNumber, a.HouseExt,
            a.PostCode, a.City, a.CountryCode, a.IsDefault,
            a.CreatedAt, a.UpdatedAt);
}
