// LombokAlgoritma — vector runner CLI (Go port), SPEC §4.3 / §14
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
//	cd go && go run ./cmd/vectors ../vectors/lombokalgoritma-vectors-v1.json > ../out/go.txt
//
// Writes "group\tid\tcanonical(actual)" per case to stdout; exits 1 on an unknown group or any
// mismatch, 2 on a usage or I/O error.
package main

import (
	"bufio"
	"fmt"
	"os"

	"github.com/codinglombok/lombokalgoritma/go/internal/vectors"
)

func main() {
	os.Exit(run(os.Args[1:]))
}

func run(args []string) int {
	path := "../vectors/lombokalgoritma-vectors-v1.json"
	switch len(args) {
	case 0:
	case 1:
		path = args[0]
	default:
		fmt.Fprintln(os.Stderr, "usage: vectors [path/to/lombokalgoritma-vectors-v1.json]")
		return 2
	}
	rep, err := vectors.RunFile(path)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 2
	}
	w := bufio.NewWriter(os.Stdout)
	if _, err := w.WriteString(rep.Output()); err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 2
	}
	if err := w.Flush(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 2
	}
	for _, f := range rep.Failures {
		fmt.Fprintln(os.Stderr, "FAIL", f)
	}
	for _, g := range rep.Missing {
		fmt.Fprintln(os.Stderr, "MISSING group", g)
	}
	fmt.Fprintf(os.Stderr, "go: %d cases, %d failures, %d missing groups\n", rep.Cases, len(rep.Failures), len(rep.Missing))
	if !rep.OK() {
		return 1
	}
	return 0
}
