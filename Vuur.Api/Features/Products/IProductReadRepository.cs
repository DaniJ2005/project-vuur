namespace Vuur.Api.Features.Products;

public interface IProductReadRepository<T>
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(string id);
}