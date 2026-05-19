namespace Vuur.Api.Features.Products;

public class ProductService
{
    private readonly ProductRepository _repo;

    public ProductService(ProductRepository repo)
    {
        _repo = repo;
    }

    // Existing functionality preserved (slightly adapted return type)
    public async Task<ProductDocument> CreateProduct(string name)
    {
        var product = new ProductDocument
        {
            ProductName = name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repo.CreateAsync(product);
        return product;
    }

    // Controller-compatible create (preferred)
    public Task<ProductDocument> CreateAsync(CreateProductRequest request)
    {
        return CreateProduct(request.ProductName);
    }

    public Task<List<ProductDocument>> GetAllAsync()
    {
        return _repo.GetAllAsync();
    }

    public Task<ProductDocument?> GetByIdAsync(string id)
    {
        return _repo.GetByIdAsync(id);
    }

    public async Task<bool> UpdateAsync(string id, UpdateProductRequest request)
    {
        var existing = await _repo.GetByIdAsync(id);

        if (existing is null)
            return false;

        existing.ProductName = request.ProductName;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(existing);

        return true;
    }

    public Task<bool> DeleteAsync(string id)
    {
        return _repo.DeleteAsync(id);
    }
}