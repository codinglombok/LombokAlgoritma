// LombokAlgoritma — error type with canonical codes (SPEC §2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

import "fmt"

// Canonical error codes (SPEC §2). The strings are identical in every LombokAlgoritma port;
// programs MUST branch on the code, never on the message text.
const (
	CodeInvalidInput   = "INVALID_INPUT"
	CodeOutOfRange     = "OUT_OF_RANGE"
	CodeEmptyInput     = "EMPTY_INPUT"
	CodeNegativeWeight = "NEGATIVE_WEIGHT"
	CodeNoInverse      = "NO_INVERSE"
	CodeNotCoprime     = "NOT_COPRIME"
	CodeOverflow       = "OVERFLOW"
	CodeOutOfBounds    = "OUT_OF_BOUNDS"
	CodeUnsupported    = "UNSUPPORTED"
)

// Error is the only error type returned by LombokAlgoritma. Code is one of the Code* constants.
type Error struct {
	// Code is the canonical SPEC §2 code, e.g. "OUT_OF_RANGE".
	Code string
	// Message is a human-readable explanation (not normative).
	Message string
}

// Error implements the error interface.
func (e *Error) Error() string {
	return "lombokalgoritma: " + e.Code + ": " + e.Message
}

// Is reports whether target is an *Error with the same Code, so that
// errors.Is(err, lombokalgoritma.ErrOutOfRange) works.
func (e *Error) Is(target error) bool {
	t, ok := target.(*Error)
	return ok && t.Code == e.Code
}

// Sentinel errors for use with errors.Is; only their Code is compared.
var (
	ErrInvalidInput   = &Error{Code: CodeInvalidInput, Message: "invalid input"}
	ErrOutOfRange     = &Error{Code: CodeOutOfRange, Message: "out of range"}
	ErrEmptyInput     = &Error{Code: CodeEmptyInput, Message: "empty input"}
	ErrNegativeWeight = &Error{Code: CodeNegativeWeight, Message: "negative weight"}
	ErrNoInverse      = &Error{Code: CodeNoInverse, Message: "no modular inverse"}
	ErrNotCoprime     = &Error{Code: CodeNotCoprime, Message: "moduli not coprime"}
	ErrOverflow       = &Error{Code: CodeOverflow, Message: "overflow"}
	ErrOutOfBounds    = &Error{Code: CodeOutOfBounds, Message: "out of bounds"}
	ErrUnsupported    = &Error{Code: CodeUnsupported, Message: "unsupported"}
)

func newErr(code, format string, args ...any) *Error {
	return &Error{Code: code, Message: fmt.Sprintf(format, args...)}
}
