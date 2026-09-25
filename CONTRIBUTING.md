# Contributing to LombokAlgoritma

Thank you for contributing! The normative contract is
[`docs/SPEC_LombokAlgoritma_v0.2.0.md`](docs/SPEC_LombokAlgoritma_v0.2.0.md): every conformant port
(TypeScript, Rust, Python, Go, PHP) must produce byte-identical output for the shared vectors.

## Development setup

```bash
git clone https://github.com/codinglombok/LombokAlgoritma && cd LombokAlgoritma
(cd typescript && npm ci)
(cd rust && cargo build --workspace)
pip install -e "./python[dev]"
composer install
```

## Quick commands

```bash
make test                 # all languages
make lint                 # all linters
make vectors              # regenerate vectors/lombokalgoritma-vectors-v1.json + SHA256SUMS
make vectors-crosscheck   # run the five runners and cmp their output
(cd typescript && npm run counts)   # refresh the README status table
```

## Adding an algorithm

1. TypeScript reference in `typescript/src/<module>/<algorithm>.ts` (graph/geometry: one file per algorithm) + unit tests.
2. Normative definition in the SPEC: parameters, evaluation order for floats, tie-breaking, error codes (§2).
3. Dispatch entry in `typescript/tests/vectors/dispatch.ts` and cases in `typescript/scripts/generate-vectors.ts`;
   `make vectors` and update the vector SHA-256 in the SPEC header.
4. Implement it in Rust, Python, Go and PHP, including their runner dispatch tables; `make vectors-crosscheck`.
5. CHANGELOG entry; Conventional Commit PR title.

## Requirements

- Correctness first, validated against published references (papers, RFCs, reference implementations).
- Edge cases: empty input, single element, maximum values, Unicode (code points), negatives.
- Zero runtime dependencies in every port; errors use the canonical codes of SPEC §2.
- Complexity and references in the doc comment.
- No cryptography: it belongs to [LombokEncryptDecrypt](https://github.com/codinglombok/LombokEncryptDecrypt) (ADR-016).

## Code style

TypeScript: Biome + ESLint strict · Rust: rustfmt + clippy `-D warnings` · Python: ruff + mypy `--strict` ·
Go: gofmt + go vet · PHP: PSR-12 (phpcs) + PHPStan level 9.

## License

Contributions are dual-licensed under Apache-2.0 OR MIT, without additional terms.
