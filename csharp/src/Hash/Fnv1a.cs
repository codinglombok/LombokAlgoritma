// LombokAlgoritma — C# FNV-1a (non-cryptographic)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// SHA-256/HMAC were removed in v0.2.0 (ADR-016) — use LombokEncryptDecrypt.
using System.Text;

namespace CodingLombok.LombokAlgoritma.Hash;

/// <summary>FNV-1a 32/64-bit hashes (SPEC §12).</summary>
public static class Fnv1a
{
    /// <summary>FNV-1a 32-bit over <paramref name="data"/>.</summary>
    public static uint Hash32(byte[] data)
    {
        uint h = 0x811c9dc5;
        foreach (var b in data) { h ^= b; h = unchecked(h * 0x01000193); }
        return h;
    }

    /// <summary>FNV-1a 64-bit over <paramref name="data"/>.</summary>
    public static ulong Hash64(byte[] data)
    {
        ulong h = 0xcbf29ce484222325;
        foreach (var b in data) { h ^= b; h = unchecked(h * 0x100000001b3); }
        return h;
    }

    /// <summary>FNV-1a 32-bit of the UTF-8 encoding of <paramref name="s"/>.</summary>
    public static uint Hash32(string s) => Hash32(Encoding.UTF8.GetBytes(s));
}
