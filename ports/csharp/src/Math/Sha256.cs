// LombokAlgoritma — C# SHA-256
// Apache-2.0 — @codinglombok
using System;
using System.Security.Cryptography;
using System.Text;

namespace CodingLombok.LombokAlgoritma.Math;

public static class HashFunctions
{
    /// <summary>SHA-256 — delegates to .NET's SHA256 (constant-time, FIPS 140-3).</summary>
    public static byte[] Sha256(byte[] data) => SHA256.HashData(data);

    public static string Sha256Hex(string input)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static byte[] HmacSha256(byte[] key, byte[] data)
        => HMACSHA256.HashData(key, data);
}
