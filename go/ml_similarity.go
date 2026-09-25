// LombokAlgoritma — vector similarity and distance functions (SPEC §13.1)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Every Σ runs from index 0 upwards starting at 0. Products are wrapped in float64(…) so the
// compiler never contracts a·b + c into an FMA (SPEC §0.2).

package lombokalgoritma

import (
	"math"
	"sort"
)

func errLength(fn string) error {
	return newErr(CodeInvalidInput, "%s: vectors must have equal length", fn)
}

// DotProduct returns Σ aᵢ·bᵢ; different lengths yield INVALID_INPUT.
func DotProduct(a, b []float64) (float64, error) {
	if len(a) != len(b) {
		return 0, errLength("DotProduct")
	}
	return dot(a, b), nil
}

func dot(a, b []float64) float64 {
	sum := 0.0
	for i := range a {
		sum += float64(a[i] * b[i])
	}
	return sum
}

// L2Norm returns √(Σ vᵢ·vᵢ).
func L2Norm(v []float64) float64 { return math.Sqrt(dot(v, v)) }

// CosineSimilarity returns dot(a, b) / (‖a‖·‖b‖), or 0 when either norm is 0; different
// lengths yield INVALID_INPUT.
func CosineSimilarity(a, b []float64) (float64, error) {
	if len(a) != len(b) {
		return 0, errLength("CosineSimilarity")
	}
	na, nb := L2Norm(a), L2Norm(b)
	if na == 0 || nb == 0 {
		return 0, nil
	}
	return dot(a, b) / (na * nb), nil
}

// sqDist returns Σ (aᵢ − bᵢ)·(aᵢ − bᵢ).
func sqDist(a, b []float64) float64 {
	s := 0.0
	for i := range a {
		d := a[i] - b[i]
		s += float64(d * d)
	}
	return s
}

// L2Distance returns √(Σ (aᵢ−bᵢ)²); different lengths yield INVALID_INPUT.
func L2Distance(a, b []float64) (float64, error) {
	if len(a) != len(b) {
		return 0, errLength("L2Distance")
	}
	return math.Sqrt(sqDist(a, b)), nil
}

// L1Distance returns Σ |aᵢ − bᵢ|; different lengths yield INVALID_INPUT.
func L1Distance(a, b []float64) (float64, error) {
	if len(a) != len(b) {
		return 0, errLength("L1Distance")
	}
	s := 0.0
	for i := range a {
		s += math.Abs(a[i] - b[i])
	}
	return s, nil
}

// Normalize returns v / ‖v‖ (a zero vector for ‖v‖ = 0).
func Normalize(v []float64) []float64 {
	out := make([]float64, len(v))
	n := L2Norm(v)
	if n == 0 {
		return out
	}
	for i, x := range v {
		out[i] = x / n
	}
	return out
}

// JaccardSimilarity returns |A ∩ B| / |A ∪ B| over the sets of the given strings (duplicates
// ignored); two empty sets give 1.
func JaccardSimilarity(a, b []string) float64 {
	sa := make(map[string]struct{}, len(a))
	for _, x := range a {
		sa[x] = struct{}{}
	}
	sb := make(map[string]struct{}, len(b))
	for _, x := range b {
		sb[x] = struct{}{}
	}
	inter := 0
	for x := range sa {
		if _, ok := sb[x]; ok {
			inter++
		}
	}
	union := len(sa) + len(sb) - inter
	if union == 0 {
		return 1
	}
	return float64(inter) / float64(union)
}

// Pearson returns the Pearson correlation coefficient num / √(sa·sb), or 0 when either
// variance sum is 0; different lengths yield INVALID_INPUT.
func Pearson(a, b []float64) (float64, error) {
	if len(a) != len(b) {
		return 0, errLength("Pearson")
	}
	n := float64(len(a))
	sumA, sumB := 0.0, 0.0
	for i := range a {
		sumA += a[i]
		sumB += b[i]
	}
	meanA, meanB := sumA/n, sumB/n
	num, denA, denB := 0.0, 0.0, 0.0
	for i := range a {
		da := a[i] - meanA
		db := b[i] - meanB
		num += float64(da * db)
		denA += float64(da * da)
		denB += float64(db * db)
	}
	if denA == 0 || denB == 0 {
		return 0, nil
	}
	return num / math.Sqrt(denA*denB), nil
}

// ScoredIndex is one BatchCosine result.
type ScoredIndex struct {
	Index int
	Score float64
}

// BatchCosine scores query against every candidate with CosineSimilarity and sorts by score
// descending, ties by index ascending. A candidate of a different length yields INVALID_INPUT.
func BatchCosine(query []float64, candidates [][]float64) ([]ScoredIndex, error) {
	out := make([]ScoredIndex, len(candidates))
	for i, c := range candidates {
		s, err := CosineSimilarity(query, c)
		if err != nil {
			return nil, err
		}
		out[i] = ScoredIndex{Index: i, Score: s}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Score > out[j].Score })
	return out, nil
}
