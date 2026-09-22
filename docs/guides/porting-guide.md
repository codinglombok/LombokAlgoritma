# LombokAlgoritma — Porting Guide

How to add a new language port to LombokAlgoritma.

## 1. Setup Port Directory

```
ports/{language}/
  src/
    sort/
    search/
    math/
    string/
    datastructure/
    ml/
  tests/
    vectors/   <- symlink to ../../tests/vectors/
    unit/
  README.md
  {build-file}  <- Cargo.toml / pyproject.toml / go.mod / etc.
```

## 2. Port Requirements

- **Zero external dependencies** — stdlib only for core algorithms
- **Test vectors** — all ports must pass identical JSON test vectors
- **Cross-language identity** — same input → same output as TypeScript reference
- **Idiomatic style** — follow each language's conventions (generics in Go/Kotlin/Swift, PSR-4 in PHP, etc.)

## 3. Algorithm Order (start with these)

1. `Sort::timsort` and `Sort::quicksort` — fundamental, easy to validate
2. `Search::binarySearch` and `Search::lowerBound`
3. `Math::sha256` — validate against NIST FIPS 180-4 KAT vectors
4. `String::levenshtein` — validate against known test cases
5. `ML::cosineSimilarity` — validate with tolerance 1e-9

## 4. Validate Test Vectors

```bash
# Generate vectors from TypeScript reference
npm run vectors:generate

# Run your port against all vectors
bash scripts/validate_vectors.sh
```

Test vector format:
```json
{
  "algorithm": "quicksort",
  "version": "0.1.0",
  "vectors": [
    { "id": "sort-001", "input": [5,3,1], "expected": [1,3,5] }
  ]
}
```

## 5. CI

Add your language to `.github/workflows/ci.yml`:

```yaml
my-language:
  name: MyLanguage ${{ matrix.version }}
  runs-on: ubuntu-latest
  strategy:
    matrix:
      version: ["1.0", "1.1"]
  steps:
    - uses: actions/checkout@v4
    - name: Setup
      uses: actions/setup-MY-LANGUAGE@v1
      with: { version: ${{ matrix.version }} }
    - run: cd ports/mylanguage && my-test-command
```

## 6. Crypto Constant-Time Requirements

If porting `src/math/sha256.ts`, `aes-gcm.ts`, etc.:

- No secret-dependent `if` branches
- Use constant-time comparison (see `src/core/bit.ts` → `ctEqual`)
- Add dudect-style timing test in `tests/security/constant-time/`

## 7. Adding Algorithms (not just ports)

1. Implement in `src/{module}/{algorithm}.ts` (TypeScript reference)
2. Add test vectors in `tests/vectors/{module}/{algorithm}.json`
3. Add unit tests in `tests/core/{module}.test.ts`
4. Export from `src/{module}/index.ts`
5. Run `npm run vectors:generate` to generate cross-language vectors
6. Port to Rust and Python at minimum
7. Update `CHANGELOG.md` under `[Unreleased]`

## 8. Port Completeness Matrix

| Module | Minimum Required | Full Required |
|--------|-----------------|---------------|
| Sort | quicksort, timsort, mergesort | All 16 |
| Search | binarySearch, lowerBound | All 12 |
| Math | sha256, gcd, modPow | All 28 |
| String | kmpSearch, levenshtein | All 18 |
| DataStructure | BloomFilter, DisjointSet | All 24 |
| ML | cosineSimilarity, l2Distance | All 10 |
