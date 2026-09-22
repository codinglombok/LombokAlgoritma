#!/usr/bin/env bash
# LombokAlgoritma — WASM Bundle Builder
# Apache-2.0 — @codinglombok
set -euo pipefail

echo "[WASM] Checking wasm-pack..."
if ! command -v wasm-pack &>/dev/null; then
  echo "[WASM] Installing wasm-pack..."
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

echo "[WASM] Building wasm32 target..."
wasm-pack build ports/rust/wasm \
  --target bundler \
  --out-dir ../../dist/wasm \
  --release \
  -- --features wasm

echo "[WASM] Building WASM SIMD variant..."
RUSTFLAGS="-C target-feature=+simd128" \
wasm-pack build ports/rust/wasm \
  --target bundler \
  --out-dir ../../dist/wasm-simd \
  --release \
  -- --features "wasm,simd"

echo "[WASM] Done. Output: dist/wasm/ and dist/wasm-simd/"
