namespace Vuur.Api.Features.Products;


public class ProductService(
    IProductReadRepository readRepo,
    IProductRepository writeRepo,
    ProductCache cache)
{

    public async Task<IReadOnlyList<Product>> GetAllAsync()
    {
        var cached = await cache.GetAllAsync();
        if (cached is not null) return cached;

        var products = await readRepo.GetAllAsync();
        await cache.SetAllAsync(products);
        return products;
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        var cached = await cache.GetByIdAsync(id);
        if (cached is not null) return cached;

        var product = await readRepo.GetByIdAsync(id);
        if (product is null) return null;

        await cache.SetByIdAsync(product);
        return product;
    }


    public async Task<Product> CreateAsync(CreateProductRequest req)
    {
        var variants = MapVariants(req.Variants);

        var product = new Product
        {
            ProductName = req.ProductName.Trim(),
            ProductDescription = req.ProductDescription?.Trim(),
            Genre = req.Genre.Trim(),
            Variants = variants,
            MinPrice = variants.Min(v => v.Price),
            Rating = req.Rating,
            Flags = NormalizeFlags(req.Flags),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await writeRepo.CreateAsync(product);
        await cache.InvalidateAllAsync();
        return product;
    }

    public async Task<bool> UpdateAsync(string id, UpdateProductRequest req)
    {
        var product = await readRepo.GetByIdAsync(id);
        if (product is null) return false;

        // Only apply fields that were actually provided
        if (req.ProductName is not null) product.ProductName = req.ProductName.Trim();
        if (req.ProductDescription is not null) product.ProductDescription = req.ProductDescription.Trim();
        if (req.Genre is not null) product.Genre = req.Genre.Trim();
        if (req.Rating is not null) product.Rating = req.Rating.Value;
        if (req.Flags is not null) product.Flags = NormalizeFlags(req.Flags);

        if (req.Variants is not null)
        {
            product.Variants = MapVariants(req.Variants);
            product.MinPrice = product.Variants.Count > 0 ? product.Variants.Min(v => v.Price) : 0m;
        }

        product.UpdatedAt = DateTime.UtcNow;

        var updated = await writeRepo.UpdateAsync(product);
        if (updated) await cache.InvalidateAsync(id);
        return updated;
    }


    private static List<ProductVariant> MapVariants(IReadOnlyList<ProductVariantDto> dtos)
        => dtos.Select(v => new ProductVariant
        {
            Platform = v.Platform.Trim(),
            Format = v.Format.Trim().ToLower(), // "key" | "disc"
            Price = v.Price,
            OriginalPrice = v.OriginalPrice,
            DiscountPercent = v.DiscountPercent,
        }).ToList();

    private static List<string> NormalizeFlags(IReadOnlyList<string>? flags)
        => (flags ?? Array.Empty<string>())
            .Select(f => f.Trim())
            .Where(f => f.Length > 0)
            .Distinct()
            .ToList();

    public async Task<bool> DeleteAsync(string id)
    {
        var deleted = await writeRepo.DeleteAsync(id);
        if (deleted) await cache.InvalidateAsync(id);
        return deleted;
    }
}
