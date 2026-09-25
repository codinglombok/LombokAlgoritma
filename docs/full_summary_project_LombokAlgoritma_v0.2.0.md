# LombokAlgoritma — Full Summary Project v0.2.0

| Item | Nilai |
|---|---|
| Deskripsi | Pustaka algoritma deterministik, zero-dependency, multi-bahasa (Lombok Ecosystem, cluster 00.02, L0) |
| Referensi | TypeScript (`typescript/`) — 99 algoritma di 10 modul (angka dari `scripts/count_algorithms.ts`) |
| Port conformant | Rust, Python, Go, PHP — 92/92 kelompok vector, keluaran byte-identik |
| Port sekunder | Java, Kotlin, C#, C++, Swift, Perl, SQL (🟡) |
| Vector | 92 kelompok · 1059 kasus · SHA-256 `52f0df24…7e34` |
| Test | TS 220 (coverage baris 99 %) · Rust 65 · Go (coverage 99,7 % paket library) · Python 93 (99,6 %) · PHP 54 (98,1 %) |
| Lint | tsc 0 error · biome 0 error · eslint 0 error · clippy -D warnings bersih · gofmt/vet bersih · ruff + mypy --strict bersih · phpcs PSR-12 + PHPStan level 9 bersih |
| Registry | npm, crates.io, PyPI, Packagist, Go proxy (release-please: `v*`, `rust-v*`, `go/v*`) |
| Lisensi | Apache-2.0 OR MIT |

## Ukuran kode (baris, v0.2.0)

| Port | Sumber | Test |
|---|---:|---:|
| TypeScript | 4 136 | 1 931 |
| Rust (inti + runner) | 6 276 + 1 438 | (di dalam sumber) |
| Go | 6 073 (termasuk test & runner) | — |
| Python | 3 682 | 765 |
| PHP | 5 850 | 403 |
| Java · Kotlin · C# · C++ · Swift · Perl · SQL | 41 · 199 · 297 · 366 · 373 · 213 · 130 | — |

## Keputusan penting v0.2.0

Kripto dihapus (ADR-016) · SPEC normatif + vector bersama (ADR-015) · string = code point · error kanonik ·
Huffman/Bloom/k-means deterministik lintas bahasa · graf untuk LombokLeiden & LombokGraphDB.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*
