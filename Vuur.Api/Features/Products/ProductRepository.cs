using MongoDB.Driver;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

public class ProductRepository
{
    private readonly IMongoCollection<ProductDocument> _collection;

    public ProductRepository(MongoContext context)
    {
        _collection = context.Products;
    }

    public Task<List<ProductDocument>> GetAllAsync()
    {
        return _collection.Find(_ => true).ToListAsync();
    }

    public Task<ProductDocument?> GetByIdAsync(string id)
    {
        return _collection
            .Find(x => x.Id == id)
            .FirstOrDefaultAsync();
    }

    public Task CreateAsync(ProductDocument product)
    {
        return _collection.InsertOneAsync(product);
    }

    public async Task UpdateAsync(ProductDocument product)
    {
        await _collection.ReplaceOneAsync(
            x => x.Id == product.Id,
            product
        );
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}