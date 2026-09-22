# LombokAlgoritma

**160+ algorithms. 12 language ports. Zero dependencies. SIMD-optimized.**

[![npm](https://img.shields.io/npm/v/lombokalgoritma.svg)](https://www.npmjs.com/package/lombokalgoritma)
[![crates.io](https://img.shields.io/crates/v/lombokalgoritma.svg)](https://crates.io/crates/lombokalgoritma)
[![PyPI](https://img.shields.io/pypi/v/lombokalgoritma.svg)](https://pypi.org/project/lombokalgoritma)
[![Packagist](https://img.shields.io/packagist/v/codinglombok/lombokalgoritma.svg)](https://packagist.org/packages/codinglombok/lombokalgoritma)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/codinglombok/LombokAlgoritma/actions/workflows/ci.yml/badge.svg)](https://github.com/codinglombok/LombokAlgoritma/actions)
[![codecov](https://codecov.io/gh/codinglombok/LombokAlgoritma/branch/main/graph/badge.svg)](https://codecov.io/gh/codinglombok/LombokAlgoritma)

The **most comprehensive, portable, and secure** algorithm library in the Lombok Ecosystem.
Part of [@codinglombok](https://github.com/codinglombok) — Apache-2.0.

---

## What Makes LombokAlgoritma Different

| Feature | LombokAlgoritma | boost | stdlib | abseil |
|---------|----------------|-------|--------|--------|
| 12+ language ports, identical output | YES | No | No | No |
| Embedded / no_std (MCU, FPGA) | YES | Partial | No | No |
| WASM browser-native | YES | No | No | No |
| ECC-verified outputs (LombokECC) | YES | No | No | No |
| Hardware SIMD auto-dispatch | YES | Manual | No | Yes |
| Fuzz-tested (LombokFuzzer) | YES | No | No | No |
| SQL port (pure SQL algorithms) | YES | No | No | No |
| Post-quantum crypto building blocks | YES | No | No | No |
| Zero external dependencies | YES | No | Yes | No |
| Apache 2.0 | YES | Mix | Various | Yes |

---

## Install

```bash
# JavaScript / TypeScript (Node.js, Deno, Bun, Browser)
npm install lombokalgoritma

# Rust (native, WASM, embedded no_std)
cargo add lombokalgoritma

# Python 3.10+
pip install lombokalgoritma

# PHP 8.2+
composer require codinglombok/lombokalgoritma

# Go 1.21+
go get github.com/codinglombok/lombokalgoritma

# Java 17+ (Maven)
# <dependency><groupId>com.codinglombok</groupId>
#   <artifactId>lombokalgoritma</artifactId><version>0.1.0</version></dependency>

# C# / .NET 8+
dotnet add package CodingLombok.LombokAlgoritma

# C++20 (vcpkg)
vcpkg install lombokalgoritma

# Swift (Package.swift)
# .package(url: "https://github.com/codinglombok/LombokAlgoritma", from: "0.1.0")

# Deno / JSR
deno add @codinglombok/lombokalgoritma
```

---

## Quick Start

### TypeScript / JavaScript

```typescript
import { Sort, Search, Math, StringAlgo, ML } from 'lombokalgoritma';

// Sort — 16 algorithms
const sorted = Sort.timsort([5, 3, 1, 4, 2]);          // [1,2,3,4,5] (stable)
const fast   = Sort.quicksort([5, 3, 1, 4, 2]);         // [1,2,3,4,5] (fastest)
const ints   = Sort.radixSortLSD([170, 45, 75, 24]);    // [24,45,75,170]

// Search
const idx = Search.binarySearch([1,3,5,7,9], 5);        // 2
const lo  = Search.lowerBound([1,2,2,2,3], 2);          // 1

// Cryptographic hash (FIPS 180-4, constant-time)
import { sha256hex, hkdf } from 'lombokalgoritma/math';
const hash = sha256hex('hello world');                   // 'b94d27...'
const key  = hkdf(new Uint8Array(16), 32);              // 32-byte derived key

// String algorithms
import { kmpSearch, levenshtein, AhoCorasick } from 'lombokalgoritma';
const matches = kmpSearch('abcabcabc', 'abc');           // [0, 3, 6]
const dist    = levenshtein('kitten', 'sitting');        // 3

// Multi-pattern matching (Aho-Corasick)
const ac = new AhoCorasick();
ac.addPattern('he'); ac.addPattern('she'); ac.addPattern('hers');
ac.build();
ac.search('ushers');  // [{pattern:'she',index:1},{pattern:'he',index:2},{pattern:'hers',index:2}]

// Vector / ML (used by LombokVector, LombokRAGFrameworks)
import { cosineSimilarity, batchCosine, kmeans } from 'lombokalgoritma';
const sim  = cosineSimilarity([1,2,3], [4,5,6]);         // 0.9746...
const top  = batchCosine([1,0,0], [[1,0,0],[0,1,0]]);   // sorted by score
const {labels} = kmeans([[1,1],[2,2],[10,10]], 2);       // cluster labels

// Data structures
import { BloomFilter, HyperLogLog, DisjointSet } from 'lombokalgoritma';
const bf = new BloomFilter(10000, 0.01);
bf.add('user:123'); bf.has('user:123');                  // true (no false negatives)

const hll = new HyperLogLog(14);
for (let i = 0; i < 1000000; i++) hll.add(`item${i}`);
hll.count();  // ~1,000,000 (±1% error)

// Math / Number Theory
import { isPrime, gcd, modPow, ntt } from 'lombokalgoritma/math';
isPrime(2147483647n);          // true (Mersenne prime)
gcd(48n, 18n);                 // 6n
modPow(2n, 10n, 1000n);       // 24n
```

### Rust

```rust
use lombokalgoritma::{
    sort::{timsort, quicksort},
    search::binary_search,
    math::{sha256, hkdf, is_prime, gcd},
    string::{kmp_search, levenshtein},
    ml::{cosine_similarity, kmeans},
    datastructure::BloomFilter,
};

// Sort
let mut v = vec![5, 3, 1, 4, 2];
timsort(&mut v, |a, b| a.cmp(b));
assert_eq!(v, [1, 2, 3, 4, 5]);

// Hash (constant-time, FIPS 180-4)
let hash = sha256(b"hello world");
let key  = hkdf(b"\x00".repeat(16), 32, None, None);

// ML — SIMD-accelerated cosine similarity
let score = cosine_similarity(&[1.0, 2.0, 3.0], &[4.0, 5.0, 6.0]);
// score ≈ 0.9746318...

// Embedded / no_std usage:
// cargo add lombokalgoritma --no-default-features --features no_std
```

### Python

```python
from lombokalgoritma import sort, search, math, string, ml

# Sort
result = sort.timsort([5, 3, 1, 4, 2])       # [1, 2, 3, 4, 5]
result = sort.quicksort([5, 3, 1, 4, 2])      # [1, 2, 3, 4, 5]

# Hash
from lombokalgoritma.math import sha256_hex, hkdf
digest = sha256_hex('hello world')             # 'b94d27...'
key    = hkdf(bytes(16), 32)                  # bytes of length 32

# String
from lombokalgoritma.string import kmp_search, levenshtein
matches = kmp_search('abcabcabc', 'abc')       # [0, 3, 6]
dist    = levenshtein('kitten', 'sitting')     # 3

# ML
from lombokalgoritma.ml import cosine_similarity, kmeans
sim = cosine_similarity([1,2,3], [4,5,6])      # 0.9746...
labels = kmeans([[1,1],[2,2],[10,10]], k=2).labels
```

### Go

```go
import (
    la "github.com/codinglombok/lombokalgoritma"
)

// Sort
arr := []int{5, 3, 1, 4, 2}
la.Timsort(arr)                                  // [1 2 3 4 5] in-place

// Hash
hash := la.SHA256([]byte("hello world"))
key  := la.HKDF(make([]byte, 16), 32, nil, nil)

// Search
idx := la.BinarySearch([]int{1,3,5,7,9}, 5)     // 2

// String
matches := la.KMPSearch("abcabcabc", "abc")      // [0 3 6]
dist    := la.Levenshtein("kitten", "sitting")   // 3
```

### PHP

```php
use LombokAlgoritma\Sort\Timsort;
use LombokAlgoritma\Math\SHA256;
use LombokAlgoritma\String\KMP;
use LombokAlgoritma\ML\CosineSimilarity;

$sorted  = Timsort::sort([5, 3, 1, 4, 2]);           // [1,2,3,4,5]
$hash    = SHA256::hex('hello world');                 // 'b94d27...'
$matches = KMP::search('abcabcabc', 'abc');            // [0, 3, 6]
$sim     = CosineSimilarity::compute([1,2,3],[4,5,6]); // 0.9746...
```

### SQL (PostgreSQL)

```sql
-- Binary search via recursive CTE
SELECT lombokalgoritma.binary_search(ARRAY[1,3,5,7,9]::int[], 5); -- 2

-- Levenshtein distance
SELECT lombokalgoritma.levenshtein('kitten', 'sitting'); -- 3

-- Graph BFS shortest path
SELECT * FROM lombokalgoritma.bfs_path('graph_edges', 1, 10);
```

---

## Algorithm Catalog

### Sort (16)
Quicksort (dual-pivot), Mergesort (bottom-up), Heapsort, Timsort, Introsort,
Radix LSD, Radix MSD, Counting, Bucket, Shell (Ciura), Comb, Cycle,
Pancake, Beadsort, Pigeonhole, Cocktail-Shaker

### Search (12)
Binary, Interpolation, Exponential, Fibonacci, Ternary, Jump, Linear,
Meta-Binary, Sublist, Sentinel-Linear, B-Tree, Skip-List

### Graph (22)
Dijkstra, A*, Bellman-Ford, Floyd-Warshall, Kruskal, Prim, Boruvka,
BFS, DFS, Topological Sort (Kahn+DFS), SCC (Kosaraju+Tarjan),
Articulation Points, Bridges, Eulerian Path/Circuit, Hamiltonian Path,
Max Flow (Ford-Fulkerson, Edmonds-Karp, Dinic), Bipartite Matching,
PageRank, **Leiden Community Detection** (2019)

### Math & Cryptography (28)
GCD/LCM, Modular Exponentiation, **Miller-Rabin** Primality, Segmented Sieve,
**Pollard's Rho**, CRT, Extended Euclidean, Matrix Multiply, **Strassen**,
FFT (Cooley-Tukey), **NTT** (PQC building block), Convolution, Karatsuba,
Newton-Raphson, Bisection, RK4, Simpson/Gauss-Legendre, Simplex,
**SHA-256/512** (FIPS 180-4), **BLAKE3**, **Argon2id** (RFC 9106),
**AES-256-GCM** (FIPS 197), **ChaCha20-Poly1305** (RFC 8439),
**X25519** (RFC 7748), **HKDF** (RFC 5869)

### String (18)
KMP, Boyer-Moore, Rabin-Karp, Z-Algorithm, **Aho-Corasick**,
SA-IS Suffix Array, Suffix Automaton, Levenshtein, Damerau-Levenshtein,
Jaro-Winkler, LCS, **Manacher** O(n), Polynomial Hash,
**FNV-1a**, **MurmurHash3**, **xxHash**, Trie, DAWG, Regex NFA, Fuzzy Match

### Compression (8)
LZ77, LZ78, LZW, Huffman (adaptive), Arithmetic Coding,
Burrows-Wheeler Transform, DEFLATE, Run-Length Encoding

### Data Structures (24)
AVL Tree, Red-Black Tree, B-Tree, B+ Tree, Splay Tree, Treap,
Skip List, **Fibonacci Heap**, **van Emde Boas**, Segment Tree (lazy),
Fenwick Tree, Disjoint Set, Trie, Suffix Tree (Ukkonen),
Hash Map (Robin Hood), **Bloom Filter**, **Count-Min Sketch**,
**HyperLogLog**, LSM Tree, Rope, Lock-Free Deque, Priority Queue (d-ary),
Interval Tree, KD-Tree

### Geometry (14)
Graham Scan, Jarvis March, Chan's Convex Hull, Closest Pair,
Line Intersection, Ear Clipping, Point-in-Polygon, Voronoi (Fortune),
Delaunay (Bowyer-Watson), AABB, GJK, SAT, Bezier, B-Spline

### Machine Learning (10)
**k-Means++**, k-Medoids (PAM), **DBSCAN**, Linear Regression (OLS+SGD),
Logistic Regression, Decision Tree (CART), Random Forest, PCA (power iter),
Cosine Similarity (SIMD), Distance Functions (Euclidean, Manhattan, Hamming)

### Concurrent (8)
Work-Stealing Deque, Michael-Scott Queue, Fair RW-Lock,
Semaphore, Cyclic Barrier, Thread Pool, Actor Model, CAS Utilities

---

## Hardware & Platform Support

| Platform | TS/JS | Rust | Python | Go | PHP | Java | C++ |
|----------|-------|------|--------|-----|-----|------|-----|
| Linux x86_64 (AVX-512) | YES | YES | YES | YES | YES | YES | YES |
| Linux ARM64 (SVE/NEON) | YES | YES | YES | YES | YES | YES | YES |
| macOS Apple Silicon | YES | YES | YES | YES | YES | YES | YES |
| Windows x86_64 | YES | YES | YES | YES | YES | YES | YES |
| Browser (WASM) | YES | YES | Pyodide | — | — | — | YES |
| Embedded no_std (MCU) | — | YES | — | — | — | — | YES |
| Edge (CF Workers, Deno) | YES | WASM | — | — | — | — | — |

---

## Ecosystem Integration

LombokAlgoritma is the **algorithm foundation** of the Lombok Ecosystem:

```
LombokEncryptDecrypt  ──uses──►  LombokAlgoritma (NTT, SHA, modular math)
LombokVector          ──uses──►  LombokAlgoritma (cosine, SIMD dispatch)
LombokSimHash         ──uses──►  LombokAlgoritma (SHA-256, Bloom, FNV-1a)
LombokTableSheet      ──uses──►  LombokAlgoritma (sort, math, string)
LombokRAGFrameworks   ──uses──►  LombokAlgoritma (graph Leiden, ML cluster)
LombokAgenticAuto     ──uses──►  LombokAlgoritma (A*, Dijkstra)
```

```
LombokAlgoritma
    uses ──► LombokECC (verified output API — optional)
    uses ──► LombokFuzzer (continuous fuzz testing)
```

---

## Security

- All cryptographic primitives are **constant-time** (no timing side-channels)
- **dudect** timing distribution test runs in every CI build
- **LombokFuzzer** runs 10-minute fuzz sessions on all parsers in CI
- Zero external dependencies — no supply chain attack surface
- SBOM (SPDX) generated for every release
- Report vulnerabilities: see [SECURITY.md](SECURITY.md)

---

## Standards Compliance

FIPS 180-4 (SHA-2), FIPS 197 (AES), RFC 8439 (ChaCha20),
RFC 9106 (Argon2id), RFC 5869 (HKDF), RFC 7748 (X25519),
IEEE 754-2019, Unicode 15.1, NIST SP 800-131A

---

## License

Apache-2.0 — see [LICENSE](LICENSE).

## Part of Lombok Ecosystem

```
Tier 0: LombokECC, LombokCSS, LombokQRCode, LombokFuzzer
Tier 1: LombokMarkDown, LombokDocx, LombokCSV
Tier 2: LombokAlgoritma (Algorithm Engine), LombokEncryptDecrypt
Tier 3: LombokCharts, LombokTableSheet, LombokVector, LombokSimHash
Tier 4: LombokRAGFrameworks, LombokAgenticAuto, LombokPDF
```

github.com/codinglombok — Apache-2.0
