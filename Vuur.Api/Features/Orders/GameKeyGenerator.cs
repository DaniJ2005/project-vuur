using System.Security.Cryptography;
using System.Text;

namespace Vuur.Api.Features.Orders;

/// <summary>
/// Produces fresh activation codes on the fly. We don't keep a real key
/// inventory yet, so a key is generated when the product is purchased and
/// inserted straight into <c>game_keys</c> as a sold row.
/// </summary>
public static class GameKeyGenerator
{
    // Crockford-ish alphabet: no 0/O/1/I to keep codes easy to read/type.
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int Groups = 4;
    private const int GroupLength = 5;

    /// <summary>Generates a code in the format XXXXX-XXXXX-XXXXX-XXXXX.</summary>
    public static string Generate()
    {
        var sb = new StringBuilder(Groups * GroupLength + (Groups - 1));
        for (int g = 0; g < Groups; g++)
        {
            if (g > 0) sb.Append('-');
            for (int c = 0; c < GroupLength; c++)
            {
                sb.Append(Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]);
            }
        }
        return sb.ToString();
    }
}
