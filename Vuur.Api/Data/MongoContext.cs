using MongoDB.Driver;
using Vuur.Api.Config;
using Vuur.Api.Features.Products;



namespace Vuur.Api.Data;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(EnvironmentVariables env)
    {
        // Mongo draait onder de docker service-naam 'mongo' op de standaard port.
        // Voor lokale dev exposed docker-compose.override.yml dezelfde port op
        // de host, dus de connection string werkt in beide omgevingen identiek
        // zolang je via docker compose draait.
        var connectionString =
            $"mongodb://{env.MongoUser}:{env.MongoPassword}@mongo:27017/vuur_db?authSource=admin";

        var mongoUrl = new MongoUrl(connectionString);
        var client = new MongoClient(mongoUrl);
        _database = client.GetDatabase(mongoUrl.DatabaseName ?? "vuur_db");
    }

    public IMongoCollection<T> GetCollection<T>(string name)
        => _database.GetCollection<T>(name);
    
    public IMongoCollection<ProductDocument> Products
        => GetCollection<ProductDocument>("products");



    // Typed accessors — add one per collection as you build features
    // public IMongoCollection<ProductDocument> Products
    //     => GetCollection<ProductDocument>("products");
}
