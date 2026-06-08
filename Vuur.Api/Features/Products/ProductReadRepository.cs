using MongoDB.Driver;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

public class ProductReadRepository(MongoContext mongo) : IProductReadRepository
{
    private IMongoCollection<Product> Collection => mongo.Products;

    public async Task<IReadOnlyList<Product>> GetAllAsync()
        => await Collection
            .Find(Builders<Product>.Filter.Empty)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();

    public async Task<Product?> GetByIdAsync(string id)
        => await Collection
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

    public async Task<IReadOnlyList<Product>> GetByIdsAsync(IReadOnlyList<string> ids)
        => await Collection
            .Find(Builders<Product>.Filter.In(p => p.Id, ids))
            .ToListAsync();
}
