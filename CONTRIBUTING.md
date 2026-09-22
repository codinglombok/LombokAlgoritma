# Contributing to LombokAlgoritma

Thank you for contributing to LombokAlgoritma! This document explains how.

## Development Setup

```bash
git clone https://github.com/codinglombok/LombokAlgoritma
cd LombokAlgoritma
npm install          # TypeScript deps
cargo build          # Rust build
pip install hatch    # Python build tool
```

## Quick Commands

```bash
make test          # Run all tests (all languages)
make test-ts       # TypeScript only
make test-rust     # Rust only
make lint          # Lint all languages
make vectors       # Generate + validate test vectors
make bench         # Benchmarks
```

## Adding a New Algorithm

1. **Add TypeScript implementation** in `src/{module}/{algorithm}.ts`
2. **Add test vectors** in `tests/vectors/{module}/{algorithm}.json`
3. **Add unit tests** in `tests/core/{module}.test.ts`
4. **Port to at least Rust and Python** (other ports welcome)
5. **Export from module index** `src/{module}/index.ts`
6. **Update CHANGELOG.md** under `[Unreleased]`
7. **Submit PR** with the checklist filled out

## Algorithm Requirements

- **Correctness first** — validate against NIST/Wikipedia reference implementations
- **Edge cases** — empty input, single element, max values, Unicode, negatives
- **No external dependencies** — stdlib only in all ports
- **Complexity documented** — O(?) in JSDoc comment
- **Reference cited** — Wikipedia/RFC/paper link in comment

## Cryptographic Algorithms

Extra requirements for anything in `src/math/` (crypto):
- Constant-time: no `if (secret === 0)` style branches
- Bitwise masking: use `ctSelect32()` from `src/core/bit.ts`
- Add dudect timing test in `tests/security/constant-time/`
- NIST Known Answer Test (KAT) vectors required

## Test Vector Format

```json
{
  "algorithm": "your-algorithm",
  "version": "0.1.0",
  "vectors": [
    { "id": "tv-001", "description": "empty input", "input": {}, "expected_output": {} }
  ]
}
```

All 12 ports MUST produce identical output for every vector.

## Code Style

TypeScript: Biome (auto-format) + ESLint strict
Rust: rustfmt + clippy (deny warnings)
Python: ruff
Go: gofmt + golangci-lint
PHP: PHP_CodeSniffer PSR-12 + PHPStan level 9

## License

By contributing, you agree your contributions are licensed under Apache-2.0.
