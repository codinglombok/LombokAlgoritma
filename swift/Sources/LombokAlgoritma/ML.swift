// LombokAlgoritma — Swift ML/Vector Module
// Apache-2.0 — @codinglombok
import Foundation

public enum VectorOps {

    public static func dotProduct(_ a: [Double], _ b: [Double]) -> Double {
        zip(a, b).reduce(0) { $0 + $1.0 * $1.1 }
    }

    public static func l2Norm(_ v: [Double]) -> Double {
        sqrt(v.reduce(0) { $0 + $1 * $1 })
    }

    public static func cosineSimilarity(_ a: [Double], _ b: [Double]) -> Double {
        let na = l2Norm(a), nb = l2Norm(b)
        guard na > 0 && nb > 0 else { return 0 }
        return dotProduct(a, b) / (na * nb)
    }

    public static func l2Distance(_ a: [Double], _ b: [Double]) -> Double {
        sqrt(zip(a, b).reduce(0) { $0 + pow($1.0 - $1.1, 2) })
    }

    public static func normalize(_ v: [Double]) -> [Double] {
        let n = l2Norm(v)
        guard n > 0 else { return [Double](repeating: 0, count: v.count) }
        return v.map { $0 / n }
    }
}
