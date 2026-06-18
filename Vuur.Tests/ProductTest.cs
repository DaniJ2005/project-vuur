using Moq;
using Vuur.Api.Features.Products;
using Xunit;

namespace Vuur.Tests;

// Unit tests voor ProductService. De service hangt af van twee repository-interfaces
// en de cache-interface (IProductCache); die worden hier met Moq gemockt, zodat de
// bedrijfslogica wordt geverifieerd zonder een echte MongoDB- of Redis-verbinding.
public class ProductServiceTests
{
    private readonly Mock<IProductReadRepository> _readRepoMock = new();
    private readonly Mock<IProductRepository> _writeRepoMock = new();
    private readonly Mock<IProductCache> _cacheMock = new();
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _service = new ProductService(_readRepoMock.Object, _writeRepoMock.Object, _cacheMock.Object);
    }

    // Hulpfunctie om kort een variant-DTO te maken (platform/formaat/prijs).
    private static ProductVariantDto Variant(
        string platform = "Steam", string format = "key",
        decimal price = 50m, decimal originalPrice = 60m, decimal discountPercent = 10m)
        => new(platform, format, price, originalPrice, discountPercent);

    [Fact] // Maakt een product aan, mapt de varianten en berekent MinPrice
    public async Task CreateProduct_ShouldMapRequestAndComputeMinPrice()
    {
        var request = new CreateProductRequest(
            ProductName: "Test Product",
            ProductDescription: "Desc",
            Genre: "Action",
            Variants: new[] { Variant(price: 50m), Variant(platform: "Xbox", format: "disc", price: 40m) },
            Rating: 4.5m,
            Flags: new[] { "new" });

        _writeRepoMock
            .Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        var result = await _service.CreateAsync(request);

        Assert.Equal("Test Product", result.ProductName);
        Assert.Equal("Action", result.Genre);
        Assert.Equal(2, result.Variants.Count);
        Assert.Equal(40m, result.MinPrice);            // laagste variant-prijs
        Assert.Contains("new", result.Flags);

        _writeRepoMock.Verify(r => r.CreateAsync(It.IsAny<Product>()), Times.Once);
        _cacheMock.Verify(c => c.InvalidateFacetsAsync(), Times.Once);
    }

    [Fact] // Werkt alle opgegeven velden bij en herberekent MinPrice uit de nieuwe varianten
    public async Task UpdateProduct_ShouldUpdateProvidedFields()
    {
        var existing = new Product
        {
            Id = "1",
            ProductName = "Old",
            ProductDescription = "Old",
            Genre = "Old",
            Variants = new List<ProductVariant> { new() { Platform = "PC", Format = "key", Price = 10m } },
            MinPrice = 10m,
            Rating = 1m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _readRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(existing);
        _writeRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Product>())).ReturnsAsync(true);

        var request = new UpdateProductRequest(
            ProductName: "New Name",
            ProductDescription: "New Desc",
            Genre: "Shooter",
            Variants: new[] { Variant("PlayStation", "disc", 99.99m, 120m, 15m) },
            Rating: 4.9m,
            Flags: new[] { "featured" });

        var result = await _service.UpdateAsync("1", request);

        Assert.True(result);
        Assert.Equal("New Name", existing.ProductName);
        Assert.Equal("Shooter", existing.Genre);
        Assert.Single(existing.Variants);
        Assert.Equal(99.99m, existing.MinPrice);       // herberekend uit de nieuwe variant
        Assert.Equal(4.9m, existing.Rating);

        _cacheMock.Verify(c => c.InvalidateAsync("1"), Times.Once);
    }

    [Fact] // Velden die null zijn (niet meegestuurd) blijven ongewijzigd
    public async Task UpdateProduct_ShouldKeepExistingValuesForNullFields()
    {
        var existing = new Product
        {
            Id = "1",
            ProductName = "Old",
            Genre = "Old",
            Variants = new List<ProductVariant> { new() { Platform = "PC", Format = "key", Price = 9m } },
            MinPrice = 9m,
            Rating = 3m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _readRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(existing);
        _writeRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Product>())).ReturnsAsync(true);

        var request = new UpdateProductRequest(
            ProductName: "Updated Only",
            ProductDescription: null,
            Genre: null,
            Variants: null,
            Rating: null,
            Flags: null);

        var result = await _service.UpdateAsync("1", request);

        Assert.True(result);
        Assert.Equal("Updated Only", existing.ProductName);
        Assert.Equal("Old", existing.Genre);           // niet meegestuurd -> behouden
        Assert.Equal(9m, existing.MinPrice);           // varianten niet meegestuurd -> behouden
        Assert.Equal(3m, existing.Rating);
    }

    [Fact] // Een niet-bestaand product levert false op en raakt de write-repo niet
    public async Task UpdateProduct_ShouldReturnFalseWhenNotFound()
    {
        _readRepoMock.Setup(r => r.GetByIdAsync("404")).ReturnsAsync((Product?)null);

        var result = await _service.UpdateAsync("404",
            new UpdateProductRequest(null, null, null, null, null, null));

        Assert.False(result);
        _writeRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact] // Verwijdert een product en invalideert de cache
    public async Task DeleteProduct_ShouldReturnTrueAndInvalidateCache()
    {
        _writeRepoMock.Setup(r => r.DeleteAsync("1")).ReturnsAsync(true);

        var result = await _service.DeleteAsync("1");

        Assert.True(result);
        _cacheMock.Verify(c => c.InvalidateAsync("1"), Times.Once);
    }

    [Fact] // Bij een cache-hit komt het product uit Redis, niet uit de database
    public async Task GetById_ShouldReturnFromCacheWhenPresent()
    {
        var cached = new Product { Id = "1", ProductName = "Cached" };
        _cacheMock.Setup(c => c.GetByIdAsync("1")).ReturnsAsync(cached);

        var result = await _service.GetByIdAsync("1");

        Assert.NotNull(result);
        Assert.Equal("Cached", result!.ProductName);
        _readRepoMock.Verify(r => r.GetByIdAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact] // Bij een cache-miss komt het product uit de repository en wordt het gecachet
    public async Task GetById_ShouldFallBackToRepositoryAndCacheResult()
    {
        _cacheMock.Setup(c => c.GetByIdAsync("1")).ReturnsAsync((Product?)null);
        var fromDb = new Product { Id = "1", ProductName = "FromDb" };
        _readRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(fromDb);

        var result = await _service.GetByIdAsync("1");

        Assert.NotNull(result);
        Assert.Equal("FromDb", result!.ProductName);
        _cacheMock.Verify(c => c.SetByIdAsync(fromDb), Times.Once);
    }
}
