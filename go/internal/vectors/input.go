// LombokAlgoritma — typed accessors for untyped vector inputs (SPEC §4.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package vectors

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"strconv"

	la "github.com/codinglombok/lombokalgoritma/go"
)

// badInput is panicked by the accessors on malformed vector input; runCase turns it into a
// runner failure (it is a bug in the vector file or the dispatch, never a canonical error).
type badInput struct{ msg string }

func bad(format string, args ...any) { panic(badInput{fmt.Sprintf(format, args...)}) }

// obj is one case's input object.
type obj map[string]any

func (o obj) has(k string) bool { _, ok := o[k]; return ok }

func (o obj) get(k string) any {
	v, ok := o[k]
	if !ok {
		bad("missing field %q", k)
	}
	return v
}

func (o obj) sub(k string) obj { return asObj(o.get(k)) }

func asObj(v any) obj {
	m, ok := v.(map[string]any)
	if !ok {
		bad("not an object: %v", v)
	}
	return obj(m)
}

func (o obj) str(k string) string { return asStr(o.get(k)) }

func asStr(v any) string {
	s, ok := v.(string)
	if !ok {
		bad("not a string: %v", v)
	}
	return s
}

func (o obj) boolean(k string) bool {
	b, ok := o.get(k).(bool)
	if !ok {
		bad("field %q is not a boolean", k)
	}
	return b
}

func (o obj) bytes(k string) []byte {
	b, err := hex.DecodeString(o.str(k))
	if err != nil {
		bad("field %q: bad hex", k)
	}
	return b
}

func (o obj) float(k string) float64 { return asFloat(o.get(k)) }

func asFloat(v any) float64 {
	n, ok := v.(json.Number)
	if !ok {
		bad("not a number: %v", v)
	}
	f, err := n.Float64()
	if err != nil {
		bad("bad number %q", string(n))
	}
	return f
}

// asBig accepts a JSON integer or a decimal string (SPEC §3.1).
func asBig(v any) *big.Int {
	var s string
	switch x := v.(type) {
	case json.Number:
		s = string(x)
	case string:
		s = x
	default:
		bad("not an integer: %v", v)
	}
	b, ok := new(big.Int).SetString(s, 10)
	if !ok {
		bad("not an integer: %q", s)
	}
	return b
}

func asInt64(v any) int64 {
	b := asBig(v)
	if !b.IsInt64() {
		bad("integer out of int64 range: %s", b)
	}
	return b.Int64()
}

func asU64(v any) uint64 {
	b := asBig(v)
	if !b.IsUint64() {
		bad("integer out of u64 range: %s", b)
	}
	return b.Uint64()
}

func (o obj) i64(k string) int64 { return asInt64(o.get(k)) }
func (o obj) int(k string) int   { return int(o.i64(k)) }
func (o obj) u64(k string) uint64 {
	return asU64(o.get(k))
}
func (o obj) big(k string) *big.Int { return asBig(o.get(k)) }

func (o obj) arr(k string) []any { return asArr(o.get(k)) }

func asArr(v any) []any {
	a, ok := v.([]any)
	if !ok {
		bad("not an array: %v", v)
	}
	return a
}

func mapArr[T any](a []any, f func(any) T) []T {
	out := make([]T, len(a))
	for i, v := range a {
		out[i] = f(v)
	}
	return out
}

func (o obj) floats(k string) []float64 { return mapArr(o.arr(k), asFloat) }
func (o obj) i64s(k string) []int64     { return mapArr(o.arr(k), asInt64) }
func (o obj) ints(k string) []int {
	return mapArr(o.arr(k), func(v any) int { return int(asInt64(v)) })
}
func (o obj) strs(k string) []string { return mapArr(o.arr(k), asStr) }

func asFloats(v any) []float64 { return mapArr(asArr(v), asFloat) }

func (o obj) matrix(k string) [][]float64 { return mapArr(o.arr(k), asFloats) }

func asPoint(v any) la.Point2D {
	p := asFloats(v)
	if len(p) != 2 {
		bad("point must have 2 coordinates")
	}
	return la.Point2D{X: p[0], Y: p[1]}
}

func (o obj) point(k string) la.Point2D    { return asPoint(o.get(k)) }
func (o obj) points(k string) []la.Point2D { return mapArr(o.arr(k), asPoint) }

// graph reads the "graph" field {nodes, edges: [[from, to, weight], …]}.
func (o obj) graph() la.Graph {
	g := o.sub("graph")
	edges := mapArr(g.arr("edges"), func(v any) la.Edge {
		e := asArr(v)
		if len(e) != 3 {
			bad("edge must be [from, to, weight]")
		}
		return la.Edge{From: int(asInt64(e[0])), To: int(asInt64(e[1])), Weight: asFloat(e[2])}
	})
	return la.Graph{Nodes: g.int("nodes"), Edges: edges}
}

// items expands a HyperLogLog item stream {prefix, count} into prefix + decimal(i).
func (o obj) items(k string) []string {
	s := o.sub(k)
	prefix, count := s.str("prefix"), s.int("count")
	out := make([]string, count)
	for i := range out {
		out[i] = prefix + strconv.Itoa(i)
	}
	return out
}

func hex64(v uint64) string { return fmt.Sprintf("%016x", v) }
