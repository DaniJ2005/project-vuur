// GameModels.cs
// TIJDELIJK HIER
// Plaats in: /Models/ of /Shared/
// Bevat: data models + hardcoded game catalogus + cart state

namespace Vuur.Models;

public record GameItem(
    int Id,
    string Title,
    string Platform,
    string Genre,
    decimal Price,
    decimal OriginalPrice,
    int DiscountPercent,
    int Reviews,
    float Rating,
    string Type,        // "key" of "disc"
    string Description,
    bool IsNew,
    bool IsDeal
);

public class CartItem
{
    public GameItem Game { get; set; } = null!;
    public int Quantity { get; set; } = 1;
}

public static class GameStore
{
    public static readonly List<GameItem> AllGames = new()
    {
        new(1,  "Cyberpunk 2077",           "PC",    "RPG",          14.99m, 59.99m, 75, 4821, 4.2f, "key",  "Een open-wereld RPG in een dystopische toekomst. Speel als V, een huurling die op zoek is naar een uniek implantaat dat onsterfelijkheid biedt.", false, true),
        new(2,  "Elden Ring",               "PS5",   "Soulslike",    39.99m, 59.99m, 33, 3102, 4.8f, "disc", "Het epos van FromSoftware en George R.R. Martin. Verken de Lands Between en versla de Elden Lords.", false, true),
        new(3,  "GTA VI",                   "PC",    "Open World",   59.99m, 59.99m,  0,  982, 4.5f, "key",  "De langverwachte terugkeer naar Vice City. Speel als twee personages in een crimineel duo.", true,  false),
        new(4,  "Hades II",                 "PC",    "Roguelike",    19.99m, 24.99m, 20, 2145, 4.7f, "key",  "De sequel van het bekroonde Hades. Speel als Melinoë en vecht door de onderwereld.", false, true),
        new(5,  "Hollow Knight: Silksong",  "PC",    "Metroidvania", 29.99m, 29.99m,  0,    0, 0.0f, "key",  "De langverwachte opvolger van Hollow Knight. Speel als Hornet door een nieuw koninkrijk.", true,  false),
        new(6,  "Avowed",                   "Xbox",  "RPG",          49.99m, 49.99m,  0,  540, 4.0f, "disc", "Een first-person RPG in de wereld van Pillars of Eternity van Obsidian Entertainment.", true,  false),
        new(7,  "Monster Hunter Wilds",     "PC",    "Action RPG",   59.99m, 59.99m,  0,  310, 4.3f, "key",  "De evolutie van het Monster Hunter franchise. Jacht op monsters in dynamische ecosystemen.", true,  false),
        new(8,  "Split Fiction",            "PC",    "Co-op",        39.99m, 39.99m,  0,  875, 4.9f, "key",  "Een co-op avontuur van de makers van It Takes Two. Twee auteurs gevangen in hun eigen verhalen.", true,  false),
        new(9,  "Like a Dragon: Pirate",    "PS5",   "JRPG",         54.99m, 54.99m,  0,  120, 4.1f, "disc", "Ichiban Kasuga en zijn crew plunderen de zeven zeeën in dit turn-based JRPG avontuur.", true,  false),
        new(10, "Red Dead Redemption 2",    "PC",    "Open World",   24.99m, 49.99m, 50, 8900, 4.9f, "key",  "Het meesterwerk van Rockstar Games. Een episch verhaal over eergevoel in het Wilde Westen.", false, true),
        new(11, "The Witcher 3",            "PC",    "RPG",           9.99m, 39.99m, 75,12000, 4.9f, "key",  "Een van de beste RPGs aller tijden. Speel als Geralt van Rivia en zoek je adoptieve dochter.", false, true),
        new(12, "God of War Ragnarök",      "PS5",   "Action",       49.99m, 69.99m, 29, 5400, 4.8f, "disc", "Kratos en Atreus in het Noorse mythologische tijdperk. De strijd om Ragnarök begint.", false, true),
        new(13, "Baldur's Gate 3",          "PC",    "RPG",          44.99m, 59.99m, 25, 9200, 4.9f, "key",  "Het magnum opus van Larian Studios. Een D&D-avontuur met ongekende keuzemogelijkheden.", false, false),
        new(14, "Starfield",                "Xbox",  "Sci-Fi RPG",   29.99m, 69.99m, 57, 3100, 3.8f, "disc", "Bethesda's eerste nieuwe IP in 25 jaar. Verken honderden planeten in de Settled Systems.", false, true),
        new(15, "Forza Horizon 5",          "Xbox",  "Racing",       34.99m, 59.99m, 42, 4200, 4.5f, "disc", "De ultieme open-wereld racegame. Rijd door de levendige landschappen van Mexico.", false, true),
        new(16, "Stardew Valley",           "Switch","Simulation",    9.99m,  9.99m,  0,15000, 4.9f, "key",  "Bouw je eigen boerderij en ontdek de geheimen van Pelican Town. Relaxen met een controler.", false, false),
    };
}

// CartService.cs — simpele singleton voor cart state (geen DI nodig, static is fine voor prototype)
public static class CartService
{
    public static List<CartItem> Items { get; private set; } = new();
    public static event Action? OnChange;

    public static void AddToCart(GameItem game)
    {
        var existing = Items.FirstOrDefault(i => i.Game.Id == game.Id);
        if (existing != null)
            existing.Quantity++;
        else
            Items.Add(new CartItem { Game = game, Quantity = 1 });
        OnChange?.Invoke();
    }

    public static void RemoveFromCart(int gameId)
    {
        Items.RemoveAll(i => i.Game.Id == gameId);
        OnChange?.Invoke();
    }

    public static void UpdateQuantity(int gameId, int qty)
    {
        var item = Items.FirstOrDefault(i => i.Game.Id == gameId);
        if (item != null) { item.Quantity = qty; OnChange?.Invoke(); }
    }

    public static void Clear() { Items.Clear(); OnChange?.Invoke(); }

    public static decimal Total => Items.Sum(i => i.Game.Price * i.Quantity);
    public static int Count => Items.Sum(i => i.Quantity);
    public static bool HasDisc => Items.Any(i => i.Game.Type == "disc");
}
