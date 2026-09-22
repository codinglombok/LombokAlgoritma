// LombokAlgoritma — C# Search Module
// Apache-2.0 — @codinglombok
using System;

namespace CodingLombok.LombokAlgoritma.Search;

public static class Searching
{
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

    public static int LowerBound<T>(T[] arr, T target) where T : IComparable<T>
    {
        int lo = 0, hi = arr.Length;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid].CompareTo(target) < 0) lo = mid + 1; else hi = mid; }
        return lo;
    }

    public static int LinearSearch<T>(T[] arr, T target) where T : IEquatable<T>
    {
        for (var i = 0; i < arr.Length; i++) if (arr[i].Equals(target)) return i;
        return -1;
    }
}
