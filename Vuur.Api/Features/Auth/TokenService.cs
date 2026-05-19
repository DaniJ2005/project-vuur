using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Vuur.Api.Features.Users;

namespace Vuur.Api.Features.Auth;

public class TokenService(IConfiguration config)
{
    // Pull from config; fail fast if missing
    private string JwtSecret      => config["Jwt:Secret"]      ?? throw new InvalidOperationException("Jwt:Secret not configured.");
    private string JwtIssuer      => config["Jwt:Issuer"]      ?? throw new InvalidOperationException("Jwt:Issuer not configured.");
    private int    AccessTokenMin => int.Parse(config["Jwt:AccessTokenMinutes"]  ?? "15");
    private int    RefreshTokenDay => int.Parse(config["Jwt:RefreshTokenDays"]   ?? "7");


    public (string token, DateTime expiresAt) GenerateAccessToken(User user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var exp   = DateTime.UtcNow.AddMinutes(AccessTokenMin);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,    user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email,  user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new Claim(JwtRegisteredClaimNames.Jti,    Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             JwtIssuer,
            claims:             claims,
            expires:            exp,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), exp);
    }

    public (string token, DateTime expiresAt) GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        var token = Convert.ToBase64String(bytes);
        var exp   = DateTime.UtcNow.AddDays(RefreshTokenDay);
        return (token, exp);
    }
}
