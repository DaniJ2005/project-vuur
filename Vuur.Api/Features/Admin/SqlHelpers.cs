using System.Text;
using System.Text.Json;

namespace Vuur.Api.Shared;


/// Small utilities used by admin endpoints that deal with dynamic SQL payloads.
public static class SqlHelpers
{

    /// Converts a camelCase or PascalCase identifier to snake_case.
    public static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;

        var sb = new StringBuilder(input.Length + 4);
        for (var i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0) sb.Append('_');
                sb.Append(char.ToLowerInvariant(c));
            }
            else
            {
                sb.Append(c);
            }
        }
        return sb.ToString();
    }

    /// Converts a JsonElement (as received by ASP.NET Core from a
    /// <c>Dictionary&lt;string, object?&gt;</c> body) to its native CLR primitive.
    /// Non-JsonElement values are returned as-is.
    public static object? ConvertJsonElement(object? value)
    {
        if (value is not JsonElement je) return value;

        return je.ValueKind switch
        {
            JsonValueKind.Null   => null,
            JsonValueKind.True   => true,
            JsonValueKind.False  => false,
            JsonValueKind.Number => je.TryGetInt32(out var i)  ? i  :
                                    je.TryGetInt64(out var l)  ? l  :
                                    je.GetDouble(),
            JsonValueKind.String => je.GetString(),
            _                    => je.GetRawText(),
        };
    }
}
