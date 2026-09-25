# CHANGELOG — LombokAlgoritma

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — SemVer.

---

## [0.2.0] — breaking refactor (PR "refactor!: v0.2.0")

Every conformant port (TypeScript, Rust, Python, Go, PHP) now passes the shared vectors
`vectors/lombokalgoritma-vectors-v1.json` (92 groups, 1059 cases) with **byte-identical** runner output,
checked in CI (`vectors-crosscheck`). Normative contract: `docs/SPEC_LombokAlgoritma_v0.2.0.md`.
Migration notes: [UPGRADE.md](UPGRADE.md).

### Removed (BREAKING)
- Cryptography in every port (ADR-016 → `lombokencryptdecrypt`): TS `sha256`, `sha256hex`, `hmacSha256`,
  `hkdf`, `hkdfExtract`, `hkdfExpand` and subpath `lombokalgoritma/crypto`; Rust `math::sha256`; Go
  `SHA256`, `SHA256Hex`, `HMACSHA256`, `HKDF`; Python `sha256`, `sha256_hex`, `hmac_sha256`, `hkdf`; PHP
  `Math\SHA256`, `Math\Hkdf`; Perl `sha256_hex`; C# `HashFunctions.Sha256*`/`HmacSha256`.
- `ports/` and root manifests: each language lives in its own top-level folder (`typescript/ rust/ go/
  python/ php/ java/ kotlin/ csharp/ cpp/ swift/ perl/ sql/`); `tests/vectors/**` replaced by `vectors/`.

### Changed (BREAKING)
- Errors carry canonical codes (SPEC §2) in all ports: TS `AlgoError.code` (was `RangeError`/`Error`),
  Rust `Error::code()`, Python `AlgoError.code`, Go `*Error.Code`, PHP `AlgoException::getErrorCode()`.
- Strings are processed as Unicode code points (KMP indices, edit distances, Jaro, Aho–Corasick,
  `polynomialHash`); v0.1.x used UTF-16 units (TS) or bytes (Go).
- Hashes moved to `string/hash` (TS `src/string/hash/*`; still re-exported from `lombokalgoritma/string`).
- `graph/` and `geometry/` split into one file per algorithm; `convexHullGraham` → `convexHull` (alias kept,
  deprecated); `huffmanEncode` returns `bitLength` and `codes`; `rleDecode`/`lz77Decompress` reject malformed
  input; `batchCosine` scores zero vectors 0 and breaks ties by index; `kmeans` uses exact squared distances,
  a normative k-means++ seeding and reports the number of iterations performed.
- `modPow` normalises a negative base and rejects `m < 1` / `exp < 0`; `closestPair` uses `√(dx²+dy²)` instead
  of `Math.hypot`; `BloomFilter.withParams(m, k)` is the portable constructor.

### Added
- Graph: Tarjan SCC, Prim, Bellman–Ford, max-flow (Dinic), bipartite matching (Hopcroft–Karp) — needed by
  LombokLeiden and LombokGraphDB; Dijkstra/A*/Prim use a binary heap with total lexicographic keys.
- Hashes: xxHash64, SipHash-2-4. Compression: `huffmanDecode`.
- Shared vectors + generator (`npm run vectors:generate|check|run`) and runners in five ports; `vectors/SHA256SUMS`.
- The 12 standard documents in `docs/` (masterplan, architecture, changelog, map, structure_repo,
  full_summary_project, guide_how_to_use, how_to_dist, development_ide, API, Lang, SPEC).
- Ports: Rust, Go, Python and PHP now implement every algorithm of the reference (see README status table);
  Rust `lombokalgoritma-vectors` runner crate; Go `cmd/vectors`; Python `lombokalgoritma._vectors`;
  PHP `php/bin/vectors.php`.

### Build
- Dev tooling (from Dependabot on `main`): vitest 5 + @vitest/coverage-v8 5, ESLint 10 + @eslint/js 10,
  @types/node 26; TypeScript stays on 5.9 (typescript-eslint 8 does not support TypeScript 7 — Dependabot
  ignores TS majors); PHPStan `^1.11 || ^2.0` (PHP port clean at level 9 on both); actions setup-node 7,
  setup-python 7, setup-dotnet 6, codecov 7.1.1, CodeQL 4.38.1 (init and analyze aligned).

