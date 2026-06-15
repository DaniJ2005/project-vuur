using Microsoft.Extensions.Configuration;

namespace Vuur.Api.Config;

public class EnvironmentVariables
{
  private readonly IConfiguration _config;
  private readonly List<string> _errors = new();

  public string PostgresHost { get; }
  public string PostgresPort { get; }
  public string PostgresDb { get; }
  public string PostgresUser { get; }
  public string PostgresPassword { get; }

  public string MongoUser { get; }
  public string MongoPassword { get; }
  public string MongoHost { get; }
  public string MongoPort { get; }
  public string RedisPassword { get; }

  public string JwtSecret { get; }
  public string JwtIssuer { get; }
  public int JwtAccessTokenMinutes { get; }
  public int JwtRefreshTokenDays { get; }

  // Optional: alleen nodig in dev (Vite op 5173 naar API op 5245 = cross-origin).
  // In productie loopt alles via dezelfde nginx reverse proxy (same-origin),
  // dus daar mag deze variable leeg blijven.
  public string? CorsFrontendOrigin { get; }

  // Swagger aan of uitzetten
  public bool EnableSwagger { get; }

  public string AdminPassword { get; }
  public string AdminEmail { get; }

  // New role-based fields — all optional, app picks whichever is set
  public string? PostgresAdminUser  { get; init; }
  public string? PostgresAdminPassword  { get; init; }
  public string? PostgresDevUser  { get; init; }
  public string? PostgresDevPassword  { get; init; }
  public string? PostgresSupportUser  { get; init; }
  public string? PostgresSupportPassword  { get; init; }
  public string? PostgresReadonlyUser { get; init; }
  public string? PostgresReadonlyPassword { get; init; }

  public EnvironmentVariables(IConfiguration config)
  {
    // IConfiguration injecten om variables uit .env te halen
    _config = config;

    // Postgres Vars
    PostgresHost = Required("POSTGRES_HOST");
    PostgresPort = Required("POSTGRES_PORT");
    PostgresDb = Required("POSTGRES_DB");
    PostgresUser = Required("POSTGRES_USER");
    PostgresPassword = Required("POSTGRES_PASSWORD");

    // Mongo Vars
    MongoUser = Required("MONGO_USER");
    MongoPassword = Required("MONGO_PASSWORD");
    MongoHost = Required("MONGO_HOST");
    MongoPort = Required("MONGO_PORT");

    // Redis Vars
    RedisPassword = Required("REDIS_PASSWORD");

    // JWT Vars
    JwtSecret = Required("JWT_SECRET");
    JwtIssuer = Required("JWT_ISSUER");
    JwtAccessTokenMinutes = RequiredInt("JWT_ACCESS_TOKEN_MINUTES");
    JwtRefreshTokenDays = RequiredInt("JWT_REFRESH_TOKEN_DAYS");

    // Cors Var (optional), leeg laten in productie als alles via dezelfde nginx reverse proxy loopt
    CorsFrontendOrigin = Optional("CORS_FRONTEND_ORIGIN");

    // Swagger aan of uit zetten
    EnableSwagger = RequiredBool("ENABLE_SWAGGER");

    //Admin account
    AdminPassword = Required("ADMIN_PASSWORD");
    AdminEmail = Required("ADMIN_EMAIL");

    PostgresAdminUser        = Optional("POSTGRES_ADMIN_USER");
    PostgresAdminPassword    = Optional("POSTGRES_ADMIN_PASSWORD");
    PostgresDevUser          = Optional("POSTGRES_DEV_USER");
    PostgresDevPassword      = Optional("POSTGRES_DEV_PASSWORD");
    PostgresSupportUser      = Optional("POSTGRES_SUPPORT_USER");
    PostgresSupportPassword  = Optional("POSTGRES_SUPPORT_PASSWORD");
    PostgresReadonlyUser     = Optional("POSTGRES_READONLY_USER");
    PostgresReadonlyPassword = Optional("POSTGRES_READONLY_PASSWORD");

    // Gebruiken voor debuggen om te checken of env vars goed geladen zijn
    PrintEnvironmentVariables();

    // Early return als alle enviroment variables geldig zijn
    if (_errors.Count == 0) return;

    // Anders een exception gooien met alle gevonden problemen
    throw new InvalidOperationException(
        $"Environment configuration is invalid ({_errors.Count} problem(s)):\n" +
        string.Join("\n", _errors.Select(e => $"  - {e}")));
  }

  private string Required(string key)
  {
    var raw = _config[key];
    if (string.IsNullOrWhiteSpace(raw))
    {
      _errors.Add($"{key} is missing");
      return string.Empty;
    }
    return raw;
  }

  private bool RequiredBool(string key)
  {
      var raw = _config[key];

      if (string.IsNullOrWhiteSpace(raw))
      {
          _errors.Add($"{key} is missing");
          return false;
      }

      if (!bool.TryParse(raw, out var value))
      {
          _errors.Add($"{key} is not a valid boolean");
          return false;
      }

      return value;
  }

  // Voor variables die optioneel zijn — null als ze ontbreken,
  // geen entry in _errors, dus geen exception.
  private string? Optional(string key)
  {
    var raw = _config[key];
    return string.IsNullOrWhiteSpace(raw) ? null : raw;
  }

  private int RequiredInt(string key)
  {
    var raw = _config[key];
    if (string.IsNullOrWhiteSpace(raw))
    {
      _errors.Add($"{key} is missing");
      return 0;
    }
    if (!int.TryParse(raw, out var value))
    {
      _errors.Add($"{key} is not a valid integer (got: '{raw}')");
      return 0;
    }
    return value;
  }

  // Gebruiken voor debuggen om te checken of env vars goed geladen zijn
  private void PrintEnvironmentVariables()
  {
    Console.WriteLine("=== Environment Variables ===");

    Console.WriteLine($"POSTGRES_HOST: {PostgresHost}");
    Console.WriteLine($"POSTGRES_PORT: {PostgresPort}");
    Console.WriteLine($"POSTGRES_DB: {PostgresDb}");
    Console.WriteLine($"POSTGRES_USER: {PostgresUser}");
    Console.WriteLine($"POSTGRES_PASSWORD: {PostgresPassword}");

    Console.WriteLine($"MONGO_USER: {MongoUser}");
    Console.WriteLine($"MONGO_PASSWORD: {MongoPassword}");
    Console.WriteLine($"MONGO_HOST: {MongoHost}");
    Console.WriteLine($"MONGO_PORT: {MongoPort}");

    Console.WriteLine($"REDIS_PASSWORD: {RedisPassword}");

    Console.WriteLine($"JWT_SECRET: {JwtSecret}");
    Console.WriteLine($"JWT_ISSUER: {JwtIssuer}");
    Console.WriteLine($"JWT_ACCESS_TOKEN_MINUTES: {JwtAccessTokenMinutes}");
    Console.WriteLine($"JWT_REFRESH_TOKEN_DAYS: {JwtRefreshTokenDays}");

    Console.WriteLine($"Admin E-Mail: {AdminEmail}");
    Console.WriteLine($"Admin password: {AdminPassword}");

    Console.WriteLine($"CORS_FRONTEND_ORIGIN: {CorsFrontendOrigin ?? "(not set — CORS disabled)"}");

    Console.WriteLine("================================");
  }
}