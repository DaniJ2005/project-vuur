using MongoDB.Driver;
using Vuur.Api.Data;
using MongoDB.Bson;

namespace Vuur.Api.Features.Products;

public class ProductReadRepository : IProductReadRepository<Product>
{
    private readonly IMongoCollection<Product> _collection;

    public ProductReadRepository(MongoContext context)
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

    public async Task<List<Product>> GetByIdsAsync(List<string> ids)
    {
        var filter = Builders<Product>.Filter.In(x => x.Id, ids);

        return await _collection.Find(filter).ToListAsync();
    }
}