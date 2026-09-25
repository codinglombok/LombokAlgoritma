// LombokAlgoritma — shared test helpers
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import (
	"errors"
	"reflect"
	"testing"
)

func assertEqual[T any](t *testing.T, got, want T) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

// assertCode checks that err is an *Error with the given canonical code.
func assertCode(t *testing.T, err error, code string) {
	t.Helper()
	var e *Error
	if !errors.As(err, &e) {
		t.Fatalf("want *Error with code %s, got %v", code, err)
	}
	if e.Code != code {
		t.Errorf("code = %s, want %s", e.Code, code)
	}
}

// must panics on an unexpected error (a panic fails the test).
func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}
