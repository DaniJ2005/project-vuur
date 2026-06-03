namespace Vuur.Api.Features.Products;

/// <summary>
/// Write operations against the product catalog (MongoDB).
/// </summary>
public interface IProductRepository
{
    Task<Product> CreateAsync(Product product);
    Task<bool> UpdateAsync(Product product);
    Task<bool> DeleteAsync(string id);
}
