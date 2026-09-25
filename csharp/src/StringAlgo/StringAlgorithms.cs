// LombokAlgoritma — C# String Algorithms
// Apache-2.0 — @codinglombok
using System;
using System.Collections.Generic;

namespace CodingLombok.LombokAlgoritma.StringAlgo;

/// <summary>String algorithms (SPEC §11).</summary>
public static class StringAlgorithms
{
    /// <summary>KMP search — O(n+m). Returns all start indices.</summary>
    public static List<int> KmpSearch(string text, string pattern)
    {
        var results = new List<int>();
        if (string.IsNullOrEmpty(pattern)) return results;
        var m = pattern.Length;
        var f = new int[m];
        for (int i = 1, k = 0; i < m; i++)
        {
            while (k > 0 && pattern[k] != pattern[i]) k = f[k - 1];
            if (pattern[k] == pattern[i]) k++;
            f[i] = k;
        }
        for (int i = 0, k = 0; i < text.Length; i++)
        {
            while (k > 0 && pattern[k] != text[i]) k = f[k - 1];
            if (pattern[k] == text[i]) k++;
            if (k == m) { results.Add(i - m + 1); k = f[k - 1]; }
        }
        return results;
    }

    /// <summary>Levenshtein edit distance — O(mn) time.</summary>
    public static int Levenshtein(string a, string b)
    {
        if (a == b) return 0;
        if (a.Length == 0) return b.Length;
        if (b.Length == 0) return a.Length;
        if (a.Length > b.Length) (a, b) = (b, a);
        var prev = new int[a.Length + 1];
        for (var i = 0; i <= a.Length; i++) prev[i] = i;
        var curr = new int[a.Length + 1];
        for (var j = 1; j <= b.Length; j++)
        {
            curr[0] = j;
            for (var i = 1; i <= a.Length; i++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                curr[i] = System.Math.Min(System.Math.Min(curr[i - 1] + 1, prev[i] + 1), prev[i - 1] + cost);
            }
            (prev, curr) = (curr, prev);
        }
        return prev[a.Length];
    }

    /// <summary>FNV-1a 32-bit hash.</summary>
    public static uint Fnv1a32(string s)
    {
        uint h = 0x811c9dc5u;
        foreach (var c in System.Text.Encoding.UTF8.GetBytes(s))
        {
            h ^= c;
            h *= 0x01000193u;
        }
        return h;
    }
}
