# Upgrading LombokAlgoritma

## 0.1.x → 0.2.0

v0.2.0 is a breaking release. The normative behaviour of every function is now defined by
[`docs/SPEC_LombokAlgoritma_v0.2.0.md`](docs/SPEC_LombokAlgoritma_v0.2.0.md).

### 1. Cryptography was removed → LombokEncryptDecrypt

| Removed (all ports) | Replacement |
|---|---|
| `sha256`, `sha256hex` / `sha256_hex` / `SHA256Hex` | `lombokencryptdecrypt` SHA-256 (`hash.sha256`) |
| `hmacSha256` / `hmac_sha256` / `HMACSHA256` | `lombokencryptdecrypt` HMAC-SHA-256 |
| `hkdf`, `hkdfExtract`, `hkdfExpand` | `lombokencryptdecrypt` HKDF (RFC 5869) |
| `import … from 'lombokalgoritma/crypto'` | `import … from 'lombokencryptdecrypt'` |

Non-cryptographic hashes remain: FNV-1a 32/64, MurmurHash3, xxHash32 and the new xxHash64 and
SipHash-2-4 (TypeScript `lombokalgoritma/string`, source `typescript/src/string/hash/`).

### 2. Errors have canonical codes

```ts
// before
try { dijkstra(g, 0); } catch (e) { if (e instanceof RangeError) … }
// after
import { AlgoError, dijkstra } from 'lombokalgoritma';
try { dijkstra(g, 0); } catch (e) { if (e instanceof AlgoError && e.code === 'NEGATIVE_WEIGHT') … }
```

Codes: `INVALID_INPUT`, `OUT_OF_RANGE`, `EMPTY_INPUT`, `NEGATIVE_WEIGHT`, `NO_INVERSE`, `NOT_COPRIME`,
`OVERFLOW`, `OUT_OF_BOUNDS`, `UNSUPPORTED` (SPEC §2). Rust: `Error::code()`; Go: `*Error.Code` and
`errors.Is(err, la.ErrOutOfRange)`; Python: `AlgoError.code` (subclass of `ValueError`); PHP:
`AlgoException::getErrorCode()`.

### 3. Strings are code points

`kmpSearch`, `levenshtein`, `damerauLevenshtein`, `jaro`, `jaroWinkler`, `AhoCorasick` and `polynomialHash`
count Unicode code points: `levenshtein('😀', 'a')` is 1 (was 2 in TS), `kmpSearch` returns code-point
offsets (Go returned byte offsets).

### 4. Smaller API changes

| Area | 0.1.x | 0.2.0 |
|---|---|---|
| Geometry | `convexHullGraham` | `convexHull` (old name kept as deprecated alias until 0.3.0); `< 3` points are returned sorted |
| Compression | `huffmanEncode → {encoded, tree}` | adds `bitLength`, `codes`; new `huffmanDecode`; `rleDecode`/`lz77Decompress` throw `INVALID_INPUT` on malformed input |
| Bloom filter | `new BloomFilter(n, p)` only | `BloomFilter.withParams(m, k)` is portable across languages; `(n, p)` sizing uses `ln` and is not |
| ML | `batchCosine` could yield `NaN` | zero vectors score 0; ties by index; `kmeans().iterations` = iterations performed |
| Math | `modPow(-2n, 3n, 5n) = -3n` | `2n`; `m < 1` or `exp < 0` throws `OUT_OF_RANGE` |
| Go | `int` math API, `RadixSortLSD([]int)` | `int64` math API returning `(T, error)`; `RadixSortLSD([]int64)`; `BatchCosine → []ScoredIndex` |
| Rust | `lcm → Option<u64>` | exact `u128`; `mod_pow`/`mod_inverse → Result`; `radix_sort_lsd(&mut [i64])` (old: `radix_sort_lsd_u32`) |

### 5. Repository layout

Sources moved from `src/`, `ports/<lang>/` and root manifests to one folder per language
(`typescript/ rust/ go/ python/ php/ …`). Package names and registries are unchanged; the Go module path
stays `github.com/codinglombok/lombokalgoritma/go` (tags `go/vX.Y.Z`).
