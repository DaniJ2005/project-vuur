using Dapper;
using MongoDB.Driver;
using Vuur.Api.Features.Products;

namespace Vuur.Api.Data.Seeding;

internal static class ProductSeeder
{
    public static async Task SeedAsync(MongoContext mongo)
    {
        var col   = mongo.GetCollection<Product>("products");
        var count = await col.CountDocumentsAsync(FilterDefinition<Product>.Empty);

        if (count > 0)
        {
            Console.WriteLine("[Seeder] Products already exist in MongoDB so I skipped them.");
            return;
        }

        await col.InsertManyAsync(SeedData.Products);
        Console.WriteLine($"[Seeder] I seeded {SeedData.Products.Count} products into MongoDB.");
    }
}