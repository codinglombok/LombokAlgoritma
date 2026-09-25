// LombokAlgoritma — error type tests
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"errors"
	"strings"
	"testing"
)

func TestErrorCodeAndIs(t *testing.T) {
	_, err := ModPow(2, -1, 5)
	assertCode(t, err, CodeOutOfRange)
	if !errors.Is(err, ErrOutOfRange) || errors.Is(err, ErrInvalidInput) {
		t.Error("errors.Is must compare codes")
	}
	if !strings.Contains(err.Error(), "OUT_OF_RANGE") {
		t.Errorf("message %q lacks the code", err.Error())
	}
	target := errors.New("other")
	if (&Error{Code: CodeOverflow}).Is(target) {
		t.Error("Is must be false for a foreign error")
	}
	for _, e := range []*Error{ErrInvalidInput, ErrOutOfRange, ErrEmptyInput, ErrNegativeWeight, ErrNoInverse,
		ErrNotCoprime, ErrOverflow, ErrOutOfBounds, ErrUnsupported} {
		if e.Code == "" || !errors.Is(e, e) {
			t.Errorf("sentinel %v", e)
		}
	}
}
