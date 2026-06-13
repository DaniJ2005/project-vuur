using Vuur.Api.Features.Products;

namespace Vuur.Api.Data.Seeding;

/// <summary>
/// Builds the product catalogue directly in the variant-based shape (one document
/// per real game, with a <see cref="Product.Variants"/> entry per platform/format).
///
/// All titles are real, existing games. Per-product pricing, ratings, discounts and
/// flags are derived deterministically from a fixed-seed RNG so a reseed is always
/// reproducible — only the values are synthesised, never the game names. The volume
/// (~2k products, several thousand variants) exists so the catalog pagination/index
/// work can be performance-tested against a realistic dataset.
/// </summary>
internal static class SeedData
{
    public const string AdminEmail = "admin@vuur.nl";

    // Fixed seed → identical catalogue on every reseed.
    private static readonly Random Rng = new(20260612);

    // Accumulator the DefineCatalog() DSL appends to. Declared before Products so
    // it is initialised first (static field initialisers run in textual order).
    private static readonly List<Product> Acc = new();

    public static readonly IReadOnlyList<Product> Products = Build();

    // ── price tiers ──────────────────────────────────────────────────────────────
    private enum Band { Free, Budget, Mid, Recent, New }

    private static decimal Msrp(Band b) => b switch
    {
        Band.Free   => 0m,
        Band.Budget => 14.99m,
        Band.Mid    => 29.99m,
        Band.Recent => 49.99m,
        Band.New    => 69.99m,
        _           => 29.99m,
    };

    private static decimal DiscountFor(Band b)
    {
        var (lo, hi) = b switch
        {
            Band.New    => (0, 15),
            Band.Recent => (0, 35),
            Band.Mid    => (10, 55),
            Band.Budget => (0, 50),
            _           => (0, 0),
        };
        return hi == 0 ? 0m : Rng.Next(lo, hi + 1);
    }

    // ── platform profiles ────────────────────────────────────────────────────────
    private enum Profile { Pc, PcPlayStation, Multi, MultiNintendo, PlayStation, Xbox, Nintendo }

    private static (string platform, string[] formats)[] Platforms(Profile p) => p switch
    {
        Profile.Pc            => new[] { ("Steam", new[] { "key" }) },
        Profile.PcPlayStation => new[] { ("Steam", new[] { "key" }), ("PlayStation", new[] { "key", "disc" }) },
        Profile.Multi         => new[] { ("Steam", new[] { "key" }), ("PlayStation", new[] { "key", "disc" }), ("Xbox", new[] { "key", "disc" }) },
        Profile.MultiNintendo => new[] { ("Steam", new[] { "key" }), ("PlayStation", new[] { "key", "disc" }), ("Xbox", new[] { "key", "disc" }), ("Nintendo", new[] { "key", "disc" }) },
        Profile.PlayStation   => new[] { ("PlayStation", new[] { "key", "disc" }) },
        Profile.Xbox          => new[] { ("Xbox", new[] { "key", "disc" }) },
        Profile.Nintendo      => new[] { ("Nintendo", new[] { "key", "disc" }) },
        _                     => new[] { ("Steam", new[] { "key" }) },
    };

    private static decimal Round2(decimal v) => Math.Round(v, 2, MidpointRounding.AwayFromZero);
    private static decimal Round1(decimal v) => Math.Round(v, 1, MidpointRounding.AwayFromZero);

    // ── product factory ──────────────────────────────────────────────────────────
    private static Product Make(string name, string genre, Profile profile, Band band)
    {
        var msrp = Msrp(band);

        var variants = new List<ProductVariant>();
        foreach (var (platform, formats) in Platforms(profile))
        foreach (var format in formats)
        {
            // Physical editions carry a small premium over the digital key.
            var listPrice = msrp == 0 ? 0m : msrp + (format == "disc" ? 5m : 0m);
            var discount  = msrp == 0 ? 0m : DiscountFor(band);
            var price     = msrp == 0 ? 0m : Round2(listPrice * (1 - discount / 100m));

            variants.Add(new ProductVariant
            {
                Platform        = platform,
                Format          = format,
                Price           = price,
                OriginalPrice   = listPrice,
                DiscountPercent = discount,
            });
        }

        var flags = new List<string>();
        // New-tier releases are mostly flagged new; a small slice of everything else
        // counts as "recently added" so the catalogue always has fresh items.
        var newChance = band == Band.New ? 0.5 : 0.03;
        if (Rng.NextDouble() < newChance) flags.Add("isNew");
        if (Rng.NextDouble() < 0.06) flags.Add("isFeatured");

        return new Product
        {
            ProductName        = name,
            ProductDescription = Describe(name, genre),
            Genre              = genre,
            Variants           = variants,
            MinPrice           = variants.Min(v => v.Price),
            Rating             = Round1(3.4m + (decimal)Rng.NextDouble() * 1.6m), // 3.4 – 5.0
            Flags              = flags,
            CreatedAt          = DateTime.UtcNow,
            UpdatedAt          = DateTime.UtcNow,
        };
    }

    private static string Describe(string name, string genre)
    {
        var t = GenreTemplates(genre);
        return string.Format(t[Rng.Next(t.Length)], name);
    }

    private static string[] GenreTemplates(string genre) => genre switch
    {
        "RPG" or "Action RPG" or "JRPG" => new[]
        {
            "{0} is a sprawling role-playing adventure full of choice, character growth and discovery.",
            "Level up, build your party and shape your own story in {0}.",
            "{0} blends deep progression systems with a richly realised world to explore.",
        },
        "Shooter" or "FPS" or "Battle Royale" => new[]
        {
            "{0} delivers tight, fast-paced gunplay across explosive set-piece battles.",
            "Aim, flank and outgun your enemies in {0}.",
        },
        "Action Adventure" or "Action" => new[]
        {
            "{0} mixes cinematic action with exploration and memorable set pieces.",
            "Fight, climb and explore your way through the world of {0}.",
        },
        "Racing" => new[]
        {
            "{0} puts you behind the wheel with finely tuned handling and a packed grid.",
            "Master every corner and chase the podium in {0}.",
        },
        "Sports" => new[]
        {
            "{0} brings authentic teams, players and presentation to the game.",
            "Compete season after season in {0}, solo or online.",
        },
        "Strategy" => new[]
        {
            "{0} rewards careful planning, economy management and tactical mastery.",
            "Outthink your rivals and build an empire in {0}.",
        },
        "Fighting" => new[]
        {
            "{0} offers deep, technical one-on-one combat and a roster of iconic fighters.",
        },
        "Survival Horror" or "Horror" => new[]
        {
            "{0} traps you in a tense, atmospheric nightmare where every resource counts.",
        },
        "Platformer" => new[]
        {
            "{0} is a vibrant platformer packed with precise jumps and inventive levels.",
        },
        "Simulation" or "Sandbox" or "Survival" => new[]
        {
            "{0} hands you the tools to build, manage and create at your own pace.",
        },
        "Roguelike" or "Deckbuilder" => new[]
        {
            "{0} delivers moreish run-based gameplay where no two attempts are alike.",
        },
        "Metroidvania" => new[]
        {
            "{0} sends you exploring an interconnected world, unlocking new abilities as you go.",
        },
        "Puzzle" => new[]
        {
            "{0} challenges your mind with clever, escalating puzzles.",
        },
        _ => new[]
        {
            "{0} is a critically acclaimed title beloved by players around the world.",
            "Dive into {0}, a standout entry in its genre.",
        },
    };