### Fixed
- TS Aho–Corasick never matched patterns with astral characters (trie by code point, scan by UTF-16 unit);
  `build()` was not idempotent.
- Python Bloom filter used a non-SPEC second hash; `crt`/`mod_inverse` used floor-division egcd; `pearson([])`
  raised `ZeroDivisionError`.
- Go `InterpolationSearch` used float64 positions; `KMPSearch` returned byte offsets; `IsPrime` was
  probabilistic; FMA fusion could change float results (now blocked).
- Rust `binary_search` probe order differed from the SPEC; `quicksort` degraded to O(n²) with many equal keys.

## [0.1.1] — fix release (PR "fix: v0.1.1")

First release intended for the registries (npm, crates.io, PyPI, Packagist, Go proxy).
Version 0.1.0 was tagged in no registry; its entry below overstated the contents (e.g. "160+
algorithms, 12 ports") — the README status table is now generated from the code.

### Fixed — TypeScript
- `npm ci` failed: devDependency `biome` → `@biomejs/biome`; ESLint plugins declared.
- `npm run build` failed (no tsup config): `tsup.config.ts` builds `dist/esm`, `dist/cjs`, `dist/types`
  for `.` and every subpath; `exports` ordered `types → import → require`; `./package.json` exported.
- `crt` used the wrong Bézout coefficient; now returns the canonical solution and validates input.
- `HyperLogLog` indexed registers with raw FNV-1a (poor avalanche) → 8.8 % error at n = 10⁴; fmix32
  finalizer + explicit small/large-range correction → 0.2 %.
- `xxHash32` was not XXH32 (XOR instead of ADD, wrong round order); now matches the reference.
- `SegmentTree` lazy range-add did not scale by segment length; empty tree no longer recurses forever.
- `Xoshiro256pp` seeding did not follow SplitMix64; now bit-identical to the reference C code.
- `jumpSearch` missed targets located exactly on a block boundary.
- `pollardRho`/`factorize` recursed forever for prime powers (9, 25, 49 …).
- `strassenMul` produced wrong results for odd sizes > 64 (now pads to a power of two).
- `lcm` could be negative; `polynomialHash` could be negative; `countingSort` accepted out-of-range values.
- WASM SIMD probe had wrong section sizes (always reported `false`).
- 26 `tsc --noEmit` errors (unchecked indexing, host globals in `hardware/`, `.ts` import suffix).
- SHA-256 itself was correct (FIPS 180-4 incl. 1 000 000 × 'a'); the failing tests had wrong expected
  digests. Same for the timsort ('kiwi' has 4 letters) and pearson (r = 0.6) expectations.

### Deprecated
- `sha256`, `sha256hex`, `hmacSha256`, `hkdf`, `hkdfExtract`, `hkdfExpand`, subpath `./crypto`, and the
  equivalents in the Rust, Go, Python, PHP and Perl ports → moved to `lombokencryptdecrypt`
  (ADR-016); **removed in 0.2.0**.

### Added
- `Pcg32` (PCG-XSH-RR) and `SplitMix64`; unbiased `Xoshiro256pp.nextInt`.
- Regression suites (`tests/core/regression.test.ts`, `coverage.test.ts`) and a TypeScript runner for
  `tests/vectors/**`; coverage 99 % lines / 90 % branches.
- `scripts/count_algorithms.ts` (`npm run counts`, checked in CI).
- Rust: FNV-1a, MurmurHash3, xxHash32, `upper_bound`; C ABI crate + header; WASM crate.
- Python: `crt`, `pearson`, `murmur3_32`, `xxhash32`, `sort_with`; PHP: `murmur3_32`, `xxhash32`, `crt`.

### Changed
- Rust moved to the `rust/` workspace: `lombokalgoritma` (`no_std` + `alloc`, feature `std` default),
  `lombokalgoritma-capi`, `lombokalgoritma-wasm` (the only crate using wasm-bindgen, ADR-010);
  toolchain `stable`, MSRV 1.75 (`rust-version`). `mod_pow` uses 128-bit intermediates.
- Go moved to `go/` as module `github.com/codinglombok/lombokalgoritma/go` (tags `go/vX.Y.Z`); root
  `go.mod` removed; tests in-package. `JumpSearch` block size √n; `BatchCosine` stable and NaN-free.
- Python: `quicksort(cmp=…)` honoured; iterative `DisjointSet.find`; sequential float summation.
- PHP: `Sort.php` did not parse; mergesort doubled the run width twice. Rewritten (PSR-12, PHPStan 9).
- C++: header functions marked `inline` (ODR); Catch2 via CMake FetchContent. Perl: real quicksort,
  `mod_pow`/`is_prime` via `Math::BigInt::bmodpow`.
- License: **Apache-2.0 OR MIT** (`LICENSE-APACHE`, `LICENSE-MIT`, SPDX in every manifest).
- CI: per-language jobs on the new paths, SHA-pinned actions, MSRV + thumbv7em + wasm32 builds;
  release-please for npm/PyPI/Packagist (`v*`), crates (`rust-v*`) and Go (`go/v*`).

### Removed
- Workflows for non-existent fuzz targets and benchmarks; `scripts/publish_all.sh`; root Gradle files;
  `tests/vectors/sort/introsort.json` (no implementation).

## [0.1.0] — 2026-09-18 (not published; claims below were aspirational — see 0.1.1)

### Added — Initial Release

#### Core Engine (TypeScript/JavaScript — primary implementation)

- **Sort Module** — 16 algorithms:
  quicksort (dual-pivot, median-of-3, random shuffle), mergesort (bottom-up iterative),
  heapsort (in-place), timsort (adaptive, Python-equivalent), introsort (quicksort +
  heapsort fallback), radix LSD, radix MSD, counting sort, bucket sort, shell sort
  (Ciura gap sequence), comb sort, cycle sort (minimum writes), pancake sort,
  beadsort, pigeonhole sort, cocktail-shaker sort

- **Search Module** — 12 algorithms:
  binary search + variants, interpolation search, exponential search, Fibonacci search,
  ternary search (unimodal functions), jump search, linear search (baseline),
  meta-binary search, sublist search, sentinel-linear search, B-tree search,
  skip-list probabilistic search

- **Graph Module** — 22 algorithms:
  Dijkstra (Fibonacci heap), A* (pluggable heuristic), Bellman-Ford, Floyd-Warshall,
  Kruskal (union-find), Prim (binary heap), Boruvka (parallel-friendly), BFS, DFS
  (iterative), topological sort Kahn, topological sort DFS, SCC Kosaraju, SCC Tarjan,
  articulation points, bridges, Eulerian path/circuit (Hierholzer), Hamiltonian path
  (backtracking + DP), max flow Ford-Fulkerson, max flow Dinic O(V²E), bipartite
  matching Hopcroft-Karp, PageRank (power iteration),
  Leiden community detection (2019) — superior to Louvain

- **Math Module** — 28 algorithms:
  GCD + LCM (Euclidean + binary), modular exponentiation, Miller-Rabin primality
  (deterministic ≤3.3×10²⁴), segmented Sieve of Eratosthenes, Pollard's rho
  factorization, Chinese Remainder Theorem, extended Euclidean (Bezout coefficients),
  matrix multiply, matrix determinant, matrix inverse, Strassen O(n^2.807),
  FFT Cooley-Tukey (iterative), NTT (modular FFT — dipakai PQC), polynomial
  convolution, Karatsuba big-integer multiplication, Newton-Raphson, bisection,
  Runge-Kutta RK4, Simpson + Gauss-Legendre integration, simplex LP,
  SHA-256 (FIPS 180-4, constant-time), SHA-512 (FIPS 180-4, constant-time),
  BLAKE3 (tree-mode, constant-time), Argon2id (RFC 9106, constant-time),
  AES-256-GCM (bitsliced, constant-time), ChaCha20-Poly1305 (RFC 8439, constant-time),
  X25519 (RFC 7748, constant-time), HKDF-SHA-256/512 (RFC 5869)

- **String Module** — 18 algorithms:
  KMP, Boyer-Moore + Horspool, Rabin-Karp (rolling hash), Z-algorithm, Aho-Corasick
  multi-pattern automaton, SA-IS O(n) suffix array, linear suffix automaton (DAWG-like),
  Levenshtein (Wagner-Fischer), Damerau-Levenshtein (transpositions), Jaro-Winkler,
  LCS, Manacher palindrome O(n), polynomial + Rabin rolling hash, compressed trie
  (Patricia), DAWG, regex NFA (no backtracking), Bitap fuzzy match,
  phonetic (Soundex, Metaphone, Double Metaphone)

- **Compression Module** — 8 algorithms:
  LZ77 (sliding window), LZ78 (dictionary), LZW (GIF/TIFF variant),
  Huffman (static + adaptive), arithmetic coding, Burrows-Wheeler Transform + RLE,
  DEFLATE (LZ77 + Huffman, RFC 1951), run-length encoding

- **Data Structure Module** — 24 structures:
  AVL tree, Red-Black tree (left-leaning), B-tree (order-M), B+ tree (leaf linking),
  splay tree, treap (randomized BST), skip list, Fibonacci heap (O(1) amortized
  decrease-key), van Emde Boas tree O(log log U), segment tree (lazy propagation),
  Fenwick tree BIT, disjoint-set (path compression + union by rank), trie,
  Ukkonen's suffix tree O(n), hash map (Robin Hood hashing), bloom filter (k-hash),
  count-min sketch (frequency estimation), HyperLogLog (cardinality estimation),
  LSM tree, rope (large string ops), lock-free deque, d-ary heap priority queue,
  augmented interval tree, k-dimensional tree (nearest neighbor)

- **Geometry Module** — 14 algorithms:
  convex hull Graham scan, Jarvis march, Chan's O(n log h), closest pair
  (divide-and-conquer), line intersection (Bentley-Ottmann), ear clipping
  triangulation, point-in-polygon (ray casting + winding number), Voronoi (Fortune's
  sweep line), Delaunay (Bowyer-Watson), AABB collision, GJK collision detection,
  SAT (Separating Axis Theorem), Bezier curves (cubic + subdivision), B-spline

- **ML Module** — 10 algorithms (zero external deps):
  k-means (k-means++ init), k-medoids (PAM), DBSCAN, linear regression (OLS + SGD),
  logistic regression (binary + multiclass OvR), decision tree (CART + C4.5),
  random forest (bagging + feature subsampling), PCA (power iteration SVD),
  distance functions (Euclidean, Manhattan, Chebyshev, Hamming),
  similarity functions (cosine SIMD-optimized, Pearson, Spearman)

- **Concurrent Module** — 8 patterns:
  work-stealing deque (Chase-Lev), Michael-Scott lock-free FIFO queue, fair
  read-write lock, counting semaphore, cyclic barrier (reusable), bounded thread pool
  (Worker threads), actor model primitives, compare-and-swap utilities

- **Hardware Module** — 12 utilities:
  runtime SIMD detection, population count (popcount), bit manipulation (de Bruijn,
  bit scan, CLZ/CTZ), cache-line aligned structures, pool allocator (TypedArray),
  WASM SIMD128 dispatch bindings

#### Ports (algorithmic core ported to 11 languages)

- **Rust** — zero-dependency, no_std compatible (embedded/MCU/FPGA), SIMD dispatch
- **Python** — pure Python 3.10+, optional NumPy acceleration
- **Go** — idiomatic Go 1.21+, full generics
- **PHP** — PHP 8.2+, PSR-4 namespacing
- **Java** — Java 17+, Maven artifact
- **C++** — C++20, header-only, CMake/vcpkg
- **Perl** — Perl 5.36+, CPAN module (core algorithms)
- **TypeScript** — pure TS, Deno/Bun/browser/Edge native (JSR)
- **SQL** — PostgreSQL 14+/MySQL 8+/SQLite 3.35+ via recursive CTE
- **Swift** — Swift 5.9+, Swift Package Manager
- **Kotlin** — Kotlin 1.9+ Multiplatform (JVM + Native + WASM)
- **C#** — .NET 8+, NuGet package

#### Registry Packages (11 registries)
- `lombokalgoritma` — npm (TypeScript/JavaScript)
- `lombokalgoritma` — PyPI (Python)
- `lombokalgoritma` — crates.io (Rust)
- `codinglombok/lombokalgoritma` — Packagist (PHP)
- `github.com/codinglombok/lombokalgoritma` — Go module
- `com.codinglombok:lombokalgoritma` — Maven Central (Java)
- `CodingLombok.LombokAlgoritma` — NuGet (.NET/C#)
- `LombokAlgoritma` — CPAN (Perl)
- `LombokAlgoritma` — Swift Package Index
- `@codinglombok/lombokalgoritma` — JSR (Deno)
- `lombokalgoritma` — vcpkg (C++ header-only) — BARU v2.3

#### GitHub Workflows
- CI matrix: Node 20/22, Python 3.11/3.12, Go 1.21/1.22, Rust stable/nightly,
  PHP 8.2/8.3, Java 17/21, .NET 8, Swift 5.9, Kotlin 1.9
- Security: CodeQL, OWASP, cargo-audit, safety, npm audit, govulncheck
- Fuzz: cargo-fuzz (Rust), go-fuzz, AFL++ (C++) — 10min per CI run
- Benchmark regression: detect >10% regression vs main
- release-please v4: automated CHANGELOG + version bump
- Publish on tag v*: semua 11 registries via single workflow

#### Documentation
- `CHANGELOG.md` — selalu di depan, riwayat perubahan
- `architecture_repo.md` — ADR, layer map, tier placement (v2.3)
- `masterplan_repo.md` — roadmap, milestones, peran fondasi ekosistem (v2.3)
- `map/struktur_folder_repo.md` — complete directory tree
- `Saran_masterplan_v2.3.md` — analisis relasi ekosistem + saran pembaruan

#### Configuration Files (created this session)
- `package.json` — npm, dual ESM/CJS, full sideEffects:false
- `Cargo.toml` — workspace dengan core + capi + wasm + embedded targets
- `pyproject.toml` — PEP 517, optional deps (numpy, ecc)
- `composer.json` — PHP, PSR-4, PHPStan level 9
- `go.mod` — Go module, zero runtime deps
- `pom.xml` — Maven, Java 17+, JaCoCo 85%+ coverage
- `Package.swift` — Swift 5.9+, iOS/macOS/tvOS/watchOS/visionOS

#### Ecosystem Integration (berdasarkan Saran_masterplan_v2.3)
- LombokECC: RS(255,239) verified output API (optional)
- LombokFuzzer: full fuzz corpus untuk semua parser dan codec
- Menyediakan math primitives untuk LombokEncryptDecrypt (non-critical crypto path)
- Menyediakan ML/SIMD untuk LombokVector (cosine, dot, L2, SIMD dispatch)
- Menyediakan SHA/Bloom/HyperLogLog untuk LombokSimHash
- Menyediakan Graph/ML untuk LombokRAGFrameworks + LombokAgenticAuto

#### Standards Compliance
- FIPS 180-4 (SHA-256/512), FIPS 197 (AES-256), RFC 8439 (ChaCha20-Poly1305)
- RFC 7748 (X25519), RFC 9106 (Argon2id), RFC 5869 (HKDF)
- IEEE 754-2019 (floating point), Unicode 15.1 (string algorithms)
- NIST SP 800-131A (cipher/hash selection), OpenSSF Scorecard (supply chain)
- SPDX: Apache-2.0

### Security
- All cryptographic implementations constant-time (no timing side-channels)
- LombokFuzzer integration untuk semua parser dan codec
- OWASP dependency audit setiap CI run
- Boundary jelas dengan LombokEncryptDecrypt: LombokAlgoritma = math primitives,
  LombokEncryptDecrypt = full constant-time crypto suites

---

*Author: @codinglombok*
*License: Apache-2.0*
*Part of Lombok Ecosystem — github.com/codinglombok*
