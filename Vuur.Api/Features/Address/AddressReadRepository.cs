using Dapper;
using Vuur.Api.Data;

namespace Vuur.Api.Features.Users;

public class AddressReadRepository(PostgresContext db)
{
    public async Task<IEnumerable<Address>> GetByUserIdAsync(Guid userId)
    {
        const string sql = "SELECT * FROM addresses WHERE user_id = @UserId ORDER BY created_at;";
        using var conn = db.CreateConnection();
        return await conn.QueryAsync<Address>(sql, new { UserId = userId });
    }

    public async Task<Address?> GetByIdAsync(Guid id)
    {
        const string sql = "SELECT * FROM addresses WHERE id = @Id LIMIT 1;";
        using var conn = db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Address>(sql, new { Id = id });
    }
}