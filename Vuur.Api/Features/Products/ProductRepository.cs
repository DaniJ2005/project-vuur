using MongoDB.Driver;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Products;

public class ProductRepository(MongoContext mongo) : IProductRepository
{
    private IMongoCollection<Product> Collection => mongo.Products;

    public async Task<Product> CreateAsync(Product product)
    {
        await Collection.InsertOneAsync(product);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product)
    {
        var result = await Collection.ReplaceOneAsync(p => p.Id == product.Id, product);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await Collection.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }
}
