using MongoDB.Driver;

namespace Vuur.Api.Data;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(IConfiguration configuration)
    {
        var connectionString = configuration["MONGO_CONNECTION_STRING"]
            ?? throw new InvalidOperationException("MONGO_CONNECTION_STRING is not configured.");

        var mongoUrl = new MongoUrl(connectionString);
        var client = new MongoClient(mongoUrl);
        _database = client.GetDatabase(mongoUrl.DatabaseName ?? "vuur_db");
    }

    public IMongoCollection<T> GetCollection<T>(string name)
        => _database.GetCollection<T>(name);

    // Typed accessors — add one per collection as you build features
    // public IMongoCollection<ProductDocument> Products
    //     => GetCollection<ProductDocument>("products");
}
