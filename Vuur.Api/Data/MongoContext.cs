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

    /// Maakt de productindexen aan waarop de catalogquery van afhangt. Idempotent —
    /// het opnieuw aanmaken van een index met dezelfde specificatie heeft geen effect,
    /// waardoor dit veilig bij iedere startup kan worden uitgevoerd
    /// (mongo-init.js wordt alleen uitgevoerd bij een nieuw volume).
    public async Task EnsureIndexesAsync()
    {
        var keys = Builders<Product>.IndexKeys;

        await Products.Indexes.CreateManyAsync(new[]
        {
            // Search.
            new CreateIndexModel<Product>(
                keys.Text(p => p.ProductName).Text(p => p.ProductDescription)),

            // Cursor-pagination sort keys (each carries _id as the unique tiebreaker).
            new CreateIndexModel<Product>(keys.Descending(p => p.CreatedAt).Descending(p => p.Id)),
            new CreateIndexModel<Product>(keys.Ascending(p => p.MinPrice).Ascending(p => p.Id)),
            new CreateIndexModel<Product>(keys.Descending(p => p.Rating).Descending(p => p.Id)),

            // Filters.
            new CreateIndexModel<Product>(keys.Ascending(p => p.Genre)),
            new CreateIndexModel<Product>(
                keys.Ascending("Variants.Platform").Ascending("Variants.Format")), // multikey
            new CreateIndexModel<Product>(keys.Ascending("Flags")),                 // multikey
        });
    }
}
