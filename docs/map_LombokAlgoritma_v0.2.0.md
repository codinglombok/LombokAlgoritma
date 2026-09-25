# LombokAlgoritma — Map v0.2.0

## Posisi di ekosistem

```
L0  LombokAlgoritma ──┬──► LombokVector (cosine, L2, dot)
                      ├──► LombokSimHash (FNV-1a, MurmurHash3, HyperLogLog, Bloom)
                      ├──► LombokTableSheet (levenshtein, sort)
                      ├──► LombokLeiden   (Tarjan SCC, PageRank, disjoint set)
                      └──► LombokGraphDB  (Dijkstra, A*, Bellman–Ford, Dinic, matching)
     kripto ✗ ──────────► LombokEncryptDecrypt (ADR-016)
```

## Peta algoritma × port (v0.2.0)

| Modul | TS | Rust | Go | Python | PHP | Java | Kotlin | C# | C++ | Swift | Perl | SQL |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| sort | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| search | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | — | 🟡 |
| math | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | 🟡 | 🟡 |
| string + hash | ✅ | ✅ | ✅ | ✅ | ✅ | — | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| datastructure | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | 🟡 | — | — |
| graph | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| ml | ✅ | ✅ | ✅ | ✅ | ✅ | — | 🟡 | 🟡 | 🟡 | 🟡 | — | 🟡 |
| geometry | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| compression | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |
| rng | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | — | — |

✅ lulus vector v1 byte-identik · 🟡 sebagian (kode ada; test sendiri, SQL tanpa test) · — belum ada. Angka pasti per port: tabel
status README (dihasilkan `scripts/count_algorithms.ts`).

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*
