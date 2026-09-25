# LombokAlgoritma — Development Ide v0.2.0

## 1. Lingkungan

| Bahasa | Versi | Alat |
|---|---|---|
| TypeScript | Node ≥ 20 | npm, tsup, vitest, biome, eslint (`cd typescript`) |
| Rust | stable (MSRV 1.75) | cargo fmt/clippy; target thumbv7em-none-eabihf, wasm32-unknown-unknown |
| Go | ≥ 1.21 | gofmt, go vet, golangci-lint (config v1 → perlu migrasi ke v2) |
| Python | ≥ 3.10 | ruff, mypy --strict, pytest + pytest-cov |
| PHP | ≥ 8.2 + gmp, mbstring | composer, phpunit 11, phpstan 9, phpcs PSR-12 |

Di Windows (PowerShell) semua perintah sama; gunakan `;` sebagai pemisah perintah. `make` opsional.

## 2. Alur kerja menambah algoritma

1. Tulis referensi TS di `typescript/src/<modul>/<algoritma>.ts` + test.
2. Tulis definisi normatif di `docs/SPEC_…` (urutan evaluasi float, tie-breaking, error code).
3. Tambah entri di `typescript/tests/vectors/dispatch.ts` dan kasus di `scripts/generate-vectors.ts`;
   `npm run vectors:generate`; perbarui `vectors/SHA256SUMS` dan hash di SPEC.
4. Implementasikan di Rust/Python/Go/PHP + entri dispatch runner masing-masing.
5. `make vectors-crosscheck` → lima hash identik. `npm run counts` memperbarui README.

## 3. Arah pengembangan

- Port Java/Kotlin/C#/C++/Swift ke vector v1 (runner + CI blocking).
- Primitif Leiden (modularity delta, refinement), min-cost max-flow, suffix array/SA-IS, Z-function.
- Benchmark lintas port (`vitest bench`, criterion, `go test -bench`, pytest-benchmark).
- `messageId` + katalog LombokLocale (Lang_ §2).
- Fuzzing diferensial: bandingkan 5 port pada masukan acak (PCG32) di CI terjadwal.

## 4. Catatan portabilitas yang sudah dipelajari

- FMA: Go boleh memfusi `a*b+c` — bungkus dengan `float64()`. Rust/TS/Python/PHP tidak memfusi.
- `-0`: parser JSON Python/PHP/Go mengubah token `-0` menjadi integer 0 — runner memakai teks mentah atau parser khusus.
- PHP `int` overflow menjadi float — hash 64-bit memakai aritmetika 32-bit terpisah / GMP.
- Rust `no_std` pada 1.75 tidak punya `f64::sqrt` di core — sqrt perangkat lunak bit-exact di `num.rs`.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*
