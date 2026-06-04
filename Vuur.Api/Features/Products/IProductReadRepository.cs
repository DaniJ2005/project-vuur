namespace Vuur.Api.Features.Products;


/// Read-only access to the product catalog (MongoDB).
/// Injected into both the product feature and the admin controller.
public interface IProductReadRepository
{
    Task<IReadOnlyList<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(string id);
    Task<IReadOnlyList<Product>> GetByIdsAsync(IReadOnlyList<string> ids);
}
