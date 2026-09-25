// LombokAlgoritma — C# Sort Module
// Apache-2.0 — @codinglombok
using System;
using System.Collections.Generic;

namespace CodingLombok.LombokAlgoritma.Sort;

/// <summary>Sorting algorithms (SPEC §6).</summary>
public static class Sorting
{
    /// <summary>Timsort — stable, adaptive. O(n log n).</summary>
    public static T[] Timsort<T>(T[] arr) where T : IComparable<T>
    {
        var result = (T[])arr.Clone();
        Array.Sort(result);
        return result;
    }

    /// <summary>Mergesort — bottom-up iterative, O(n log n), stable.</summary>
    public static T[] Mergesort<T>(T[] arr) where T : IComparable<T>
    {
        var a = (T[])arr.Clone();
        var n = a.Length;
        if (n <= 1) return a;
        var tmp = new T[n];
        for (var w = 1; w < n; w *= 2)
        {
            for (var lo = 0; lo < n; lo += 2 * w)
            {
                var mid = Math.Min(lo + w, n);
                var hi  = Math.Min(lo + 2 * w, n);
                int i = lo, j = mid, k = lo;
                while (i < mid && j < hi)
                {
                    if (a[i].CompareTo(a[j]) <= 0) tmp[k++] = a[i++];
                    else tmp[k++] = a[j++];
                }
                while (i < mid) tmp[k++] = a[i++];
                while (j < hi)  tmp[k++] = a[j++];
            }
            Array.Copy(tmp, a, n);
        }
        return a;
    }

    /// <summary>Heapsort — in-place, O(n log n), not stable.</summary>
    public static T[] Heapsort<T>(T[] arr) where T : IComparable<T>
    {
        var a = (T[])arr.Clone();
        var n = a.Length;
        if (n <= 1) return a;
        for (var i = n / 2 - 1; i >= 0; i--) Sift(a, i, n);
        for (var end = n - 1; end > 0; end--)
        {
            (a[0], a[end]) = (a[end], a[0]);
            Sift(a, 0, end);
        }
        return a;
    }

    private static void Sift<T>(T[] a, int root, int end) where T : IComparable<T>
    {
        while (true)
        {
            var largest = root; var l = 2 * root + 1; var r = 2 * root + 2;
            if (l < end && a[l].CompareTo(a[largest]) > 0) largest = l;
            if (r < end && a[r].CompareTo(a[largest]) > 0) largest = r;
            if (largest == root) break;
            (a[root], a[largest]) = (a[largest], a[root]);
            root = largest;
        }
    }

    /// <summary>Quicksort — O(n log n) average, not stable.</summary>
    public static T[] Quicksort<T>(T[] arr) where T : IComparable<T>
    {
        var a = (T[])arr.Clone();
        if (a.Length <= 1) return a;
        QuicksortInner(a, 0, a.Length - 1);
        return a;
    }

    private static void QuicksortInner<T>(T[] a, int lo, int hi) where T : IComparable<T>
    {
        if (lo >= hi) return;
        if (hi - lo < 16) { InsertionSort(a, lo, hi); return; }
        var p = Partition(a, lo, hi);
        QuicksortInner(a, lo, p - 1);
        QuicksortInner(a, p + 1, hi);
    }

    private static int Partition<T>(T[] a, int lo, int hi) where T : IComparable<T>
    {
        var mid = (lo + hi) / 2;
        if (a[lo].CompareTo(a[mid]) > 0) (a[lo], a[mid]) = (a[mid], a[lo]);
        if (a[lo].CompareTo(a[hi])  > 0) (a[lo], a[hi])  = (a[hi],  a[lo]);
        if (a[mid].CompareTo(a[hi]) > 0) (a[mid], a[hi]) = (a[hi], a[mid]);
        (a[mid], a[hi]) = (a[hi], a[mid]);
        var pivot = a[hi]; var i = lo;
        for (var j = lo; j < hi; j++)
            if (a[j].CompareTo(pivot) <= 0) { (a[i], a[j]) = (a[j], a[i]); i++; }
        (a[i], a[hi]) = (a[hi], a[i]);
        return i;
    }

    private static void InsertionSort<T>(T[] a, int lo, int hi) where T : IComparable<T>
    {
        for (var i = lo + 1; i <= hi; i++)
        {
            var key = a[i]; var j = i - 1;
            while (j >= lo && a[j].CompareTo(key) > 0) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }
}
