namespace Vuur.Api.Features.Products;

public interface IProductRepository
{
    Task<Product> CreateAsync(Product product);
    Task<bool> UpdateAsync(Product product);
    Task<bool> DeleteAsync(string id);
}
