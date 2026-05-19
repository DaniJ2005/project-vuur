using Microsoft.Extensions.Configuration;
using DotNetEnv;
using MongoDB.Driver;
using Vuur.Api.Data;
using Vuur.Api.Features.Products;
using Xunit;

namespace Vuur.Tests;

public class MongoTest
{
    private readonly MongoContext _context;

    public MongoTest()
    {
        // Solution based path because it wouldn't work with a relative path from the test project
        var baseDir = AppContext.BaseDirectory;
        var envPath = Path.GetFullPath(Path.Combine(baseDir, "../../../../Vuur.Api/.env"));

        if (File.Exists(envPath))
        {
            Env.Load(envPath);
        }

        var configuration = new ConfigurationBuilder()
            .AddEnvironmentVariables()
            .Build();

        // Switch connection string because we need to use the test database for tests
        var connectionString =
            configuration["MONGO_TEST_CONNECTION_STRING"]
            ?? configuration["MONGO_CONNECTION_STRING"]
            ?? throw new InvalidOperationException("No Mongo connection string configured.");

        var testConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MONGO_CONNECTION_STRING"] = connectionString
            })
            .Build();

        _context = new MongoContext(testConfig);
    }

    
    [Fact] // Does mongo work?
    public async Task CanInsertAndRetrieveProduct()
    {
        await _context.Products.DeleteManyAsync(_ => true);

        var product = new ProductDocument
        {
            ProductName = "Test Product",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Products.InsertOneAsync(product);

        var result = await _context.Products
            .Find(x => x.ProductName == "Test Product")
            .FirstOrDefaultAsync();

        Assert.NotNull(result);
        Assert.Equal("Test Product", result.ProductName);
    }

    [Fact] // Does the service work?
    public async Task ServiceCreatesProduct()
    {
        var service = new ProductService(new ProductRepository(_context));

        await service.CreateProduct("Service Test");

        var result = await _context.Products.Find(_ => true).ToListAsync();

        Assert.Contains(result, x => x.ProductName == "Service Test");
    }

    [Fact] // Does service update work?
    public async Task ServiceUpdatesProduct()
    {
        await _context.Products.DeleteManyAsync(_ => true);

        var service = new ProductService(new ProductRepository(_context));

        // create initial product
        await service.CreateProduct("Original Name");

        var product = await _context.Products
            .Find(x => x.ProductName == "Original Name")
            .FirstOrDefaultAsync();

        Assert.NotNull(product);

        // update via repository (service currently exposes update via DTO method)
        var updated = await service.UpdateAsync(product.Id, 
            new UpdateProductRequest("Updated Name")
        );

        Assert.True(updated);

        var result = await _context.Products
            .Find(x => x.Id == product.Id)
            .FirstOrDefaultAsync();

        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.ProductName);
    }

    [Fact] // Does service delete work?
    public async Task ServiceDeletesProduct()
    {
        await _context.Products.DeleteManyAsync(_ => true);

        var service = new ProductService(new ProductRepository(_context));

        await service.CreateProduct("To Be Deleted");

        var product = await _context.Products
            .Find(x => x.ProductName == "To Be Deleted")
            .FirstOrDefaultAsync();

        Assert.NotNull(product);

        var deleted = await service.DeleteAsync(product.Id);

        Assert.True(deleted);

        var result = await _context.Products
            .Find(x => x.Id == product.Id)
            .FirstOrDefaultAsync();

        Assert.Null(result);
    }

    [Fact] // Does service retrieval by id work?
    public async Task ServiceGetsProductById()
    {
        await _context.Products.DeleteManyAsync(_ => true);

        var service = new ProductService(new ProductRepository(_context));

        await service.CreateProduct("Lookup Test");

        var inserted = await _context.Products
            .Find(x => x.ProductName == "Lookup Test")
            .FirstOrDefaultAsync();

        Assert.NotNull(inserted);

        var result = await service.GetByIdAsync(inserted.Id);

        Assert.NotNull(result);
        Assert.Equal("Lookup Test", result!.ProductName);
    }

    [Fact] // Does service return all products?
    public async Task ServiceGetsAllProducts()
    {
        await _context.Products.DeleteManyAsync(_ => true);

        var service = new ProductService(new ProductRepository(_context));

        await service.CreateProduct("Product A");
        await service.CreateProduct("Product B");

        var result = await service.GetAllAsync();

        Assert.True(result.Count >= 2);
        Assert.Contains(result, x => x.ProductName == "Product A");
        Assert.Contains(result, x => x.ProductName == "Product B");
    }
}