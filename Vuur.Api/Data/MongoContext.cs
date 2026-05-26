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
            $"mongodb://{env.MongoUser}:{env.MongoPassword}@{env.MongoHost}:{env.MongoPort}/vuur_mongo?authSource=admin";
            // 
            // ?authSource=admin
        var mongoUrl = new MongoUrl(connectionString);
        var client = new MongoClient(mongoUrl);
        _database = client.GetDatabase(mongoUrl.DatabaseName ?? "vuur_mongo");
    }

    public IMongoCollection<T> GetCollection<T>(string name)
        => _database.GetCollection<T>(name);
    
    public IMongoCollection<Product> Products
        => GetCollection<Product>("products");



    // Typed accessors — add one per collection as you build features
    // public IMongoCollection<Product> Products
    //     => GetCollection<Product>("products");
}
