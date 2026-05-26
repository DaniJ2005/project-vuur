using MongoDB.Driver;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

public class ProductRepository : IRepository<Product>
{
    private readonly IMongoCollection<Product> _collection;

    public ProductRepository(MongoContext context)
    {
        _collection = context.Products;
    }

    public Task<List<Product>> GetAllAsync()
    {
        return _collection.Find(_ => true).ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _collection
            .Find(Builders<Product>.Filter.Eq(x => x.Id, id))
            .FirstOrDefaultAsync();
    }

    public Task CreateAsync(Product product)
    {
        return _collection.InsertOneAsync(product);
    }

    public async Task<bool> UpdateAsync(Product product)
    {
        var result = await _collection.ReplaceOneAsync(
            x => x.Id == product.Id,
            product
        );
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}