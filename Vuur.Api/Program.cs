using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using AutoMapper;
using Vuur.Api.Data;
using Vuur.Api.Config;
using Vuur.Api.Features;
using Vuur.Api.Features.Auth;
using Vuur.Api.Features.Orders;
using Vuur.Api.Features.Users;
using Vuur.Api.Features.Products;

var builder = WebApplication.CreateBuilder(args);

// Load .env from the solution root (one directory above Vuur.Api).
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
    DotNetEnv.Env.Load(envPath);
    // Push loaded env vars into IConfiguration so contexts can read them
    builder.Configuration.AddEnvironmentVariables();
}

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Make Dapper map snake_case columns to PascalCase properties automatically
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// Custom Enviroment Variables class
var env = new EnvironmentVariables(builder.Configuration);
builder.Services.AddSingleton(env);

// Library for automapping
builder.Services.AddAutoMapper(typeof(ProductProfile));

// PostgreSQL
builder.Services.AddSingleton<PostgresContext>();

// MongoDB
builder.Services.AddSingleton<MongoContext>();

// Redis
builder.Services.AddSingleton<RedisContext>();

// Repo interface
builder.Services.AddScoped<IRepository<Product>, ProductRepository>();

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

// Products
builder.Services.AddScoped<IRepository<Product>, ProductRepository>();
builder.Services.AddScoped<ProductService>();


var jwtSecret = env.JwtSecret;
var jwtIssuer = env.JwtIssuer;

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

// CORS is alleen nodig als frontend en api op verschillende origins draaien
// (lokale dev: Vite op :5173, API op :5245). In productie loopt alles via
// dezelfde nginx reverse proxy → same-origin → geen CORS nodig. We registreren
// de policy dus alleen als CORS_FRONTEND_ORIGIN is gezet in de .env.
if (env.CorsFrontendOrigin is not null)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
        {
            policy.WithOrigins(env.CorsFrontendOrigin)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });
}

var app = builder.Build();

// Run SQL migrations via DbUp (before the app starts serving requests)
var pgContext = app.Services.GetRequiredService<PostgresContext>();
pgContext.RunMigrations();

// middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



// app.UseHttpsRedirection();
// Alleen UseCors aanroepen als we de policy ook daadwerkelijk hebben geregistreerd.
if (env.CorsFrontendOrigin is not null)
{
    app.UseCors("Frontend");
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
