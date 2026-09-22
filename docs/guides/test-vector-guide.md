# LombokAlgoritma — Test Vector Guide

Test vectors are JSON files in `tests/vectors/{module}/` that verify all
12 language ports produce identical output.

## Format

```json
{
  "algorithm": "quicksort",
  "version": "0.1.0",
  "vectors": [
    {
      "id": "sort-001",
      "description": "empty array",
      "input": [],
      "expected": []
    },
    {
      "id": "sort-002",
      "description": "reverse sorted",
      "input": [5, 4, 3, 2, 1],
      "expected": [1, 2, 3, 4, 5]
    }
  ]
}
```

For algorithms with setup (e.g. search on a pre-sorted array):

```json
{
  "algorithm": "binary_search",
  "setup": { "sorted_arr": [1,3,5,7,9,11,13,15,17,19] },
  "vectors": [
    { "id": "bs-001", "target": 7, "expected": 3 },
    { "id": "bs-002", "target": 4, "expected": -1 }
  ]
}
```

For float outputs, include `tolerance`:

```json
{
  "algorithm": "cosine_similarity",
  "tolerance": 1e-9,
  "vectors": [
    { "id": "cos-001", "a": [1,2,3], "b": [4,5,6],
      "expected": 0.9746318461970762 }
  ]
}
```

## Generate Vectors

```bash
npm run vectors:generate     # regenerate from TypeScript reference
```

The script `scripts/generate_vectors.ts` runs every algorithm in the
TypeScript reference implementation and writes the outputs as JSON.

## Validate Vectors

```bash
make vectors                  # generate + validate all languages
bash scripts/validate_vectors.sh   # validate only
```

## Adding Vectors for a New Algorithm

1. Add the algorithm to `src/{module}/{algo}.ts`
2. Add vectors to `tests/vectors/{module}/{algo}.json`
3. Include: empty input, single element, already sorted/ordered, reverse,
   duplicates, negative values, max values, Unicode (for strings)
4. For crypto: use NIST CAVP Known Answer Test (KAT) vectors
5. Run `npm run vectors:generate` to confirm TypeScript produces expected output
6. Run `bash scripts/validate_vectors.sh` to verify all ports pass

## Vector File Index

| Module | File | Vectors |
|--------|------|---------|
| sort | quicksort.json | 10 |
| sort | timsort.json | 10 |
| sort | mergesort.json | 10 |
| sort | heapsort.json | 10 |
| search | binary.json | 6 |
| math | sha256.json | 5 (NIST FIPS 180-4) |
| math | gcd.json | 5 |
| math | miller_rabin.json | 5 |
| string | levenshtein.json | 6 |
| string | kmp.json | 4 |
| string | fnv1a32.json | 4 |
| ml | cosine_similarity.json | 4 |
