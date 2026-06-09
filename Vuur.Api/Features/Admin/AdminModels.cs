namespace Vuur.Api.Features.Admin;

public record AdminTableResponse(
    string Name,
    bool CanDelete,
    IReadOnlyList<Dictionary<string, object?>> Rows
);

public record AdminRefreshTokenResponse(
    string Token,
    string TokenPreview,
    string UserId,
    DateTime? ExpiresAt
);

public record AdminAnalyticsResponse(
    int TotalOrders,
    int TotalPayments,
    int TotalWishlistItems,
    int TotalUsers,
    int TotalProducts,
    int TotalDistinctOrderedProducts,
    int TotalPageViews,
    IReadOnlyList<AdminAnalyticsTopProductResponse> TopProducts
);

public record AdminAnalyticsTopProductResponse(
    string ProductId,
    string ProductName,
    int OrderCount
);

public record AdminActivityResponse(
    string Id,
    string Description,
    DateTime Timestamp
);

/// <summary>Internal table definition — not exposed to clients.</summary>
internal record AdminPostgresTable(
    string Name,
    string SelectSql,
    string? DeleteSql
);
