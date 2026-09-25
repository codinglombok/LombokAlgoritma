// LombokAlgoritma — shared-vector runner (Go port), SPEC §4
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

// Package vectors runs the shared LombokAlgoritma test vectors
// (vectors/lombokalgoritma-vectors-v1.json) against the Go port and renders the runner output of
// SPEC §4.3. It is internal: the public API is the lombokalgoritma package.
package vectors

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"sort"

	la "github.com/codinglombok/lombokalgoritma/go"
)

type vectorCase struct {
	ID       string          `json:"id"`
	Input    json.RawMessage `json:"input"`
	Expected json.RawMessage `json:"expected"`
}

type vectorDoc struct {
	Format  string                  `json:"format"`
	Version int                     `json:"version"`
	Groups  map[string][]vectorCase `json:"groups"`
}

// Report is the outcome of a run.
type Report struct {
	// Lines holds "group\tid\tcanonical(actual)" per case, groups sorted, cases in file order.
	Lines []string
	// Failures lists mismatches and non-canonical errors.
	Failures []string
	// Missing lists groups without a dispatch entry.
	Missing []string
	// Cases is the number of cases executed.
	Cases int
}

// OK reports whether every group was known and every case matched.
func (r *Report) OK() bool { return len(r.Failures) == 0 && len(r.Missing) == 0 }

// Output is the runner output of SPEC §4.3 (one line per case, "\n"-terminated).
func (r *Report) Output() string {
	var b bytes.Buffer
	for _, l := range r.Lines {
		b.WriteString(l)
		b.WriteByte('\n')
	}
	return b.String()
}

func decode(raw []byte, v any) error {
	d := json.NewDecoder(bytes.NewReader(raw))
	d.UseNumber()
	return d.Decode(v)
}

// RunFile reads and runs a vector file.
func RunFile(path string) (*Report, error) {
	raw, err := os.ReadFile(path) //nolint:gosec // the vector path is chosen by the caller
	if err != nil {
		return nil, err
	}
	return Run(bytes.NewReader(raw))
}

// Run runs every case of the vector document read from r.
func Run(r io.Reader) (*Report, error) {
	raw, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	var doc vectorDoc
	if err := decode(raw, &doc); err != nil {
		return nil, fmt.Errorf("vectors: %w", err)
	}
	if doc.Format != "lombokalgoritma-vectors" || doc.Version != 1 {
		return nil, errors.New("vectors: unsupported vector file")
	}
	groups := make([]string, 0, len(doc.Groups))
	for g := range doc.Groups {
		groups = append(groups, g)
	}
	sort.Strings(groups)
	rep := &Report{}
	for _, g := range groups {
		if _, ok := Dispatch[g]; !ok {
			rep.Missing = append(rep.Missing, g)
			continue
		}
		for _, c := range doc.Groups[g] {
			rep.Cases++
			got, err := runRaw(g, c.Input)
			if err != nil {
				rep.Failures = append(rep.Failures, fmt.Sprintf("%s/%s: %v", g, c.ID, err))
				got = fmt.Sprintf("<error: %v>", err)
			}
			rep.Lines = append(rep.Lines, g+"\t"+c.ID+"\t"+got)
			var exp any
			if err := decode(c.Expected, &exp); err != nil {
				return nil, fmt.Errorf("vectors: %s/%s expected: %w", g, c.ID, err)
			}
			want, err := Canonical(exp)
			if err != nil {
				return nil, fmt.Errorf("vectors: %s/%s expected: %w", g, c.ID, err)
			}
			if got != want {
				rep.Failures = append(rep.Failures, fmt.Sprintf("%s/%s: expected %s, got %s", g, c.ID, want, got))
			}
		}
	}
	return rep, nil
}

func runRaw(group string, rawInput []byte) (string, error) {
	var in map[string]any
	if err := decode(rawInput, &in); err != nil {
		return "", fmt.Errorf("bad input: %w", err)
	}
	v, err := RunCase(group, in)
	if err != nil {
		return "", err
	}
	return Canonical(v)
}

// RunCase runs one case. A *lombokalgoritma.Error becomes {"error": code} (SPEC §2); any other
// error — including malformed input and panics — is returned as a failure.
func RunCase(group string, input map[string]any) (out any, err error) {
	f, ok := Dispatch[group]
	if !ok {
		return nil, fmt.Errorf("unknown vector group %s", group)
	}
	defer func() {
		if p := recover(); p != nil {
			if b, ok := p.(badInput); ok {
				err = fmt.Errorf("bad input: %s", b.msg)
				return
			}
			err = fmt.Errorf("panic: %v", p)
		}
	}()
	v, err := f(obj(input))
	if err != nil {
		var ae *la.Error
		if errors.As(err, &ae) {
			return map[string]any{"error": ae.Code}, nil
		}
		return nil, err
	}
	return v, nil
}
