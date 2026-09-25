// LombokAlgoritma — Swift String Algorithms
// Apache-2.0 — @codinglombok
import Foundation

public enum StringAlgo {

    /// KMP search — O(n+m). Returns all start indices.
    public static func kmpSearch(_ text: String, pattern: String) -> [Int] {
        let t = Array(text), p = Array(pattern)
        guard !p.isEmpty else { return [] }
        let m = p.count
        var f = [Int](repeating: 0, count: m), k = 0
        for i in 1..<m {
            while k > 0 && p[k] != p[i] { k = f[k-1] }
            if p[k] == p[i] { k += 1 }
            f[i] = k
        }
        var results = [Int](); k = 0
        for i in 0..<t.count {
            while k > 0 && p[k] != t[i] { k = f[k-1] }
            if p[k] == t[i] { k += 1 }
            if k == m { results.append(i - m + 1); k = f[k-1] }
        }
        return results
    }

    /// Levenshtein edit distance — O(mn) time.
    public static func levenshtein(_ a: String, _ b: String) -> Int {
        if a == b { return 0 }
        var ra = Array(a), rb = Array(b)
        if ra.count > rb.count { swap(&ra, &rb) }
        if ra.isEmpty { return rb.count }  // `1...0` would trap below
        var prev = Array(0...ra.count)
        for j in 1...rb.count {
            var curr = [j] + Array(repeating: 0, count: ra.count)
            for i in 1...ra.count {
                let cost = ra[i-1] == rb[j-1] ? 0 : 1
                curr[i] = Swift.min(Swift.min(curr[i-1]+1, prev[i]+1), prev[i-1]+cost)
            }
            prev = curr
        }
        return prev[ra.count]
    }

    /// FNV-1a 32-bit hash.
    public static func fnv1a32(_ s: String) -> UInt32 {
        var h: UInt32 = 0x811c9dc5
        for b in s.utf8 { h ^= UInt32(b); h = h &* 0x01000193 }
        return h
    }

    /// Jaro-Winkler similarity [0, 1].
    public static func jaroWinkler(_ a: String, _ b: String, p: Double = 0.1) -> Double {
        if a == b { return 1.0 }
        let ra = Array(a), rb = Array(b)
        let matchDist = Swift.max(ra.count, rb.count) / 2 - 1
        guard matchDist >= 0 else { return 0.0 }
        var aMatched = [Bool](repeating: false, count: ra.count)
        var bMatched = [Bool](repeating: false, count: rb.count)
        var matches = 0
        for i in 0..<ra.count {
            let lo = Swift.max(0, i - matchDist), hi = Swift.min(i + matchDist + 1, rb.count)
            for j in lo..<hi {
                if bMatched[j] || ra[i] != rb[j] { continue }
                aMatched[i] = true; bMatched[j] = true; matches += 1; break
            }
        }
        if matches == 0 { return 0.0 }
        var trans = 0, k = 0
        for i in 0..<ra.count {
            if !aMatched[i] { continue }
            while !bMatched[k] { k += 1 }
            if ra[i] != rb[k] { trans += 1 }
            k += 1
        }
        let j = (Double(matches)/Double(ra.count) + Double(matches)/Double(rb.count)
                 + Double(matches - trans/2)/Double(matches)) / 3
        var prefix = 0
        for (x, y) in zip(ra.prefix(4), rb.prefix(4)) { if x == y { prefix += 1 } else { break } }
        return j + Double(prefix) * p * (1 - j)
    }
}