    // ── catalogue DSL ────────────────────────────────────────────────────────────
    private static void Add(string genre, Profile profile, Band band, params string[] names)
    {
        foreach (var name in names) Acc.Add(Make(name, genre, profile, band));
    }

    /// <summary>Adds "{prefix}{n}{suffix}" for n in [from, to], n formatted with <paramref name="fmt"/>.</summary>
    private static void Series(string genre, Profile profile, Band band, string prefix, string fmt, int from, int to, string suffix = "")
    {
        for (var n = from; n <= to; n++) Acc.Add(Make(prefix + n.ToString(fmt) + suffix, genre, profile, band));
    }

    private static IReadOnlyList<Product> Build()
    {
        DefineCatalog();
        // Safety net: guarantee unique product names even if a title appears twice above.
        return Acc
            .GroupBy(p => p.ProductName, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();
    }

    private static void DefineCatalog()
    {
        // ── Marquee / acclaimed singles ──────────────────────────────────────────
        Add("Action RPG", Profile.Multi, Band.Recent,
            "Elden Ring", "Cyberpunk 2077", "Hogwarts Legacy", "Lies of P", "Black Myth: Wukong",
            "Dragon's Dogma 2", "Diablo IV", "Path of Exile 2", "Remnant II", "Wo Long: Fallen Dynasty");
        Add("Action RPG", Profile.Multi, Band.Budget,
            "Dark Souls III", "Dark Souls II", "Dark Souls", "Dragon's Dogma: Dark Arisen", "Nioh",
            "Nioh 2", "The Surge", "The Surge 2", "Code Vein", "Mortal Shell", "Thymesia", "Salt and Sacrifice");
        Add("RPG", Profile.Multi, Band.Recent,
            "Baldur's Gate 3", "Starfield", "The Outer Worlds", "Kingdom Come: Deliverance II");
        Add("RPG", Profile.Pc, Band.Mid,
            "Divinity: Original Sin 2", "Divinity: Original Sin", "Pillars of Eternity", "Pillars of Eternity II: Deadfire",
            "Pathfinder: Kingmaker", "Pathfinder: Wrath of the Righteous", "Wasteland 3", "Tyranny",
            "Disco Elysium: The Final Cut", "Planescape: Torment: Enhanced Edition", "Kingdom Come: Deliverance",
            "Greedfall", "ELEX", "ELEX II", "Outward", "Two Worlds II", "Vampyr");

        // ── PlayStation exclusives ───────────────────────────────────────────────
        Add("Action Adventure", Profile.PlayStation, Band.Recent,
            "Marvel's Spider-Man", "Marvel's Spider-Man: Miles Morales", "Marvel's Spider-Man 2",
            "The Last of Us Part I", "The Last of Us Part II Remastered", "Ghost of Tsushima Director's Cut",
            "Days Gone", "Death Stranding", "Death Stranding 2: On the Beach", "Detroit: Become Human",
            "Heavy Rain", "Beyond: Two Souls", "Until Dawn", "Astro Bot", "Rise of the Ronin", "Stellar Blade");
        Add("Action RPG", Profile.PlayStation, Band.Recent,
            "Horizon Zero Dawn", "Horizon Forbidden West", "Demon's Souls", "Bloodborne", "Returnal", "Final Fantasy XVI", "Final Fantasy VII Rebirth");
        Add("Action Adventure", Profile.PlayStation, Band.Mid,
            "God of War III", "God of War: Ascension", "God of War", "God of War Ragnarök",
            "Uncharted: Drake's Fortune", "Uncharted 2: Among Thieves", "Uncharted 3: Drake's Deception",
            "Uncharted 4: A Thief's End", "Uncharted: The Lost Legacy",
            "Ratchet & Clank: A Crack in Time", "Ratchet & Clank: Into the Nexus", "Ratchet & Clank", "Ratchet & Clank: Rift Apart",
            "Sackboy: A Big Adventure", "Gran Turismo Sport", "Gran Turismo 7");

        // ── Xbox / former-Xbox exclusives ────────────────────────────────────────
        Add("Shooter", Profile.Xbox, Band.Mid,
            "Halo: Combat Evolved", "Halo 2", "Halo 3", "Halo 3: ODST", "Halo: Reach", "Halo 4", "Halo 5: Guardians", "Halo Infinite");
        Add("Strategy", Profile.Pc, Band.Mid, "Halo Wars", "Halo Wars 2");
        Add("Shooter", Profile.Xbox, Band.Mid,
            "Gears of War", "Gears of War 2", "Gears of War 3", "Gears of War: Judgment", "Gears of War 4", "Gears 5");
        Add("Action Adventure", Profile.Xbox, Band.Mid,
            "Sea of Thieves", "Grounded", "Pentiment", "Hi-Fi Rush", "Quantum Break");
        Add("Racing", Profile.Xbox, Band.Recent,
            "Forza Motorsport 4", "Forza Motorsport 5", "Forza Motorsport 6", "Forza Motorsport 7", "Forza Motorsport",
            "Forza Horizon", "Forza Horizon 2", "Forza Horizon 3", "Forza Horizon 4", "Forza Horizon 5");

        // ── Nintendo first-party ─────────────────────────────────────────────────
        Add("Action Adventure", Profile.Nintendo, Band.Recent,
            "The Legend of Zelda: Twilight Princess", "The Legend of Zelda: Skyward Sword",
            "The Legend of Zelda: A Link Between Worlds", "The Legend of Zelda: Breath of the Wild",
            "The Legend of Zelda: Tears of the Kingdom", "The Legend of Zelda: Link's Awakening",
            "Hyrule Warriors", "The Legend of Zelda: Echoes of Wisdom");
        Add("Platformer", Profile.Nintendo, Band.Recent,
            "Super Mario Galaxy", "Super Mario Galaxy 2", "New Super Mario Bros. Wii", "Super Mario 3D Land",
            "New Super Mario Bros. U", "Super Mario 3D World", "Super Mario Maker", "Super Mario Maker 2",
            "Super Mario Odyssey", "Super Mario Bros. Wonder", "Yoshi's Crafted World", "Luigi's Mansion 3",
            "Donkey Kong Country: Tropical Freeze", "Donkey Kong Country Returns", "New Super Lucky's Tale");
        Add("Racing", Profile.Nintendo, Band.Recent, "Mario Kart Wii", "Mario Kart 7", "Mario Kart 8", "Mario Kart 8 Deluxe");
        Add("Action", Profile.Nintendo, Band.Mid,
            "Mario Party 9", "Mario Party 10", "Super Mario Party", "Mario Party Superstars",
            "Mario Tennis Aces", "Mario Golf: Super Rush", "Mario Strikers: Battle League",
            "Paper Mario: The Origami King", "Mario + Rabbids Kingdom Battle", "Mario + Rabbids Sparks of Hope", "Super Mario RPG");
        Add("Metroidvania", Profile.Nintendo, Band.Mid,
            "Metroid Prime", "Metroid Prime 2: Echoes", "Metroid Prime 3: Corruption", "Metroid: Samus Returns",
            "Metroid Dread", "Metroid Prime Remastered");
        Add("Platformer", Profile.Nintendo, Band.Mid,
            "Kirby's Return to Dream Land", "Kirby: Triple Deluxe", "Kirby: Planet Robobot", "Kirby Star Allies", "Kirby and the Forgotten Land");
        Add("Fighting", Profile.Nintendo, Band.Recent, "Super Smash Bros. Ultimate");
        Add("RPG", Profile.Nintendo, Band.Recent,
            "Fire Emblem Awakening", "Fire Emblem Fates", "Fire Emblem Echoes: Shadows of Valentia",
            "Fire Emblem: Three Houses", "Fire Emblem Engage", "Fire Emblem Warriors",
            "Xenoblade Chronicles", "Xenoblade Chronicles 2", "Xenoblade Chronicles 3", "Xenoblade Chronicles: Definitive Edition",
            "Octopath Traveler", "Octopath Traveler II", "Bravely Default II", "Triangle Strategy", "Unicorn Overlord");
        Add("Simulation", Profile.Nintendo, Band.Mid, "Animal Crossing: New Horizons", "Pikmin 3 Deluxe", "Pikmin 4");

        // ── Pokémon ──────────────────────────────────────────────────────────────
        Add("JRPG", Profile.Nintendo, Band.Recent,
            "Pokémon Diamond", "Pokémon Pearl", "Pokémon Platinum", "Pokémon Black", "Pokémon White",
            "Pokémon Black 2", "Pokémon White 2", "Pokémon X", "Pokémon Y", "Pokémon Omega Ruby", "Pokémon Alpha Sapphire",
            "Pokémon Sun", "Pokémon Moon", "Pokémon Ultra Sun", "Pokémon Ultra Moon", "Pokémon Sword", "Pokémon Shield",
            "Pokémon Brilliant Diamond", "Pokémon Shining Pearl", "Pokémon Legends: Arceus", "Pokémon Scarlet", "Pokémon Violet",
            "Pokémon Let's Go, Pikachu!", "Pokémon Let's Go, Eevee!");

        // ── Sonic / Mega Man / Crash / Spyro ─────────────────────────────────────
        Add("Platformer", Profile.MultiNintendo, Band.Budget,
            "Sonic Generations", "Sonic Colors", "Sonic Lost World", "Sonic Mania", "Sonic Forces", "Sonic Frontiers", "Sonic Superstars",
            "Mega Man 9", "Mega Man 10", "Mega Man 11", "Mega Man Legacy Collection", "Mega Man X Legacy Collection", "Mega Man Zero/ZX Legacy Collection",
            "Crash Bandicoot N. Sane Trilogy", "Crash Team Racing Nitro-Fueled", "Crash Bandicoot 4: It's About Time", "Spyro Reignited Trilogy",
            "Rayman Legends", "Rayman Origins", "Klonoa Phantasy Reverie Series", "A Hat in Time", "Yooka-Laylee", "Psychonauts 2",
            "Trine 4: The Nightmare Prince", "Trine 5: A Clockwork Conspiracy");

        // ── Call of Duty ─────────────────────────────────────────────────────────
        Add("Shooter", Profile.Multi, Band.Budget,
            "Call of Duty 4: Modern Warfare", "Call of Duty: World at War", "Call of Duty: Modern Warfare 2",
            "Call of Duty: Black Ops", "Call of Duty: Modern Warfare 3", "Call of Duty: Black Ops II",
            "Call of Duty: Ghosts", "Call of Duty: Advanced Warfare", "Call of Duty: Black Ops III",
            "Call of Duty: Infinite Warfare", "Call of Duty: WWII");
        Add("Shooter", Profile.Multi, Band.Recent,
            "Call of Duty: Black Ops 4", "Call of Duty: Modern Warfare", "Call of Duty: Black Ops Cold War",
            "Call of Duty: Vanguard", "Call of Duty: Modern Warfare II", "Call of Duty: Modern Warfare III", "Call of Duty: Black Ops 6");

        // ── Assassin's Creed / Far Cry / Watch Dogs / Ubisoft ────────────────────
        Add("Action Adventure", Profile.Multi, Band.Budget,
            "Assassin's Creed", "Assassin's Creed II", "Assassin's Creed: Brotherhood", "Assassin's Creed: Revelations",
            "Assassin's Creed III", "Assassin's Creed IV: Black Flag", "Assassin's Creed Rogue", "Assassin's Creed Unity",
            "Assassin's Creed Syndicate", "Assassin's Creed Origins", "Assassin's Creed Odyssey");
        Add("Action Adventure", Profile.Multi, Band.Recent,
            "Assassin's Creed Valhalla", "Assassin's Creed Mirage", "Assassin's Creed Shadows", "Star Wars Outlaws");
        Add("Shooter", Profile.Multi, Band.Budget,
            "Far Cry", "Far Cry 2", "Far Cry 3", "Far Cry 4", "Far Cry Primal", "Far Cry 5", "Far Cry New Dawn", "Far Cry 6");
        Add("Action Adventure", Profile.Multi, Band.Mid,
            "Watch Dogs", "Watch Dogs 2", "Watch Dogs: Legion",
            "Tom Clancy's Ghost Recon: Future Soldier", "Tom Clancy's Ghost Recon Wildlands", "Tom Clancy's Ghost Recon Breakpoint",
            "Tom Clancy's The Division", "Tom Clancy's The Division 2", "Immortals Fenyx Rising", "Prince of Persia: The Lost Crown");
        Add("Shooter", Profile.Multi, Band.Mid, "Tom Clancy's Rainbow Six Siege", "Tom Clancy's Rainbow Six Vegas 2", "Tom Clancy's Rainbow Six Extraction");

        // ── Battlefield / DICE / EA shooters ─────────────────────────────────────
        Add("Shooter", Profile.Multi, Band.Budget,
            "Battlefield: Bad Company", "Battlefield: Bad Company 2", "Battlefield 3", "Battlefield 4", "Battlefield Hardline",
            "Battlefield 1", "Battlefield V", "Battlefield 2042",
            "Titanfall", "Titanfall 2", "Star Wars: Battlefront", "Star Wars: Battlefront II", "Star Wars: Squadrons");

        // ── Final Fantasy / Square Enix JRPGs ────────────────────────────────────
        Add("JRPG", Profile.Multi, Band.Mid,
            "Final Fantasy VII", "Final Fantasy VIII", "Final Fantasy IX", "Final Fantasy X/X-2 HD Remaster",
            "Final Fantasy XII: The Zodiac Age", "Final Fantasy XIII", "Final Fantasy XV", "Final Fantasy VII Remake",
            "Dragon Quest XI: Echoes of an Elusive Age", "Dragon Quest Builders 2", "Nier: Automata", "Nier Replicant",
            "Octopath Traveler", "Star Ocean: The Divine Force", "Valkyrie Elysium", "Tactics Ogre: Reborn", "Live A Live");
        Add("JRPG", Profile.Multi, Band.Mid,
            "Persona 3 Reload", "Persona 4 Golden", "Persona 5", "Persona 5 Royal", "Persona 5 Strikers",
            "Tales of Symphonia", "Tales of Vesperia: Definitive Edition", "Tales of Graces f", "Tales of Xillia",
            "Tales of Zestiria", "Tales of Berseria", "Tales of Arise",
            "Ys VIII: Lacrimosa of Dana", "Ys IX: Monstrum Nox", "The Legend of Heroes: Trails of Cold Steel",
            "The Legend of Heroes: Trails of Cold Steel II", "The Legend of Heroes: Trails into Reverie", "The Legend of Heroes: Trails through Daybreak",
            "Ni no Kuni II: Revenant Kingdom", "Scarlet Nexus", "Atelier Ryza", "Atelier Ryza 2", "Atelier Ryza 3",
            "Granblue Fantasy: Relink", "Chained Echoes", "CrossCode", "Sea of Stars", "Eiyuden Chronicle: Hundred Heroes");

        // ── Resident Evil / Silent Hill / horror ─────────────────────────────────
        Add("Survival Horror", Profile.Multi, Band.Mid,
            "Resident Evil 4", "Resident Evil 5", "Resident Evil 6", "Resident Evil 7: Biohazard",
            "Resident Evil 2", "Resident Evil 3", "Resident Evil Village", "Resident Evil 4 Remake",
            "Resident Evil Revelations", "Resident Evil Revelations 2",
            "Silent Hill 2", "Silent Hill 3", "Silent Hill: Homecoming", "Silent Hill: Downpour",
            "The Evil Within", "The Evil Within 2", "Alien: Isolation", "The Callisto Protocol", "Dead Space",
            "Dead Space 2", "Dead Space 3");
        Add("Horror", Profile.Multi, Band.Budget,
            "Outlast", "Outlast 2", "The Outlast Trials", "Amnesia: The Dark Descent", "Amnesia: Rebirth", "Amnesia: The Bunker",
            "SOMA", "Layers of Fear", "Visage", "The Medium", "Observer", "The Quarry", "The Dark Pictures Anthology: Man of Medan",
            "Dead by Daylight", "World War Z");
        Add("Action", Profile.Multi, Band.Mid,
            "Dying Light", "Dying Light 2 Stay Human", "State of Decay 2", "Ghostwire: Tokyo", "Atomic Heart",
            "A Plague Tale: Innocence", "A Plague Tale: Requiem", "Robocop: Rogue City");

        // ── Fighting games ───────────────────────────────────────────────────────
        Add("Fighting", Profile.Multi, Band.Mid,
            "Tekken 5", "Tekken 6", "Tekken 7", "Tekken 8", "Tekken Tag Tournament 2",
            "Street Fighter IV", "Super Street Fighter IV", "Street Fighter V", "Street Fighter 6",
            "Mortal Kombat 9", "Mortal Kombat X", "Mortal Kombat 11", "Mortal Kombat 1",
            "Injustice: Gods Among Us", "Injustice 2", "Guilty Gear Strive", "The King of Fighters XV",
            "Dragon Ball FighterZ", "Soulcalibur VI", "Ultimate Marvel vs. Capcom 3", "BlazBlue: Cross Tag Battle", "Granblue Fantasy Versus: Rising");

        // ── Tomb Raider / Hitman / stealth ───────────────────────────────────────
        Add("Action Adventure", Profile.Multi, Band.Budget,
            "Tomb Raider: Legend", "Tomb Raider: Anniversary", "Tomb Raider: Underworld", "Tomb Raider",
            "Rise of the Tomb Raider", "Shadow of the Tomb Raider",
            "Hitman: Blood Money", "Hitman: Absolution", "Hitman", "Hitman 2", "Hitman 3",
            "Tom Clancy's Splinter Cell: Chaos Theory", "Tom Clancy's Splinter Cell: Conviction", "Tom Clancy's Splinter Cell: Blacklist",
            "Sniper Elite 4", "Sniper Elite 5", "Sniper Ghost Warrior Contracts",
            "Sleeping Dogs: Definitive Edition", "Mafia II: Definitive Edition", "Mafia III: Definitive Edition", "Mafia: Definitive Edition",
            "Just Cause 3", "Just Cause 4", "Max Payne 3", "L.A. Noire");

        // ── Total War / Civ / grand strategy / 4X (PC) ───────────────────────────
        Add("Strategy", Profile.Pc, Band.Mid,
            "Total War: Shogun 2", "Total War: Rome II", "Total War: Attila", "Total War: Warhammer",
            "Total War: Warhammer II", "Total War: Three Kingdoms", "Total War: Warhammer III", "Total War: Pharaoh",
            "Sid Meier's Civilization IV", "Sid Meier's Civilization V", "Sid Meier's Civilization VI", "Sid Meier's Civilization VII",
            "Crusader Kings II", "Crusader Kings III", "Europa Universalis IV", "Hearts of Iron IV", "Stellaris", "Victoria 3",
            "Age of Empires II: Definitive Edition", "Age of Empires III: Definitive Edition", "Age of Empires IV",
            "Company of Heroes 2", "Company of Heroes 3", "StarCraft II: Wings of Liberty",
            "XCOM: Enemy Unknown", "XCOM 2", "Gears Tactics", "Marvel's Midnight Suns", "Phoenix Point", "BattleTech",
            "Wargroove", "Into the Breach", "Desperados III", "Shadow Tactics: Blades of the Shogun", "They Are Billions",
            "Northgard", "Iron Harvest", "Mount & Blade II: Bannerlord", "Mount & Blade: Warband");

        // ── Bethesda RPGs / immersive sims / shooters ────────────────────────────
        Add("RPG", Profile.Multi, Band.Mid,
            "The Elder Scrolls IV: Oblivion", "The Elder Scrolls V: Skyrim Special Edition", "The Elder Scrolls Online",
            "Fallout 3", "Fallout: New Vegas", "Fallout 4", "Fallout 76");
        Add("Shooter", Profile.Multi, Band.Mid,
            "Doom", "Doom Eternal", "Rage 2", "Wolfenstein: The New Order", "Wolfenstein: The Old Blood",
            "Wolfenstein II: The New Colossus", "Wolfenstein: Youngblood",
            "BioShock", "BioShock 2", "BioShock Infinite", "Prey", "Dishonored", "Dishonored 2",
            "Dishonored: Death of the Outsider", "Deathloop",
            "Metro 2033 Redux", "Metro: Last Light Redux", "Metro Exodus",
            "Crysis Remastered", "Crysis 2 Remastered", "Crysis 3 Remastered",
            "Half-Life 2", "Half-Life: Alyx", "Portal", "Portal 2", "Left 4 Dead 2", "Team Fortress 2");

        // ── Rockstar / open-world crime ──────────────────────────────────────────
        Add("Action Adventure", Profile.Multi, Band.Mid,
            "Grand Theft Auto: San Andreas", "Grand Theft Auto: Vice City", "Grand Theft Auto III",
            "Grand Theft Auto IV", "Grand Theft Auto V", "Red Dead Redemption", "Red Dead Redemption 2", "Bully: Scholarship Edition",
            "Saints Row 2", "Saints Row: The Third", "Saints Row IV", "Saints Row");

        // ── Yakuza / Like a Dragon / Sega ────────────────────────────────────────
        Add("Action RPG", Profile.Multi, Band.Mid,
            "Yakuza 0", "Yakuza Kiwami", "Yakuza Kiwami 2", "Yakuza 3 Remastered", "Yakuza 4 Remastered",
            "Yakuza 5 Remastered", "Yakuza 6: The Song of Life", "Yakuza: Like a Dragon", "Like a Dragon: Ishin!",
            "Like a Dragon Gaiden: The Man Who Erased His Name", "Like a Dragon: Infinite Wealth", "Judgment", "Lost Judgment");

        // ── Metal Gear / Devil May Cry / Capcom action ───────────────────────────
        Add("Action", Profile.Multi, Band.Budget,
            "Metal Gear Solid 3: Snake Eater", "Metal Gear Solid 4: Guns of the Patriots",
            "Metal Gear Solid V: Ground Zeroes", "Metal Gear Solid V: The Phantom Pain", "Metal Gear Rising: Revengeance",
            "Devil May Cry 4", "DmC: Devil May Cry", "Devil May Cry 5", "Bayonetta", "Bayonetta 2", "Bayonetta 3",
            "Monster Hunter: World", "Monster Hunter Rise", "Monster Hunter Generations Ultimate", "Monster Hunter Wilds", "Monster Hunter Stories 2");

        // ── Borderlands / Diablo / looters ───────────────────────────────────────
        Add("Shooter", Profile.Multi, Band.Mid,
            "Borderlands", "Borderlands 2", "Borderlands: The Pre-Sequel", "Borderlands 3", "Tiny Tina's Wonderlands",
            "Destiny 2", "Warframe", "The First Descendant");
        Add("Action RPG", Profile.Multi, Band.Mid,
            "Diablo II: Resurrected", "Diablo III", "Path of Exile", "Torchlight II", "Grim Dawn",
            "Last Epoch", "Wolcen: Lords of Mayhem", "Victor Vran");

        // ── BioWare / sci-fi RPGs ────────────────────────────────────────────────
        Add("Action RPG", Profile.Multi, Band.Mid,
            "Mass Effect", "Mass Effect 2", "Mass Effect 3", "Mass Effect: Andromeda", "Mass Effect Legendary Edition",
            "Dragon Age: Origins", "Dragon Age II", "Dragon Age: Inquisition", "Dragon Age: The Veilguard",
            "Star Wars: Knights of the Old Republic", "Star Wars Jedi: Fallen Order", "Star Wars Jedi: Survivor", "Anthem");

        // ── Kingdom Hearts ───────────────────────────────────────────────────────
        Add("Action RPG", Profile.Multi, Band.Mid,
            "Kingdom Hearts", "Kingdom Hearts II", "Kingdom Hearts III", "Kingdom Hearts: Birth by Sleep", "Kingdom Hearts: Dream Drop Distance");

        // ── Remedy / narrative action ────────────────────────────────────────────
        Add("Action Adventure", Profile.Multi, Band.Recent, "Control Ultimate Edition", "Alan Wake Remastered", "Alan Wake 2");

        // ── LEGO games ───────────────────────────────────────────────────────────
        Add("Action Adventure", Profile.MultiNintendo, Band.Budget,
            "LEGO Star Wars: The Complete Saga", "LEGO Batman: The Videogame", "LEGO Harry Potter: Years 1-4",
            "LEGO Marvel Super Heroes", "LEGO The Hobbit", "LEGO Jurassic World", "LEGO Dimensions", "LEGO Marvel's Avengers",
            "LEGO City Undercover", "LEGO Worlds", "LEGO The Incredibles", "LEGO DC Super-Villains",
            "LEGO Star Wars: The Skywalker Saga", "LEGO 2K Drive", "LEGO Brawls");

        // ── Indies & smaller standouts ───────────────────────────────────────────
        Add("Metroidvania", Profile.MultiNintendo, Band.Budget,
            "Hollow Knight", "Ori and the Blind Forest", "Ori and the Will of the Wisps", "Blasphemous", "Blasphemous II",
            "Axiom Verge", "Axiom Verge 2", "The Messenger", "Bloodstained: Ritual of the Night", "Guacamelee! 2",
            "Carrion", "Death's Door", "Tunic", "Islets", "Prince of Persia: The Lost Crown");
        Add("Roguelike", Profile.MultiNintendo, Band.Budget,
            "Hades", "Hades II", "Dead Cells", "Slay the Spire", "Balatro", "Vampire Survivors", "Risk of Rain 2",
            "Enter the Gungeon", "The Binding of Isaac: Rebirth", "Spelunky 2", "Cult of the Lamb", "Inscryption",
            "Loop Hero", "Monster Train", "Dicey Dungeons", "Noita", "Nuclear Throne", "Crypt of the NecroDancer",
            "Wildermyth", "Griftlands", "Skul: The Hero Slayer", "Rogue Legacy 2", "Hyper Light Drifter", "Katana ZERO");
        Add("Platformer", Profile.MultiNintendo, Band.Budget,
            "Celeste", "Cuphead", "Shovel Knight: Treasure Trove", "Pizza Tower", "Owlboy", "Iconoclasts",
            "The End Is Nigh", "Super Meat Boy", "Super Meat Boy Forever", "Hollow Knight: Voidheart Edition",
            "Gris", "Planet of Lana", "Cocoon", "Animal Well", "Ufouria: The Saga 2");
        Add("Action Adventure", Profile.MultiNintendo, Band.Budget,
            "Stray", "Inside", "Limbo", "Little Nightmares", "Little Nightmares II", "Brothers: A Tale of Two Sons",
            "Unravel", "Unravel Two", "It Takes Two", "A Way Out", "Hotline Miami", "Hotline Miami 2: Wrong Number",
            "Bastion", "Transistor", "Pyre", "Sayonara Wild Hearts", "Neon White");
        Add("Puzzle", Profile.MultiNintendo, Band.Budget,
            "The Witness", "Baba Is You", "The Talos Principle", "The Talos Principle 2", "Superliminal",
            "Tetris Effect: Connected", "Puyo Puyo Tetris 2", "Lumines Remastered", "Untitled Goose Game",
            "Human: Fall Flat", "Poly Bridge 2", "Opus Magnum", "Return of the Obra Dinn", "Manifold Garden",
            "Viewfinder", "The Room", "Patrick's Parabox", "Cocoon");
        Add("RPG", Profile.MultiNintendo, Band.Budget,
            "Undertale", "Deltarune", "Outer Wilds", "Disco Elysium", "Citizen Sleeper", "Roadwarden",
            "Wildermyth", "Stardew Valley", "Moonlighter", "Littlewood");

        // ── Sandbox / survival / sim ─────────────────────────────────────────────
        Add("Sandbox", Profile.MultiNintendo, Band.Budget, "Minecraft", "Minecraft Dungeons", "Minecraft Legends", "Terraria", "Core Keeper", "Dyson Sphere Program");
        Add("Survival", Profile.Multi, Band.Mid,
            "Valheim", "Subnautica", "Subnautica: Below Zero", "Raft", "The Forest", "Sons of the Forest", "Green Hell",
            "Rust", "ARK: Survival Evolved", "ARK: Survival Ascended", "7 Days to Die", "Don't Starve Together",
            "Astroneer", "No Man's Sky", "Conan Exiles", "V Rising", "Palworld", "Enshrouded", "Grounded", "Icarus", "The Long Dark");
        Add("Simulation", Profile.Pc, Band.Mid,
            "Satisfactory", "Factorio", "Oxygen Not Included", "RimWorld", "Prison Architect", "Kerbal Space Program",
            "Kerbal Space Program 2", "Surviving Mars", "Frostpunk", "Frostpunk 2", "Manor Lords", "Against the Storm",
            "Timberborn", "Cities: Skylines", "Cities: Skylines II", "SimCity", "Planet Coaster", "Planet Zoo",
            "Tropico 6", "Anno 1800", "Two Point Hospital", "Two Point Campus", "RollerCoaster Tycoon 3",
            "The Sims 2", "The Sims 3", "The Sims 4", "Farming Simulator 22", "Euro Truck Simulator 2", "American Truck Simulator",
            "Microsoft Flight Simulator", "House Flipper", "PowerWash Simulator");

        // ── Co-op / party / multiplayer ──────────────────────────────────────────
        Add("Action", Profile.MultiNintendo, Band.Budget,
            "Overcooked", "Overcooked 2", "Moving Out", "Moving Out 2", "Among Us", "Fall Guys",
            "Phasmophobia", "Lethal Company", "Goat Simulator 3");
        Add("Shooter", Profile.Multi, Band.Mid,
            "Deep Rock Galactic", "Helldivers 2", "Back 4 Blood", "Killing Floor 2", "Payday 2", "Payday 3", "GTFO",
            "Warhammer: Vermintide 2", "Warhammer 40,000: Darktide", "Warhammer 40,000: Space Marine 2", "Warhammer 40,000: Space Marine",
            "Insurgency: Sandstorm", "Hunt: Showdown 1896", "Ready or Not", "Squad", "Hell Let Loose", "The Finals");

        // ── Racing (broad) ───────────────────────────────────────────────────────
        Add("Racing", Profile.Multi, Band.Mid,
            "Need for Speed: Most Wanted", "Need for Speed: Hot Pursuit", "Need for Speed: The Run", "Need for Speed: Rivals",
            "Need for Speed", "Need for Speed: Payback", "Need for Speed: Heat", "Need for Speed Unbound",
            "DiRT Rally", "DiRT Rally 2.0", "DiRT 5", "Project CARS", "Project CARS 2", "Project CARS 3",
            "WRC 10", "EA Sports WRC", "Burnout Paradise Remastered", "Trackmania", "The Crew", "The Crew 2", "The Crew Motorfest",
            "Wreckfest", "MotoGP 23", "RIDE 5", "Assetto Corsa", "Assetto Corsa Competizione", "Gran Turismo 4", "Gran Turismo 5", "Gran Turismo 6");

        // ── Annual sports series ─────────────────────────────────────────────────
        Series("Sports", Profile.MultiNintendo, Band.Mid, "FIFA ", "D2", 10, 23);
        Add("Sports", Profile.MultiNintendo, Band.Recent, "EA Sports FC 24", "EA Sports FC 25");
        Series("Sports", Profile.Multi, Band.Mid, "Madden NFL ", "D2", 10, 25);
        Series("Sports", Profile.MultiNintendo, Band.Mid, "NBA 2K", "D2", 14, 25);
        Add("Sports", Profile.Multi, Band.Budget, "NBA Live 18", "NBA Live 19");
        Series("Sports", Profile.MultiNintendo, Band.Mid, "NHL ", "D2", 15, 25);
        Series("Sports", Profile.PlayStation, Band.Mid, "MLB The Show ", "D2", 16, 24);
        Add("Sports", Profile.MultiNintendo, Band.Mid,
            "WWE 2K15", "WWE 2K16", "WWE 2K17", "WWE 2K18", "WWE 2K19", "WWE 2K20", "WWE 2K22", "WWE 2K23", "WWE 2K24", "WWE 2K25");
        Add("Sports", Profile.Multi, Band.Mid, "PGA Tour 2K21", "PGA Tour 2K23", "EA Sports PGA Tour");
        Add("Racing", Profile.Multi, Band.Recent,
            "F1 2017", "F1 2018", "F1 2019", "F1 2020", "F1 2021", "F1 22", "F1 23", "F1 24");
        Add("Sports", Profile.Pc, Band.Mid,
            "Football Manager 2020", "Football Manager 2021", "Football Manager 2022", "Football Manager 2023", "Football Manager 2024");
        Add("Sports", Profile.Multi, Band.Budget,
            "Pro Evolution Soccer 2017", "Pro Evolution Soccer 2018", "Pro Evolution Soccer 2019", "Pro Evolution Soccer 2020", "Pro Evolution Soccer 2021", "eFootball 2024");
        Add("Sports", Profile.MultiNintendo, Band.Mid, "Rocket League", "Tony Hawk's Pro Skater 1 + 2", "Skate 3");
        Series("Sports", Profile.MultiNintendo, Band.Budget, "Just Dance ", "0", 2017, 2024);

        // ── Free-to-play / live shooters ─────────────────────────────────────────
        Add("Battle Royale", Profile.Multi, Band.Free, "Apex Legends", "Fortnite", "Counter-Strike 2", "PUBG: Battlegrounds", "Warframe", "Marvel Rivals");

        // ── Remaining acclaimed AAA singles ──────────────────────────────────────
        Add("Action RPG", Profile.Multi, Band.Mid,
            "The Witcher 3: Wild Hunt", "The Witcher 2: Assassins of Kings", "Sekiro: Shadows Die Twice",
            "Ghostrunner", "Ghostrunner 2", "Stranger of Paradise: Final Fantasy Origin", "Steelrising", "Lords of the Fallen");
        Add("Shooter", Profile.Multi, Band.Mid, "DOOM Eternal", "Quake", "Quake II", "Serious Sam 4", "Shadow Warrior 3");
        Add("Action Adventure", Profile.Multi, Band.Mid,
            "Sifu", "Sniper Elite: Resistance", "Star Wars: The Force Unleashed", "Indiana Jones and the Great Circle",
            "Avatar: Frontiers of Pandora", "Tales of Kenzera: Zau", "Banishers: Ghosts of New Eden", "Senua's Saga: Hellblade II", "Hellblade: Senua's Sacrifice");

        // ── Current-gen flagships (full-price "New" tier) ────────────────────────
        Add("Action RPG", Profile.Multi, Band.New,
            "Avowed", "Clair Obscur: Expedition 33", "Kingdom Come: Deliverance II", "Khazan: The First Berserker", "The First Berserker: Khazan");
        Add("Action Adventure", Profile.Multi, Band.New,
            "Doom: The Dark Ages", "Mafia: The Old Country", "South of Midnight", "Atomfall", "Ninja Gaiden 4", "Fable");
        Add("Action Adventure", Profile.PlayStation, Band.New, "Death Stranding 2: On the Beach", "Ghost of Yōtei", "Marvel's Wolverine");
        Add("Action RPG", Profile.Multi, Band.New, "Monster Hunter Wilds", "Dragon Age: The Veilguard", "Final Fantasy VII Rebirth");

        // ── Wave 2: narrative / atmospheric indies ───────────────────────────────
        Add("Action Adventure", Profile.Multi, Band.Budget,
            "Firewatch", "What Remains of Edith Finch", "Gone Home", "Oxenfree", "Oxenfree II: Lost Signals",
            "Night in the Woods", "Spiritfarer", "A Short Hike", "Donut County", "Unpacking", "Sable",
            "The Pathless", "Abzû", "Journey", "Hob", "Solar Ash", "Kena: Bridge of Spirits", "Immortality",
            "Twelve Minutes", "As Dusk Falls", "The Forgotten City", "Eastward", "Chants of Sennaar",
            "The Case of the Golden Idol", "Pentiment", "Norco", "Citizen Sleeper 2: Starward Vector", "1000xRESIST");
        Add("Puzzle", Profile.Multi, Band.Budget,
            "Dorfromantik", "Mini Metro", "Mini Motorways", "Islanders", "Townscaper", "Terra Nil",
            "Patrick's Parabox", "Lorelei and the Laser Eyes", "Cocoon", "The Talos Principle: Reawakened", "Botany Manor");

        // ── Wave 2: classic / legacy PC ──────────────────────────────────────────
        Add("Shooter", Profile.Pc, Band.Budget,
            "Half-Life", "Counter-Strike: Source", "Counter-Strike: Global Offensive", "Day of Defeat: Source",
            "Garry's Mod", "Deus Ex: Game of the Year Edition", "Deus Ex: Human Revolution - Director's Cut",
            "Deus Ex: Mankind Divided", "System Shock", "System Shock 2", "Thief: Deadly Shadows",
            "Quake III Arena", "Unreal Tournament", "Painkiller", "F.E.A.R.", "S.T.A.L.K.E.R.: Shadow of Chernobyl",
            "S.T.A.L.K.E.R. 2: Heart of Chornobyl");
        Add("RPG", Profile.Pc, Band.Budget,
            "Vampire: The Masquerade - Bloodlines", "Baldur's Gate: Enhanced Edition", "Baldur's Gate II: Enhanced Edition",
            "Icewind Dale: Enhanced Edition", "Neverwinter Nights: Enhanced Edition", "Arcanum: Of Steamworks and Magick Obscura",
            "Gothic", "Gothic II: Gold Edition", "Risen", "The Bard's Tale IV: Barrows Deep", "Solasta: Crown of the Magister",
            "Wartales", "Black Geyser: Couriers of Darkness", "Colony Ship");
        Add("Strategy", Profile.Pc, Band.Budget,
            "Warcraft III: Reforged", "StarCraft: Remastered", "Age of Mythology: Retold", "Command & Conquer Remastered Collection",
            "Homeworld 3", "Homeworld Remastered Collection", "Dune: Spice Wars", "Star Wars: Empire at War - Gold Pack",
            "Supreme Commander: Forged Alliance", "Sins of a Solar Empire: Rebellion", "Galactic Civilizations III",
            "Endless Space 2", "Endless Legend", "Humankind", "Old World", "Knights of Honor II: Sovereign");

        // ── Wave 2: anime / extended JRPG ────────────────────────────────────────
        Add("Fighting", Profile.Multi, Band.Mid,
            "Dragon Ball Z: Kakarot", "Dragon Ball: Sparking! Zero", "Naruto Shippuden: Ultimate Ninja Storm 4",
            "Naruto x Boruto Ultimate Ninja Storm Connections", "My Hero One's Justice 2", "Jujutsu Kaisen Cursed Clash",
            "Sword Art Online: Last Recollection", "Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles 2");
        Add("JRPG", Profile.Multi, Band.Mid,
            "One Piece Odyssey", "One Piece: Pirate Warriors 4", "Shin Megami Tensei V: Vengeance", "Soul Hackers 2",
            "13 Sentinels: Aegis Rim", "Astral Chain", "Digimon Story: Cyber Sleuth", "Digimon Survive",
            "Disgaea 5 Complete", "Disgaea 6: Defiance of Destiny", "The Legend of Heroes: Trails of Cold Steel III",
            "The Legend of Heroes: Trails of Cold Steel IV", "The Legend of Heroes: Trails from Zero",
            "The Legend of Heroes: Trails to Azure", "Atelier Sophie 2", "Fuga: Melodies of Steel", "Fuga: Melodies of Steel 2");

        // ── Wave 2: metroidvania / platformer ────────────────────────────────────
        Add("Metroidvania", Profile.Multi, Band.Budget,
            "Ender Lilies: Quietus of the Knights", "Ender Magnolia: Bloom in the Mist", "Grime", "Afterimage", "Nine Sols",
            "Aeterna Noctis", "Vigil: The Longest Night", "Record of Lodoss War: Deedlit in Wonder Labyrinth",
            "Gato Roboto", "Yoku's Island Express", "SteamWorld Dig 2", "Timespinner", "Momodora: Reverie Under the Moonlight",
            "Momodora: Moonlit Farewell", "Souldiers", "The Last Faith", "Bo: Path of the Teal Lotus", "Prince of Persia: The Lost Crown");
        Add("Platformer", Profile.Multi, Band.Budget,
            "Rayman Origins", "The End Is Nigh", "Super Meat Boy Forever", "Spelunky", "Spelunky 2", "Pseudoregalia",
            "Lunistasis", "Penny's Big Breakaway", "Astro's Playroom");

        // ── Wave 2: boomer shooters / action ─────────────────────────────────────
        Add("Shooter", Profile.Multi, Band.Budget,
            "Halo: The Master Chief Collection", "Severed Steel", "Roboquest", "Gunfire Reborn", "Turbo Overkill",
            "Ultrakill", "Dusk", "Amid Evil", "Prodeus", "Selaco", "Trepang2", "Project Warlock", "Sprawl", "Warhammer 40,000: Boltgun");

        // ── Wave 2: racing / driving ─────────────────────────────────────────────
        Add("Racing", Profile.Multi, Band.Budget,
            "GRID", "GRID Legends", "GRID Autosport", "Art of Rally", "Hot Wheels Unleashed", "Hot Wheels Unleashed 2",
            "BeamNG.drive", "Automobilista 2", "Wreckfest 2", "MXGP 2021", "Monster Energy Supercross 6",
            "TrackMania Turbo", "FlatOut 2", "Forza Horizon 4 Standard Edition");

        // ── Wave 2: strategy / management deepening ───────────────────────────────
        Add("Strategy", Profile.Pc, Band.Mid,
            "Warhammer 40,000: Gladius - Relics of War", "Warhammer 40,000: Mechanicus", "Warhammer 40,000: Rogue Trader",
            "Warhammer Age of Sigmar: Realms of Ruin", "Battle Brothers", "Songs of Conquest", "Terra Invicta",
            "Unity of Command II", "Panzer Corps 2", "Field of Glory II", "Shadow Empire", "Distant Worlds 2",
            "Star Trek: Infinite", "Workers & Resources: Soviet Republic", "Foundation", "Going Medieval",
            "Farthest Frontier", "Dwarf Fortress", "Songs of Syx", "Mad Games Tycoon 2", "Game Dev Tycoon", "Software Inc.");
        Add("Simulation", Profile.Pc, Band.Budget,
            "Cooking Simulator", "PC Building Simulator", "Car Mechanic Simulator 2021", "Train Sim World 4",
            "Transport Fever 2", "Big Ambitions", "Supermarket Simulator", "Gas Station Simulator", "Lawn Mowing Simulator",
            "House Flipper 2", "Hardspace: Shipbreaker", "Dyson Sphere Program", "Shapez 2", "Plan B: Terraform");

        // ── Wave 2: horror deepening ─────────────────────────────────────────────
        Add("Horror", Profile.Multi, Band.Budget,
            "Devour", "The Mortuary Assistant", "MADiSON", "Fobia: St. Dinfna Hotel", "Pacify", "Dark Deception",
            "Poppy Playtime", "In Sound Mind", "Tormented Souls", "Signalis", "Crow Country", "The Casting of Frank Stone",
            "Still Wakes the Deep", "Buckshot Roulette", "Mouthwashing", "Fears to Fathom: Home Alone", "Pacific Drive");

        // ── Wave 2: fighting / party platform fighters ───────────────────────────
        Add("Fighting", Profile.Multi, Band.Budget,
            "Them's Fightin' Herds", "Skullgirls 2nd Encore", "Under Night In-Birth II Sys:Celes", "Melty Blood: Type Lumina",
            "DNF Duel", "Power Rangers: Battle for the Grid", "Nickelodeon All-Star Brawl 2", "MultiVersus", "Brawlhalla",
            "Rivals of Aether", "Rivals of Aether II", "Garou: Mark of the Wolves", "Fatal Fury: City of the Wolves",
            "Virtua Fighter 5: Ultimate Showdown", "Dead or Alive 6");

        // ── Wave 2: open-world / action-adventure legacy ─────────────────────────
        Add("Action Adventure", Profile.Multi, Band.Budget,
            "Mad Max", "Prototype", "Prototype 2", "The Saboteur", "Sunset Overdrive", "Enslaved: Odyssey to the West",
            "Remember Me", "Beyond Good and Evil 20th Anniversary Edition", "Darksiders Warmastered Edition",
            "Darksiders II Deathinitive Edition", "Darksiders III", "Darksiders Genesis", "Psychonauts", "Brutal Legend",
            "Sleeping Dogs: Definitive Edition", "Gravity Rush Remastered", "Gravity Rush 2", "inFamous Second Son",
            "Spider-Man: Shattered Dimensions", "The Wonderful 101: Remastered");

        // ── Wave 2: co-op / roguelite deepening ──────────────────────────────────
        Add("Roguelike", Profile.Multi, Band.Budget,
            "Curse of the Dead Gods", "Children of Morta", "Have a Nice Death", "ScourgeBringer", "Rogue Legacy",
            "Returnal"  /* note: also PS; dedup keeps first */, "Streets of Rogue", "Streets of Rogue 2", "Caves of Qud",
            "Synthetik 2", "Brotato", "20 Minutes Till Dawn", "Halls of Torment", "Death Must Die", "Backpack Hero",
            "Wildfrost", "Shogun Showdown", "Astrea: Six-Sided Oracles", "Slice & Dice");
        Add("Action", Profile.Multi, Band.Budget,
            "Overcooked! All You Can Eat", "Castle Crashers", "BattleBlock Theater", "Pummel Party", "Gang Beasts",
            "Ultimate Chicken Horse", "Stick Fight: The Game", "Tricky Towers", "Helldivers", "Risk of Rain Returns",
            "Magicka 2", "Cuisineer", "Spirittea", "PlateUp!");
    }
}
