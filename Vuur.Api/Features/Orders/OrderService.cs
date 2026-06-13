using Vuur.Api.Features.Products;

namespace Vuur.Api.Features.Orders;

public class OrderService(OrderRepository repo, OrderReadRepository readRepo, ProductReadRepository productReadRepo)
{
    public async Task<OrderResponse> CreateAsync(Guid? userId, string? authenticatedEmail, CreateOrderRequest req)
    {
        // For a logged-in user the account email (from the JWT) is authoritative;
        // the body's CustomerEmail is only trusted for anonymous (guest) checkout.
        // First/last name always come from the body — they belong to the delivery
        // recipient and may differ from the account holder.
        var customerEmail = authenticatedEmail ?? req.CustomerEmail;

        var productIds = req.Items
            .Select(i => i.ProductId)
            .Distinct()
            .ToList();

        IReadOnlyList<Product> products = await productReadRepo.GetByIdsAsync(productIds);
        var productLookup = products.ToDictionary(p => p.Id);

        // Snapshot each line from the catalogue so the order stays a faithful
        // historical record even if the product later changes price/name.
        var items = new List<OrderItem>(req.Items.Count);
        decimal itemsSubtotal = 0;
        bool requiresShipping = false;

        foreach (CreateOrderItemRequest item in req.Items)
        {
            if (!productLookup.TryGetValue(item.ProductId, out var product))
            {
                throw new ArgumentException($"Product '{item.ProductId}' does not exist");
            }

            // Resolve the specific variant the customer chose — its price and format
            // are what get snapshotted onto the order line.
            var format = item.Format.Trim().ToLowerInvariant();
            var variant = product.Variants.FirstOrDefault(v =>
                string.Equals(v.Platform, item.Platform.Trim(), StringComparison.OrdinalIgnoreCase) &&
                string.Equals(v.Format, format, StringComparison.OrdinalIgnoreCase));

            if (variant is null)
            {
                throw new ArgumentException(
                    $"Product '{item.ProductId}' is not available as {item.Platform}/{format}.");
            }

            itemsSubtotal += variant.Price * item.Quantity;

            // A disc is physical, so the whole order needs shipping.
            if (variant.Format == "disc")
            {
                requiresShipping = true;
            }

            items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.ProductName,
                ProductType = variant.Format,
                Platform = variant.Platform,
                UnitPrice = variant.Price,
                Quantity = item.Quantity
            });
        }

        if (requiresShipping && req.ShippingAddress is null)
        {
            throw new ArgumentException("A shipping address is required for orders containing a physical (disc) item.");
        }

        decimal shippingPrice = requiresShipping ? ResolveShippingPrice(req.ShippingMethod) : 0;

        var order = new Order
        {
            UserId = userId,
            CustomerEmail = customerEmail,
            CustomerFirstName = req.CustomerFirstName,
            CustomerLastName = req.CustomerLastName,
            // Checkout's "pay" action is a single POST /api/orders, so a created
            // order is already paid (payment is mock). Keys are minted on insert.
            Status = "paid",
            RequiresShipping = requiresShipping,
            // Only carry a shipping method when something actually ships.
            ShippingMethod = requiresShipping ? req.ShippingMethod : null,
            ShippingPrice = shippingPrice,
            // Grand total: line items + shipping.
            TotalAmount = itemsSubtotal + shippingPrice,

            // Address snapshot — only stored when the order ships (key-only orders
            // leave these null, matching the chk_orders_shipping constraint in V008).
            ShipStreet = requiresShipping ? req.ShippingAddress!.Street : null,
            ShipHouseNumber = requiresShipping ? req.ShippingAddress!.HouseNumber : null,
            ShipHouseExt = requiresShipping ? req.ShippingAddress!.HouseExt : null,
            ShipPostCode = requiresShipping ? req.ShippingAddress!.PostCode : null,
            ShipCity = requiresShipping ? req.ShippingAddress!.City : null,
            ShipCountryCode = requiresShipping ? req.ShippingAddress!.CountryCode : null
        };

        // Persists the order and its line items together; returns the order with
        // its generated id/timestamps.
        Order created = await repo.CreateAsync(order, items);

        // Read the order back so the response carries the persisted item ids.
        var responses = await HydrateAsync([created]);
        return responses.Single();
    }

    public async Task<IEnumerable<OrderResponse>> GetByUserIdAsync(Guid userId)
    {
        var orders = (await readRepo.GetByUserIdAsync(userId)).ToList();
        return await HydrateAsync(orders);
    }

    public async Task<(bool success, string? error, OrderResponse? response)> GetByIdAsync(Guid id, Guid userId, bool isAdmin)
    {
        var order = await readRepo.GetByIdAsync(id);
        if (order is null) return (false, "Order not found.", null);
        if (!isAdmin && order.UserId != userId) return (false, "Access denied.", null);

        var responses = await HydrateAsync([order]);
        return (true, null, responses.Single());
    }

    public async Task<IEnumerable<OrderResponse>> GetAllAsync()
    {
        var orders = (await readRepo.GetAllAsync()).ToList();
        return await HydrateAsync(orders);
    }

    /// <summary>
    /// Loads the line items for the given orders in one batch query (no N+1) and
    /// maps everything onto <see cref="OrderResponse"/>.
    /// </summary>
    private async Task<IEnumerable<OrderResponse>> HydrateAsync(IReadOnlyList<Order> orders)
    {
        if (orders.Count == 0) return [];

        var orderIds = orders.Select(o => o.Id).ToList();
        var items = await readRepo.GetItemsByOrderIdsAsync(orderIds);
        var itemsByOrder = items.ToLookup(i => i.OrderId);

        // Load the keys for these items in one batch and group them per line.
        var keys = await readRepo.GetKeysByOrderItemIdsAsync(items.Select(i => i.Id).ToList());
        var keysByItem = keys
            .Where(k => k.OrderItemId is not null)
            .ToLookup(k => k.OrderItemId!.Value, k => k.KeyCode);

        return orders.Select(o => ToResponse(o, itemsByOrder[o.Id], keysByItem)).ToList();
    }

    /// <summary>
    /// Flat shipping rate per method. Placeholder figures — replace with real
    /// carrier pricing when it's decided. Only applied to orders that ship a disc.
    /// </summary>
    private static decimal ResolveShippingPrice(string? method) => method?.ToLowerInvariant() switch
    {
        "express" => 9.99m,
        "standard" => 4.99m,
        _ => 4.99m // unknown/unspecified → standard
    };

    private static OrderResponse ToResponse(Order o, IEnumerable<OrderItem> items, ILookup<Guid, string> keysByItem) =>
        new(
            o.Id,
            o.UserId,
            o.CustomerEmail,
            o.CustomerFirstName,
            o.CustomerLastName,
            o.Status,
            o.RequiresShipping,
            o.ShippingMethod,
            o.ShippingPrice,
            o.TotalAmount,
            o.RequiresShipping
                ? new ShippingAddressResponse(
                    o.ShipStreet!,
                    o.ShipHouseNumber!,
                    o.ShipHouseExt!,
                    o.ShipPostCode!,
                    o.ShipCity!,
                    o.ShipCountryCode!)
                : null,
            items.Select(i => new OrderItemResponse(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.ProductType,
                i.Platform,
                i.UnitPrice,
                i.Quantity,
                keysByItem[i.Id].ToList())).ToList(),
            o.CreatedAt,
            o.UpdatedAt);
}
