using Vuur.Api.Data;
using Vuur.Api.Config;

namespace Vuur.Api.Data.Seeding;

public static class DbSeeder
{
    public static async Task SeedAsync(
        PostgresContext postgres,
        MongoContext mongo,
        bool isActive,
        EnvironmentVariables env)
    {
        await AdminSeeder.SeedAsync(postgres, env);

        //  Dev only
        if (!isActive) return;
        await ProductSeeder.SeedAsync(mongo);
    }
}