// LombokAlgoritma — vector runner tests: all shared vectors + canonical JSON (SPEC §3, §4)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package vectors

import (
	"math"
	"math/big"
	"os"
	"strings"
	"testing"
)

const vectorFile = "../../../vectors/lombokalgoritma-vectors-v1.json"

func TestAllVectorsMatchTypeScript(t *testing.T) {
	rep, err := RunFile(vectorFile)
	if err != nil {
		t.Fatal(err)
	}
	if !rep.OK() {
		t.Fatalf("failures: %v missing: %v", rep.Failures, rep.Missing)
	}
	if rep.Cases != 1059 || len(rep.Lines) != 1059 {
		t.Fatalf("ran %d cases", rep.Cases)
	}
	if ref, err := os.ReadFile("../../../out/typescript.txt"); err == nil && string(ref) != rep.Output() {
		t.Error("output differs from out/typescript.txt")
	}
}

func TestFormatNumber(t *testing.T) {
	point1, point2 := 0.1, 0.2
	for x, want := range map[float64]string{
		0.1: "0.1", point1 + point2: "0.30000000000000004", 1e20: "100000000000000000000", 1e21: "1e+21",
		1e-7: "1e-7", 1.23e-18: "1.23e-18", 5e-324: "5e-324", math.MaxFloat64: "1.7976931348623157e+308",
		9007199254740992: "9007199254740992", 1234.5678: "1234.5678", 0.000001234: "0.000001234",
		-2.5: "-2.5", 1.5e-7: "1.5e-7", 2: "2",
	} {
		if got := FormatNumber(x); got != want {
			t.Errorf("FormatNumber(%v) = %s, want %s", x, got, want)
		}
	}
	for x, want := range map[float64]string{math.Copysign(0, -1): "-0", math.NaN(): `"NaN"`, math.Inf(1): `"Infinity"`, math.Inf(-1): `"-Infinity"`} {
		if got := FormatNumber(x); got != want {
			t.Errorf("FormatNumber = %s, want %s", got, want)
		}
	}
}

func TestCanonical(t *testing.T) {
	v := map[string]any{
		"b": []any{true, false, nil, int64(1) << 60, -int64(1) << 60, uint64(1) << 63, uint32(7), int32(-3), uint8(9), float32(0.5)},
		"a": "q\"\\\b\f\n\r\t\x01<>& é",
		"c": big.NewInt(-5),
		"d": [2]int{1, 2},
	}
	got, err := Canonical(v)
	if err != nil {
		t.Fatal(err)
	}
	want := `{"a":"q\"\\\b\f\n\r\t\u0001<>&` + " é" + `","b":[true,false,null,"1152921504606846976","-1152921504606846976","9223372036854775808",7,-3,9,0.5],"c":-5,"d":[1,2]}`
	if got != want {
		t.Errorf("got  %s\nwant %s", got, want)
	}
	if _, err := Canonical(struct{}{}); err == nil {
		t.Error("unsupported type must fail")
	}
	if _, err := Canonical([]any{map[string]any{"x": struct{}{}}}); err == nil {
		t.Error("nested unsupported type must fail")
	}
}

func TestRunnerFailures(t *testing.T) {
	doc := `{"format":"lombokalgoritma-vectors","version":1,"groups":{
"nope.group":[{"id":"1","input":{},"expected":0}],
"math.gcd":[{"id":"1","input":{"a":4,"b":6},"expected":3},{"id":"2","input":{"a":"x","b":6},"expected":2}],
"ml.dot":[{"id":"1","input":{"a":[1],"b":[1,2]},"expected":{"error":"INVALID_INPUT"}}]}}`
	rep, err := Run(strings.NewReader(doc))
	if err != nil {
		t.Fatal(err)
	}
	if rep.OK() || len(rep.Missing) != 1 || len(rep.Failures) != 3 {
		t.Errorf("missing %v failures %v", rep.Missing, rep.Failures)
	}
	if _, err := Run(strings.NewReader(`{"format":"x","version":1}`)); err == nil {
		t.Error("wrong format must fail")
	}
	if _, err := Run(strings.NewReader(`{`)); err == nil {
		t.Error("bad JSON must fail")
	}
	if _, err := RunFile("does-not-exist.json"); err == nil {
		t.Error("missing file must fail")
	}
	if _, err := RunCase("nope", nil); err == nil {
		t.Error("unknown group must fail")
	}
	if _, err := RunCase("math.gcd", map[string]any{}); err == nil {
		t.Error("missing field must fail")
	}
}
