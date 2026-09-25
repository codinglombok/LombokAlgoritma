# LombokAlgoritma — How to Dist v0.2.0

## 1. Registry (otomatis lewat release-please)

| Tag | Target | Job | Rahasia |
|---|---|---|---|
| `v0.2.0` | npm `lombokalgoritma` (provenance) | publish.yml → npm (`typescript/`) | `NPM_TOKEN` |
| `v0.2.0` | PyPI `lombokalgoritma` | publish.yml → pypi (`python/`, OIDC env `pypi`) | — |
| `v0.2.0` | Packagist `codinglombok/lombokalgoritma` | publish.yml → packagist (hook) | `PACKAGIST_USERNAME`, `PACKAGIST_TOKEN` |
| `rust-v0.2.0` | crates.io `lombokalgoritma`, `-capi`, `-wasm` | publish.yml → crates | `CARGO_REGISTRY_TOKEN` |
| `go/v0.2.0` | proxy.golang.org / pkg.go.dev | publish.yml → go (warm-up) | — |

Alur: merge PR ber-judul Conventional Commit → release-please membuka PR rilis → merge PR rilis → tag + GitHub
Release → publish. Versi selalu diambil dari tag (ADR-011); job memeriksa `package.json`/`Cargo.toml`/wheel = tag.

## 2. Manual (darurat)

```powershell
git tag v0.2.0; git push origin v0.2.0
gh workflow run publish.yml -f tag=v0.2.0 -f targets=npm,pypi,packagist
git tag go/v0.2.0; git push origin go/v0.2.0
```

## 3. Artefak lain

| Artefak | Perintah |
|---|---|
| WASM (bundler) | `bash scripts/build_wasm.sh` → `dist/wasm`, `dist/wasm-simd` |
| C static/shared lib | `cd rust && cargo build -p lombokalgoritma-capi --release` → `target/release/liblombokalgoritma_capi.{a,so}` + header |
| Firmware MCU | `cargo build -p lombokalgoritma --no-default-features --target thumbv7em-none-eabihf --profile embedded` |
| CDN (ESM) | `https://cdn.jsdelivr.net/npm/lombokalgoritma@0.2.0/dist/esm/index.js` |
| JSR/Deno | `typescript/jsr.json` (`deno publish` dari `typescript/`) |

## 4. Server / Docker / shared host

Library murni tanpa layanan: cukup dipasang sebagai dependensi aplikasi (npm/pip/composer/go/cargo). Untuk shared
host PHP: `composer install --no-dev` di lokal lalu unggah `vendor/`; wajib ext-gmp & ext-mbstring.

*Lisensi dokumen: Apache-2.0 OR MIT · © codinglombok*
