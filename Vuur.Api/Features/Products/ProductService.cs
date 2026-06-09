namespace Vuur.Api.Features.Products;

/// <summary>
/// Orchestrates cache-first reads and cache-invalidating writes.
/// Maps between the domain model and request/response types inline —
/// no AutoMapper needed for a model this simple.
/// </summary>
public class ProductService(
    IProductReadRepository readRepo,
    IProductRepository writeRepo,
    ProductCache cache)
{
    // ── Queries ───────────────────────────────────────────────────────────────

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

    // ── Commands ──────────────────────────────────────────────────────────────

    public async Task<Product> CreateAsync(CreateProductRequest req)
    {
        var product = new Product
        {
            ProductName        = req.ProductName.Trim(),
            ProductDescription = req.ProductDescription?.Trim(),
            Platform           = req.Platform.Trim(),
            Genre              = req.Genre.Trim(),
            Type               = req.Type.Trim(),
            Price              = req.Price,
            OriginalPrice      = req.OriginalPrice,
            DiscountPercent    = req.DiscountPercent,
            Rating             = req.Rating,
            IsNew              = req.IsNew,
            IsFeatured         = req.IsFeatured,
            CreatedAt          = DateTime.UtcNow,
            UpdatedAt          = DateTime.UtcNow,
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
        if (req.ProductName        is not null) product.ProductName        = req.ProductName.Trim();
        if (req.ProductDescription is not null) product.ProductDescription = req.ProductDescription.Trim();
        if (req.Platform           is not null) product.Platform           = req.Platform.Trim();
        if (req.Genre              is not null) product.Genre              = req.Genre.Trim();
        if (req.Type               is not null) product.Type               = req.Type.Trim();
        if (req.Price              is not null) product.Price              = req.Price.Value;
        if (req.OriginalPrice      is not null) product.OriginalPrice      = req.OriginalPrice.Value;
        if (req.DiscountPercent    is not null) product.DiscountPercent    = req.DiscountPercent.Value;
        if (req.Rating             is not null) product.Rating             = req.Rating.Value;
        if (req.IsNew              is not null) product.IsNew              = req.IsNew.Value;
        if (req.IsFeatured         is not null) product.IsFeatured         = req.IsFeatured.Value;

        product.UpdatedAt = DateTime.UtcNow;

        var updated = await writeRepo.UpdateAsync(product);
        if (updated) await cache.InvalidateAsync(id);
        return updated;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var deleted = await writeRepo.DeleteAsync(id);
        if (deleted) await cache.InvalidateAsync(id);
        return deleted;
    }
}
