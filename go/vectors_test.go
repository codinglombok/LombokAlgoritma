// LombokAlgoritma — shared vectors as a unit test of the library package (SPEC §4, §14)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// External test package in the library directory (it cannot be package lombokalgoritma
// because internal/vectors imports the library); its coverage counts for the library.

package lombokalgoritma_test

import (
	"testing"

	"github.com/codinglombok/lombokalgoritma/go/internal/vectors"
)

func TestSharedVectors(t *testing.T) {
	rep, err := vectors.RunFile("../vectors/lombokalgoritma-vectors-v1.json")
	if err != nil {
		t.Fatal(err)
	}
	for _, g := range rep.Missing {
		t.Errorf("missing group %s", g)
	}
	for _, f := range rep.Failures {
		t.Error(f)
	}
	if rep.Cases != 1059 {
		t.Errorf("ran %d cases, want 1059", rep.Cases)
	}
}
