# Changelog — Go module `github.com/codinglombok/lombokalgoritma/go`

Maintained by release-please (tags `go/vX.Y.Z`). See the repository [CHANGELOG](../CHANGELOG.md) for the
full history.

## [0.2.0](https://github.com/codinglombok/LombokAlgoritma/compare/go/v0.1.0...go/v0.2.0) (2026-09-25)


### ⚠ BREAKING CHANGES

* SHA-256, HMAC-SHA-256 and HKDF (TS sha256/sha256hex/hmacSha256/hkdf*, subpath `lombokalgoritma/crypto`, and the equivalents in Rust, Go, Python, PHP, Perl, C#) are removed (ADR-016 → lombokencryptdecrypt). Errors carry canonical codes (SPEC §2) in every port; string algorithms operate on Unicode code points. See UPGRADE.md.

### Fixed

* math edge cases, C++/Perl ports, counts script, dual license, CI ([aa2cbfa](https://github.com/codinglombok/LombokAlgoritma/commit/aa2cbfa9413214b79809d42f637b97ccbfcd8490))
* v0.1.1 ([cbe76d6](https://github.com/codinglombok/LombokAlgoritma/commit/cbe76d6aae438cd1b85143b5528131816f466349))


### Changed

* **ports:** Rust workspace in rust/, Go module in go/, fix Python/PHP ports ([c0cdb2a](https://github.com/codinglombok/LombokAlgoritma/commit/c0cdb2a47061adb2e4056ad907ccc75dfc8d9b80))
* v0.2.0 — crypto removed, one folder per language, vectors identical in 5 ports ([57fda80](https://github.com/codinglombok/LombokAlgoritma/commit/57fda8073006392aec1d9a4f6394cddd300a744d))

## [0.2.0] — conformance release (SPEC v0.2.0)

The Go port now passes all 92 groups / 1059 cases of `vectors/lombokalgoritma-vectors-v1.json`
byte-identically to the TypeScript reference (`go run ./cmd/vectors … > ../out/go.txt`, `cmp` with
`out/typescript.txt`).

### ⚠ Breaking
- **Cryptography removed** (ADR-016): `SHA256`, `SHA256Hex`, `HMACSHA256`, `HKDF` → use
  `lombokencryptdecrypt`.
- Errors: fallible functions return `(T, error)` with `*Error{Code}` carrying the canonical SPEC §2 codes
  (`INVALID_INPUT`, `OUT_OF_RANGE`, `EMPTY_INPUT`, `NEGATIVE_WEIGHT`, `NO_INVERSE`, `NOT_COPRIME`,
  `OVERFLOW`, …); `errors.Is(err, ErrOutOfRange)` compares codes.
- Math API on `int64` with exact 128-bit / `math/big` intermediates: `GCD(a, b int64) uint64`,
  `LCM(a, b int64) (uint64, error)`, `ModPow(base, exp, m int64) (int64, error)` (was `*big.Int`),
  `ModInverse(a, m int64) (int64, error)`, `IsPrime(n int64) bool` (deterministic Miller–Rabin, was
  `big.Int.ProbablyPrime`).
- `RadixSortLSD` takes `[]int64` (negative values supported) instead of `[]uint32`.
- `KMPSearch` and `Levenshtein` operate on Unicode code points (`KMPSearch` returned byte offsets);
  `KMPSearch` returns `[]int{}` instead of `nil` when nothing matches.
- ML functions validate lengths (`DotProduct`, `CosineSimilarity`, `L2Distance` return
  `(float64, error)`); `BatchCosine` returns `[]ScoredIndex{Index, Score}` instead of bare indices.

### Added
- PRNG: `SplitMix64`, `Xoshiro256pp` (`NextFloat`, unbiased `NextInt`), `Pcg32` (`NextBounded`).
- Sort: `Heapsort`, `CountingSort`, comparator variants `TimsortFunc`, `MergesortFunc`, `QuicksortFunc`,
  `HeapsortFunc`.
- Search: `ExponentialSearch`, `FibonacciSearch`, `TernarySearch`.
- Math: `ExtendedGCD`, `CRT`, `NextPrime`, `Sieve`, `SegmentedSieve`, `PollardRho`, `Factorize`,
  `Karatsuba`, `NTT`, `PolyMulNTT`, `MatMul`, `Strassen`.
- String: `DamerauLevenshtein`, `Jaro`, `JaroWinkler`, `AhoCorasick`, `PolynomialHash`.
- Hashes: `MurmurHash3` (x86_32), `XXHash32`, `XXHash64`, `SipHash24`.
- Data structures: `BloomFilter` (`NewBloomFilterWithParams` is portable), `HyperLogLog` (+ `Registers`,
  `Merge`), `DisjointSet`, `FenwickTree`, `SegmentTree`.
- Graph: `BFS`, `DFS`, `Dijkstra`, `AStar`, `BellmanFord`, `FloydWarshall`, `TopologicalSort`, `Kruskal`,
  `Prim`, `TarjanSCC`, `Dinic`, `BipartiteMatching`, `PageRank`.
- ML: `L1Distance`, `JaccardSimilarity`, `Pearson`, `KMeans` (k-means++ seeded by xoshiro256++).
- Geometry: `Cross`, `ConvexHull`, `ClosestPair`, `PointInPolygon`, `Bezier`.
- Compression: `RLEEncode`/`RLEDecode`, `LZ77Compress`/`LZ77Decompress`, `HuffmanEncode`/`HuffmanDecode`.
- Vector runner `go run ./cmd/vectors <file>` (SPEC §4.3 output) and the same check in `go test ./...`.

### Fixed
- `InterpolationSearch` probed with float64 arithmetic; now exact integer division (SPEC §7).
- Float code never contracts `a·b + c` into FMA (explicit `float64(…)` rounding, SPEC §0.2).
