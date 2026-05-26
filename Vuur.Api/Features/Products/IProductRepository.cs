namespace Vuur.Api.Features.Products;

public interface IProductRepository<T>
{
    Task CreateAsync(T entity);
    Task<bool> UpdateAsync(T entity);
    Task<bool> DeleteAsync(string id);
}