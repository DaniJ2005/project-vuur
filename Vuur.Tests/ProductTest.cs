using Moq;
using Vuur.Api.Features;
using Vuur.Api.Features.Products;
using Xunit;
using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace Vuur.Tests;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository<Product>> _repoMock;
    private readonly Mock<IProductReadRepository<Product>> _readRepoMock;
    private readonly IMapper _mapper;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _repoMock = new Mock<IProductRepository<Product>>();
        _readRepoMock = new Mock<IProductReadRepository<Product>>();
        var config = new MapperConfiguration(
            cfg =>
            {
                cfg.CreateMap<CreateProductRequest, Product>();
                cfg.CreateMap<UpdateProductRequest, Product>()
                    .ForAllMembers(opts =>
                        opts.Condition((src, dest, srcMember) => srcMember != null));
            },
            NullLoggerFactory.Instance
        );

        _mapper = config.CreateMapper();
        _service = new ProductService(_repoMock.Object, _readRepoMock.Object, _mapper);
    }

    [Fact] // Creates product and returns mapped result
    public async Task CreateProduct_ShouldReturnCreatedProduct()
    {
        var request = new CreateProductRequest(
            "Test Product",
            "Desc",
            "PC",
            "Action",
            "Game",
            50,
            100,
            50,
            4.5m,
            true,
            false
        );

        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(request);

        Assert.Equal("Test Product", result.ProductName);
        Console.WriteLine("Product name is \"Test Product\"");
        Assert.Equal(50, result.Price);
        Console.WriteLine("Product price is 50");
        Assert.Equal(true, result.IsNew);

        // Finishing comment
        // Conventies voor finishing comments zijn dat ze altijd beginnen met "Product supports..."
        // en eindigen met "successfully!" (het uitroepteken is belangrijk)
        Console.WriteLine("Product supports creation and mapping successfully!");
    }

    [Fact] // Updates all fields including numbers and booleans
    public async Task UpdateProduct_ShouldUpdateAllDataTypes()
    {
        var existing = new Product
        {
            Id = "1",
            ProductName = "Old",
            ProductDescription = "Old",
            Platform = "PC",
            Genre = "Old",
            Type = "Old",
            Price = 10,
            OriginalPrice = 20,
            DiscountPercent = 0,
            Rating = 1,
            IsNew = false,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _readRepoMock
            .Setup(r => r.GetByIdAsync("1"))
            .ReturnsAsync(existing);

        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<Product>()))
            .ReturnsAsync(true);

        var request = new UpdateProductRequest(
            ProductName: "New Name",
            ProductDescription: "New Desc",
            Platform: "Console",
            Genre: "Shooter",
            Type: "Game",
            Price: 99.99m,
            OriginalPrice: 120m,
            DiscountPercent: 15m,
            Rating: 4.9m,
            IsNew: true,
            IsFeatured: true
        );

        var result = await _service.UpdateAsync("1", request);

        Assert.True(result);
        Assert.Equal("New Name", existing.ProductName);
        Console.WriteLine("Product name updated");
        Assert.Equal(99.99m, existing.Price);
        Console.WriteLine("Product price updated");
        Assert.True(existing.IsFeatured);

        // Finishing comment
        Console.WriteLine("Product supports updates successfully!");
    }

    [Fact] // Updates only provided fields, keeps existing values
    public async Task UpdateProduct_ShouldSupportPartialUpdates()
    {
        var existing = new Product
        {
            Id = "1",
            ProductName = "Old",
            Price = 9,
            IsNew = false,
            IsFeatured = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _readRepoMock.Setup(r => r.GetByIdAsync("1"))
            .ReturnsAsync(existing);

        _repoMock.Setup(r => r.UpdateAsync(It.IsAny<Product>()))
            .ReturnsAsync(true);

        var request = new UpdateProductRequest(
            ProductName: "Updated Only",
            ProductDescription: null,
            Platform: null,
            Genre: null,
            Type: null,
            Price: 10,
            OriginalPrice: null,
            DiscountPercent: null,
            Rating: null,
            IsNew: null,
            IsFeatured: null
        );

        var result = await _service.UpdateAsync("1", request);

        Assert.True(result);
        Console.WriteLine("Result exists");
        Assert.Equal("Updated Only", existing.ProductName);
        Console.WriteLine("Results name has been updated");
        Assert.Equal(10, existing.Price);
        Console.WriteLine("Results price has been lowered to 10");
        Assert.False(existing.IsFeatured);

        // Finishing comment
        Console.WriteLine("Product supports partial updates!");
    }

    [Fact] // Deletes product and returns success status
    public async Task DeleteProduct_ShouldReturnTrue()
    {
        _repoMock.Setup(r => r.DeleteAsync("1"))
            .ReturnsAsync(true);

        var result = await _service.DeleteAsync("1");

        Assert.True(result);

        // Finishing comment
        Console.WriteLine("Product supports deletion!");
    }

    [Fact] // Retrieves product by id successfully
    public async Task GetById_ShouldReturnProduct()
    {
        var product = new Product { Id = "1", ProductName = "Test" };

        _readRepoMock.Setup(r => r.GetByIdAsync("1"))
            .ReturnsAsync(product);

        var result = await _service.GetByIdAsync("1");

        Assert.NotNull(result);
        Console.WriteLine("Product retrieved successfully");
        Assert.Equal("Test", result!.ProductName);

        // Finishing comment
        Console.WriteLine("Product supports retrieval by ID!");
    }
}