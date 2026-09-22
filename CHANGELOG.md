# CHANGELOG — LombokAlgoritma

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — SemVer.

---

## [Unreleased]

### Planned (v0.2.0)
- +15 algoritma baru: FNV-1a, MurmurHash3, xxHash, CityHash, MinHash, LSH,
  SimHash (64/128-bit), n-gram shingling, SIMD batch cosine, BM25, HNSW core,
  IVF index, Viterbi, Jaccard similarity batch, edit distance GPU-aware
- Integrasi resmi: LombokVector ↔ LombokAlgoritma SIMD layer
- Integrasi resmi: LombokSimHash ↔ LombokAlgoritma (FNV, MinHash, LSH)
- Integrasi resmi: LombokEncryptDecrypt ↔ LombokAlgoritma (NTT, modular)
- LombokTableSheet formula engine ↔ LombokAlgoritma sort/math
- Docs site: docs.lombokalgoritma.dev (GitHub Pages + LombokCSS)
- Algorithm visualizer browser demo (WASM + LombokCharts)

### Planned (v1.0.0)
- WASM bundle dari Rust core (wasm-pack)
- GPU acceleration layer (WebGPU compute shaders)
- Formal verification proofs untuk critical algorithms
- FIPS 140-3 self-test module (bersama LombokEncryptDecrypt)

---

## [0.1.0] — 2026-09-18

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
