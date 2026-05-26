using AutoMapper;

namespace Vuur.Api.Features.Products;

public class ProductService
{
    private readonly IProductRepository<Product> _repo;
    private readonly IProductReadRepository<Product> _readRepo;
    private readonly IMapper _mapper;

    public ProductService(
        IProductRepository<Product> repo,
        IProductReadRepository<Product> readRepo,
        IMapper mapper)
    {
        _repo = repo;
        _readRepo = readRepo;
        _mapper = mapper;
    }

    // Existing functionality preserved (slightly adapted return type)
    public async Task<Product> CreateProduct(string name)
    {
        var product = new Product
        {
            ProductName = name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repo.CreateAsync(product);
        return product;
    }

    public async Task<Product> CreateAsync(CreateProductRequest request)
    {
        var product = _mapper.Map<Product>(request);

        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        await _repo.CreateAsync(product);

        return product;
    }

    public Task<List<Product>> GetAllAsync()
    {
        return _readRepo.GetAllAsync();
    }

    public Task<Product?> GetByIdAsync(string id)
    {
        return _readRepo.GetByIdAsync(id);
    }

    public async Task<bool> UpdateAsync(
        string id,
        UpdateProductRequest request)
    {
        var existingProduct =
            await _readRepo.GetByIdAsync(id);

        if (existingProduct is null)
        {
            return false;
        }

        _mapper.Map(request, existingProduct);

        existingProduct.UpdatedAt = DateTime.UtcNow;

        return await _repo.UpdateAsync(existingProduct);
    }

    

    public Task<bool> DeleteAsync(string id)
    {
        return _repo.DeleteAsync(id);
    }
}