// LombokAlgoritma — Swift Sort Module
// Apache-2.0 — @codinglombok
import Foundation

public enum Sort {

    /// Timsort — stable, adaptive. O(n log n). Delegates to Swift's built-in sort.
    public static func timsort<T: Comparable>(_ arr: [T]) -> [T] { arr.sorted() }
    public static func timsort<T>(_ arr: [T], by comparator: (T, T) -> Bool) -> [T] {
        arr.sorted(by: comparator)
    }

    /// Mergesort — bottom-up iterative, O(n log n), stable.
    public static func mergesort<T: Comparable>(_ arr: [T]) -> [T] {
        var a = arr; let n = a.count
        guard n > 1 else { return a }
        var tmp = a; var w = 1
        while w < n {
            var lo = 0
            while lo < n {
                let mid = Swift.min(lo + w, n), hi = Swift.min(lo + 2 * w, n)
                var (i, j, k) = (lo, mid, lo)
                while i < mid && j < hi {
                    if a[i] <= a[j] { tmp[k] = a[i]; i += 1 }
                    else             { tmp[k] = a[j]; j += 1 }
                    k += 1
                }
                while i < mid { tmp[k] = a[i]; i += 1; k += 1 }
                while j < hi  { tmp[k] = a[j]; j += 1; k += 1 }
                lo += 2 * w
            }
            a = tmp; w *= 2
        }
        return a
    }

    /// Quicksort — dual-pivot, O(n log n) avg, not stable.
    public static func quicksort<T: Comparable>(_ arr: [T]) -> [T] {
        var a = arr; guard a.count > 1 else { return a }
        quicksortInner(&a, lo: 0, hi: a.count - 1); return a
    }

    private static func quicksortInner<T: Comparable>(_ a: inout [T], lo: Int, hi: Int) {
        guard lo < hi else { return }
        if hi - lo < 16 { insertionSort(&a, lo: lo, hi: hi); return }
        let p = partition(&a, lo: lo, hi: hi)
        quicksortInner(&a, lo: lo, hi: p - 1)
        quicksortInner(&a, lo: p + 1, hi: hi)
    }

    private static func partition<T: Comparable>(_ a: inout [T], lo: Int, hi: Int) -> Int {
        let mid = (lo + hi) / 2
        if a[lo] > a[mid] { a.swapAt(lo, mid) }
        if a[lo] > a[hi]  { a.swapAt(lo, hi) }
        if a[mid] > a[hi] { a.swapAt(mid, hi) }
        a.swapAt(mid, hi)
        let pivot = a[hi]; var i = lo
        for j in lo..<hi { if a[j] <= pivot { a.swapAt(i, j); i += 1 } }
        a.swapAt(i, hi); return i
    }

    private static func insertionSort<T: Comparable>(_ a: inout [T], lo: Int, hi: Int) {
        for i in (lo + 1)...hi {
            let key = a[i]; var j = i - 1
            while j >= lo && a[j] > key { a[j + 1] = a[j]; j -= 1 }
            a[j + 1] = key
        }
    }

    /// Heapsort — in-place, O(n log n), not stable.
    public static func heapsort<T: Comparable>(_ arr: [T]) -> [T] {
        var a = arr; let n = a.count; guard n > 1 else { return a }
        for i in stride(from: n / 2 - 1, through: 0, by: -1) { sift(&a, root: i, end: n) }
        for end in stride(from: n - 1, through: 1, by: -1) { a.swapAt(0, end); sift(&a, root: 0, end: end) }
        return a
    }

    private static func sift<T: Comparable>(_ a: inout [T], root: Int, end: Int) {
        var r = root
        while true {
            var largest = r; let l = 2*r+1, ri = 2*r+2
            if l < end && a[l] > a[largest] { largest = l }
            if ri < end && a[ri] > a[largest] { largest = ri }
            guard largest != r else { break }
            a.swapAt(r, largest); r = largest
        }
    }
}
