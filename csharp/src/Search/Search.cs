// LombokAlgoritma — C# Search Module
// Apache-2.0 — @codinglombok
using System;

namespace CodingLombok.LombokAlgoritma.Search;

/// <summary>Search algorithms over sorted arrays (SPEC §7).</summary>
public static class Searching
{
    /// <summary>Binary search; index of <paramref name="target"/> or -1 (SPEC §7 probe order).</summary>
    public static int BinarySearch<T>(T[] arr, T target) where T : IComparable<T>
    {
        int lo = 0, hi = arr.Length - 1;
        while (lo <= hi)
        {
            var mid = (lo + hi) >> 1;
            var cmp = arr[mid].CompareTo(target);
            if (cmp == 0) return mid;
            if (cmp < 0) lo = mid + 1; else hi = mid - 1;
        }
        return -1;
    }

    /// <summary>First index i with arr[i] ≥ target (arr.Length when none).</summary>
    public static int LowerBound<T>(T[] arr, T target) where T : IComparable<T>
    {
        int lo = 0, hi = arr.Length;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid].CompareTo(target) < 0) lo = mid + 1; else hi = mid; }
        return lo;
    }

    /// <summary>First index equal to <paramref name="target"/>, or -1.</summary>
    public static int LinearSearch<T>(T[] arr, T target) where T : IEquatable<T>
    {
        for (var i = 0; i < arr.Length; i++) if (arr[i].Equals(target)) return i;
        return -1;
    }
}
