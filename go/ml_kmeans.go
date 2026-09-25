// LombokAlgoritma — k-means clustering: k-means++ seeding + Lloyd iterations (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "math"

// KMeansResult is the outcome of KMeans.
type KMeansResult struct {
	Centroids [][]float64
	Labels    []int
	// Iterations is the number of Lloyd iterations performed (≤ maxIter).
	Iterations int
	// Inertia is Σ squared distance of every point to its centroid.
	Inertia float64
}

// KMeans clusters points into k groups, deterministically for a given seed (xoshiro256++):
// k-means++ seeding, then up to maxIter Lloyd iterations stopping when every centroid moved by
// less than tol. Errors: no points → EMPTY_INPUT, k ∉ [1, n] → OUT_OF_RANGE, points of unequal
// dimension → INVALID_INPUT. Typical defaults: maxIter 300, tol 1e-4, seed DefaultXoshiroSeed.
func KMeans(points [][]float64, k, maxIter int, tol float64, seed uint64) (KMeansResult, error) {
	n := len(points)
	if n == 0 {
		return KMeansResult{}, newErr(CodeEmptyInput, "KMeans: no points")
	}
	if k < 1 || k > n {
		return KMeansResult{}, newErr(CodeOutOfRange, "KMeans: need 1 ≤ k ≤ n")
	}
	d := len(points[0])
	for _, p := range points {
		if len(p) != d {
			return KMeansResult{}, newErr(CodeInvalidInput, "KMeans: points of unequal dimension")
		}
	}
	centroids := kmeansPlusPlus(points, k, NewXoshiro256pp(seed))
	labels := make([]int, n)
	iter := 0
	for iter < maxIter {
		iter++
		for i, p := range points {
			best, bestDist := 0, math.Inf(1)
			for c := 0; c < k; c++ {
				if dist := sqDist(p, centroids[c]); dist < bestDist {
					bestDist = dist
					best = c
				}
			}
			labels[i] = best
		}
		sums := make([][]float64, k)
		for c := range sums {
			sums[c] = make([]float64, d)
		}
		counts := make([]int, k)
		for i, p := range points {
			c := labels[i]
			for j := 0; j < d; j++ {
				sums[c][j] += p[j]
			}
			counts[c]++
		}
		maxShift := 0.0
		next := make([][]float64, k)
		for c := range sums {
			if counts[c] == 0 {
				next[c] = append([]float64(nil), centroids[c]...)
				continue
			}
			nc := make([]float64, d)
			for j, v := range sums[c] {
				nc[j] = v / float64(counts[c])
			}
			if shift := math.Sqrt(sqDist(centroids[c], nc)); shift > maxShift {
				maxShift = shift
			}
			next[c] = nc
		}
		centroids = next
		if maxShift < tol {
			break
		}
	}
	inertia := 0.0
	for i, p := range points {
		inertia += sqDist(p, centroids[labels[i]])
	}
	return KMeansResult{Centroids: centroids, Labels: labels, Iterations: iter, Inertia: inertia}, nil
}

// kmeansPlusPlus: c₀ = points[nextInt(n)]; D[i] = min squared distance to the chosen centroids;
// r = nextFloat()·ΣD and the next centroid is the first i with (r −= D[i]) ≤ 0 (else n−1).
func kmeansPlusPlus(points [][]float64, k int, rng *Xoshiro256pp) [][]float64 {
	n := len(points)
	first, _ := rng.NextInt(int64(n)) // 1 ≤ n: cannot fail
	centroids := [][]float64{append([]float64(nil), points[first]...)}
	dists := make([]float64, n)
	for i, p := range points {
		dists[i] = sqDist(p, centroids[0])
	}
	for len(centroids) < k {
		total := 0.0
		for _, d := range dists {
			total += d
		}
		r := rng.NextFloat() * total
		pick := n - 1
		for i, d := range dists {
			r -= d
			if r <= 0 {
				pick = i
				break
			}
		}
		c := append([]float64(nil), points[pick]...)
		centroids = append(centroids, c)
		for i, p := range points {
			if d := sqDist(p, c); d < dists[i] {
				dists[i] = d
			}
		}
	}
	return centroids
}
