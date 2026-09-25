// LombokAlgoritma — canonical JSON (SPEC §3), the byte format every vector runner emits
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package vectors

import (
	"encoding/json"
	"fmt"
	"math"
	"math/big"
	"reflect"
	"sort"
	"strconv"
	"strings"
)

const maxSafeInt = 1<<53 - 1

// Canonical serialises v per SPEC §3: no insignificant whitespace, object keys sorted,
// ECMAScript number formatting with −0 kept, NaN/±Infinity as strings, integers beyond
// ±(2^53 − 1) as decimal strings, strings with JSON.stringify escaping and raw UTF-8.
//
// Supported values: nil, bool, string, float64, float32, signed/unsigned integers, *big.Int,
// json.Number, []byte is NOT special (use hex strings), slices/arrays of supported values,
// map[string]any.
func Canonical(v any) (string, error) {
	var b strings.Builder
	if err := writeCanonical(&b, v); err != nil {
		return "", err
	}
	return b.String(), nil
}

func writeCanonical(b *strings.Builder, v any) error {
	switch x := v.(type) {
	case nil:
		b.WriteString("null")
	case bool:
		if x {
			b.WriteString("true")
		} else {
			b.WriteString("false")
		}
	case string:
		writeString(b, x)
	case float64:
		b.WriteString(FormatNumber(x))
	case float32:
		b.WriteString(FormatNumber(float64(x)))
	case int:
		writeInt(b, big.NewInt(int64(x)))
	case int64:
		writeInt(b, big.NewInt(x))
	case int32:
		writeInt(b, big.NewInt(int64(x)))
	case uint32:
		writeInt(b, new(big.Int).SetUint64(uint64(x)))
	case uint64:
		writeInt(b, new(big.Int).SetUint64(x))
	case uint8:
		writeInt(b, big.NewInt(int64(x)))
	case *big.Int:
		writeInt(b, x)
	case json.Number:
		f, err := strconv.ParseFloat(string(x), 64)
		if err != nil {
			return fmt.Errorf("canonical: bad number %q", string(x))
		}
		b.WriteString(FormatNumber(f))
	case map[string]any:
		keys := make([]string, 0, len(x))
		for k := range x {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		b.WriteByte('{')
		for i, k := range keys {
			if i > 0 {
				b.WriteByte(',')
			}
			writeString(b, k)
			b.WriteByte(':')
			if err := writeCanonical(b, x[k]); err != nil {
				return err
			}
		}
		b.WriteByte('}')
	default:
		rv := reflect.ValueOf(v)
		if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
			return fmt.Errorf("canonical: unsupported type %T", v)
		}
		b.WriteByte('[')
		for i := 0; i < rv.Len(); i++ {
			if i > 0 {
				b.WriteByte(',')
			}
			if err := writeCanonical(b, rv.Index(i).Interface()); err != nil {
				return err
			}
		}
		b.WriteByte(']')
	}
	return nil
}

var (
	bigMaxSafe = big.NewInt(maxSafeInt)
	bigMinSafe = big.NewInt(-maxSafeInt)
)

// writeInt writes |v| ≤ 2^53 − 1 as a JSON number, anything larger as a decimal string (§3.1).
func writeInt(b *strings.Builder, v *big.Int) {
	if v.Cmp(bigMaxSafe) <= 0 && v.Cmp(bigMinSafe) >= 0 {
		b.WriteString(v.String())
		return
	}
	b.WriteByte('"')
	b.WriteString(v.String())
	b.WriteByte('"')
}

const hexDigits = "0123456789abcdef"

// writeString escapes like JSON.stringify: \" \\ \b \f \n \r \t, other C0 controls as \u00xx,
// everything else raw.
func writeString(b *strings.Builder, s string) {
	b.WriteByte('"')
	for i := 0; i < len(s); i++ {
		c := s[i]
		switch c {
		case '"':
			b.WriteString(`\"`)
		case '\\':
			b.WriteString(`\\`)
		case '\b':
			b.WriteString(`\b`)
		case '\f':
			b.WriteString(`\f`)
		case '\n':
			b.WriteString(`\n`)
		case '\r':
			b.WriteString(`\r`)
		case '\t':
			b.WriteString(`\t`)
		default:
			if c < 0x20 {
				b.WriteString(`\u00`)
				b.WriteByte(hexDigits[c>>4])
				b.WriteByte(hexDigits[c&0xf])
			} else {
				b.WriteByte(c)
			}
		}
	}
	b.WriteByte('"')
}

// FormatNumber formats x like ECMAScript Number::toString (SPEC §3.2) except that −0 is "-0";
// NaN and ±Infinity become the JSON strings "NaN", "Infinity", "-Infinity".
func FormatNumber(x float64) string {
	switch {
	case math.IsNaN(x):
		return `"NaN"`
	case math.IsInf(x, 1):
		return `"Infinity"`
	case math.IsInf(x, -1):
		return `"-Infinity"`
	case x == 0:
		if math.Signbit(x) {
			return "-0"
		}
		return "0"
	case x < 0:
		return "-" + FormatNumber(-x)
	}
	// shortest round-trip digits: d.ddddde±XX
	e := strconv.FormatFloat(x, 'e', -1, 64)
	mant, expStr, _ := strings.Cut(e, "e")
	digits := strings.Replace(mant, ".", "", 1)
	exp, _ := strconv.Atoi(expStr)
	k := len(digits)
	n := exp + 1 // x = 0.d₁…d_k × 10ⁿ
	switch {
	case k <= n && n <= 21:
		return digits + strings.Repeat("0", n-k)
	case 0 < n && n <= 21:
		return digits[:n] + "." + digits[n:]
	case -6 < n && n <= 0:
		return "0." + strings.Repeat("0", -n) + digits
	}
	sign := "+"
	if n-1 < 0 {
		sign = "-"
	}
	m := digits[:1]
	if k > 1 {
		m += "." + digits[1:]
	}
	return m + "e" + sign + strconv.Itoa(abs(n-1))
}

func abs(v int) int {
	if v < 0 {
		return -v
	}
	return v
}
