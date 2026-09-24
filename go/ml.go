// LombokAlgoritma — Go ML Module
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"math"
	"sort"
)

// DotProduct computes the dot product of two vectors.
func DotProduct(a, b []float64) float64 {
	sum := 0.0
	for i := range a {
		sum += a[i] * b[i]
	}
	return sum
}

// L2Norm computes the Euclidean magnitude of a vector.
func L2Norm(v []float64) float64 {
	sum := 0.0
	for _, x := range v {
		sum += x * x
	}
	return math.Sqrt(sum)
}

// CosineSimilarity returns cosine similarity in [-1, 1].
func CosineSimilarity(a, b []float64) float64 {
	na, nb := L2Norm(a), L2Norm(b)
	if na == 0 || nb == 0 {
		return 0
	}
	return DotProduct(a, b) / (na * nb)
}

// L2Distance returns Euclidean distance between two vectors.
func L2Distance(a, b []float64) float64 {
	sum := 0.0
	for i := range a {
		d := a[i] - b[i]
		sum += d * d
	}
	return math.Sqrt(sum)
}

// Normalize returns a unit vector in the same direction as v.
func Normalize(v []float64) []float64 {
	n := L2Norm(v)
	out := make([]float64, len(v))
	if n == 0 {
		return out
	}
	for i, x := range v {
		out[i] = x / n
	}
	return out
}

// BatchCosine computes cosine similarity of query against all candidates.
// Returns indices sorted by score descending; ties keep ascending index order.
func BatchCosine(query []float64, candidates [][]float64) []int {
	type pair struct {
		idx   int
		score float64
	}
	scores := make([]pair, len(candidates))
	for i, c := range candidates {
		scores[i] = pair{i, CosineSimilarity(query, c)} // 0 for zero vectors (no NaN)
	}
	// Descending by score; ties keep the lower index first (stable).
	sort.SliceStable(scores, func(i, j int) bool { return scores[i].score > scores[j].score })
	result := make([]int, len(scores))
	for i, p := range scores {
		result[i] = p.idx
	}
	return result
}
