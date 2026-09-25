# LombokAlgoritma — Architecture v0.2.0

## 1. Gambaran

```
                      docs/SPEC_LombokAlgoritma_v0.2.0.md   (normatif)
                                     │
        typescript/ (referensi) ──► typescript/scripts/generate-vectors.ts
                                     │
                          vectors/lombokalgoritma-vectors-v1.json  (+ SHA256SUMS)
             ┌──────────────┬────────┼──────────┬──────────────┐
         TS runner      Rust runner  Python runner  Go runner   PHP runner
     (vitest + CLI)  (-vectors crate) (_vectors.py) (cmd/vectors) (bin/vectors.php)
             └──────────────┴────────┴──────────┴──────────────┘
                       out/<port>.txt  →  CI job vectors-crosscheck (cmp)
```

## 2. Modul (sama di semua port conformant)

| Modul | Isi | Catatan desain |
|---|---|---|
| core | error kanonik, min-heap berkunci tuple, PRNG (SplitMix64, xoshiro256++, PCG32), helper bit/int | heap total-order → urutan pop identik lintas bahasa |
| sort | quicksort, timsort, mergesort, heapsort, radix LSD, counting | stabil: timsort/mergesort/radix/counting |
| search | 9 varian | algoritma probing normatif (duplikat) |
| math | gcd…crt, Miller–Rabin, sieve, Pollard rho, Karatsuba, NTT, matriks | bigint/i128; pembagian terpotong |
| string | KMP, edit distance, Jaro(-Winkler), Aho–Corasick, polynomial hash; `hash/` FNV-1a, Murmur3, xxHash32/64, SipHash-2-4 | code point; hash atas UTF-8 |
| datastructure | Bloom, HyperLogLog, disjoint set, Fenwick, segment tree | Bloom `withParams` portabel; HLL fmix32 |
| graph | 13 algoritma, satu berkas per algoritma | urutan edge-list, heap berkunci tuple |
| ml | jarak/similaritas, k-means++ | penjumlahan kiri-ke-kanan, jarak kuadrat eksak |
| geometry | 5 algoritma, satu berkas per algoritma | tanpa `hypot` |
| compression | RLE, LZ77, Huffman (+decode) | Huffman `(freq,id)` deterministik |
| hardware, concurrent | TS saja | tidak normatif |

## 3. Keputusan (ADR lokal)

| ID | Keputusan | Alasan |
|---|---|---|
| LA-1 | JSON kanonik + format angka ECMAScript (dengan `-0`) | satu format keluaran yang bisa dibandingkan dengan `cmp` |
| LA-2 | Error sebagai kode string kanonik | lintas bahasa, bebas locale |
| LA-3 | String = code point | konsisten di JS (UTF-16), Go (byte), Rust/Python/PHP |
| LA-4 | Rust `no_std` + `alloc`, sqrt perangkat lunak bit-exact | embedded (thumbv7em) & wasm32 |
| LA-5 | Runner Rust di crate terpisah (`publish = false`) tanpa dependensi | crate inti tetap zero-dep |
| LA-6 | Go: FMA diblok dengan konversi `float64(…)` eksplisit | spesifikasi Go mengizinkan fusi |

## 4. Tingkat ekosistem

L0 — tidak bergantung library Lombok lain. Dipakai oleh L1+ (Vector, SimHash, TableSheet, Leiden, GraphDB).
C ABI (`lombokalgoritma-capi`) dan WASM (`lombokalgoritma-wasm`) memberi akses dari C/C++/JS tanpa port ulang.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*
