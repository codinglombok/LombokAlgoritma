module github.com/codinglombok/lombokalgoritma

go 1.21

// Zero external runtime dependencies.
// All algorithms use only the Go standard library.
//
// Dev-only tools (not included in module graph for users):
//   go test ./...
//   go test -race ./...
//   go test -fuzz=. ./ports/go/...
//
// Optional LombokECC integration (for verified-output API):
//   replace github.com/codinglombok/lombokecc => ../LombokECC
//
// Generics: requires Go 1.21+ for slices.Sort, cmp.Ordered, maps package

require (
    // No runtime dependencies — stdlib only
)

// Toolchain pin (prevents accidental upgrade breaking no-external-dep guarantee)
toolchain go1.21.0
