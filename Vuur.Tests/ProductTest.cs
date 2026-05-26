using Moq;
using Vuur.Api.Features;
using Vuur.Api.Features.Products;
using Xunit;
using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace Vuur.Tests;

public class ProductServiceTests
{
    // private readonly Mock<ProductRepository> _repoMock;
    // private readonly Mock<IMapper> _mapperMock;
    // private readonly ProductService _service;
    // public ProductServiceTests()
    // {
    //     _repoMock = new Mock<ProductRepository>();
    //     _mapperMock = new Mock<IMapper>();

    //     _service = new ProductService(_repoMock.Object, _mapperMock.Object);
    // }

    private readonly Mock<IRepository<Product>> _repoMock;
    private readonly IMapper _mapper;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _repoMock = new Mock<IRepository<Product>>();
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
        _service = new ProductService(_repoMock.Object, _mapper);
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
        Assert.Equal(50, result.Price);
        Assert.Equal(true, result.IsNew);
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

        _repoMock
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
        Assert.Equal(99.99m, existing.Price);
        Assert.True(existing.IsFeatured);
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

        _repoMock.Setup(r => r.GetByIdAsync("1"))
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
        Assert.Equal("Updated Only", existing.ProductName);
        Assert.Equal(10, existing.Price);
        Assert.False(existing.IsFeatured);
    }

    [Fact] // Deletes product and returns success status
    public async Task DeleteProduct_ShouldReturnTrue()
    {
        _repoMock.Setup(r => r.DeleteAsync("1"))
            .ReturnsAsync(true);

        var result = await _service.DeleteAsync("1");

        Assert.True(result);
    }

    [Fact] // Retrieves product by id successfully
    public async Task GetById_ShouldReturnProduct()
    {
        var product = new Product { Id = "1", ProductName = "Test" };

        _repoMock.Setup(r => r.GetByIdAsync("1"))
            .ReturnsAsync(product);

        var result = await _service.GetByIdAsync("1");

        Assert.NotNull(result);
        Assert.Equal("Test", result!.ProductName);
    }

    [Fact] // Allows creation of new product instances
    public async Task AddNewProduct_ShouldAllowNewInstances()
    {
        var request = new CreateProductRequest(
            "New Game",
            null,
            "PC",
            "RPG",
            "Game",
            60,
            70,
            10,
            4.2m,
            true,
            true
        );

        var result = await _service.CreateAsync(request);

        Assert.NotNull(result);
        Assert.Equal("New Game", result.ProductName);
    }
}