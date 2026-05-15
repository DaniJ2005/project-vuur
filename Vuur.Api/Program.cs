using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Vuur.Api.Data;
using Vuur.Api.Features.Auth;
using Vuur.Api.Features.Orders;
using Vuur.Api.Features.Users;

var builder = WebApplication.CreateBuilder(args);

// Load .env in development and push values into configuration
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        DotNetEnv.Env.Load(envPath);
        // Push loaded env vars into IConfiguration so contexts can read them
        builder.Configuration.AddEnvironmentVariables();
    }
}

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Make Dapper map snake_case columns to PascalCase properties automatically
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;


// PostgreSQL
builder.Services.AddSingleton<PostgresContext>();

// MongoDB
builder.Services.AddSingleton<MongoContext>();

// Redis
builder.Services.AddSingleton<RedisContext>();

// Repositories
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserReadRepository>();

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();

// Addresses
builder.Services.AddScoped<AddressRepository>();
builder.Services.AddScoped<AddressReadRepository>();
builder.Services.AddScoped<AddressService>();

// Wishlist
builder.Services.AddScoped<WishlistRepository>();
builder.Services.AddScoped<WishlistReadRepository>();
builder.Services.AddScoped<WishlistService>();

// Orders
builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderReadRepository>();
builder.Services.AddScoped<OrderService>();

// Payments
builder.Services.AddScoped<PaymentRepository>();
builder.Services.AddScoped<PaymentReadRepository>();
builder.Services.AddScoped<PaymentService>();

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Audience = null;
        options.MapInboundClaims = false;
        options.TokenValidationParameters.RequireSignedTokens = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(
                                           System.Text.Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.FromMinutes(5),
            NameClaimType = "sub",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

// Standard services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Allow Swagger UI to send Bearer tokens
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            []
        }
    });
});

// allow react frontend without CORS issues
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Run SQL migrations via DbUp (before the app starts serving requests)
var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
    ?? app.Configuration["POSTGRES_CONNECTION_STRING"]
    ?? throw new InvalidOperationException("POSTGRES_CONNECTION_STRING is not configured.");

MigrationRunner.Run(connectionString);

// middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
