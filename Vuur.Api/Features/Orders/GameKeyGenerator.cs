using System.Security.Cryptography;
using System.Text;

namespace Vuur.Api.Features.Orders;

public static class GameKeyGenerator
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int Groups = 4;
    private const int GroupLength = 5;

    /// Generates a code in the format XXXXX-XXXXX-XXXXX-XXXXX
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
