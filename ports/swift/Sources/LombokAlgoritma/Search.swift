// LombokAlgoritma — Swift Search Module
// Apache-2.0 — @codinglombok

public enum Search {

    /// Binary search. O(log n). Returns index or nil.
    public static func binarySearch<T: Comparable>(_ arr: [T], target: T) -> Int? {
        var lo = 0, hi = arr.count - 1
        while lo <= hi {
            let mid = (lo + hi) >> 1
            if arr[mid] == target { return mid }
            else if arr[mid] < target { lo = mid + 1 }
            else { hi = mid - 1 }
        }
        return nil
    }

    /// Lower bound — first index where arr[i] >= target.
    public static func lowerBound<T: Comparable>(_ arr: [T], target: T) -> Int {
        var lo = 0, hi = arr.count
        while lo < hi { let mid = (lo + hi) >> 1; if arr[mid] < target { lo = mid + 1 } else { hi = mid } }
        return lo
    }

    /// Upper bound — first index where arr[i] > target.
    public static func upperBound<T: Comparable>(_ arr: [T], target: T) -> Int {
        var lo = 0, hi = arr.count
        while lo < hi { let mid = (lo + hi) >> 1; if arr[mid] <= target { lo = mid + 1 } else { hi = mid } }
        return lo
    }

    /// Linear search. O(n) baseline.
    public static func linearSearch<T: Equatable>(_ arr: [T], target: T) -> Int? {
        arr.firstIndex(of: target)
    }
}
