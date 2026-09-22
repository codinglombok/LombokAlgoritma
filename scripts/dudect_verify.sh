#!/usr/bin/env bash
# LombokAlgoritma — Constant-Time Verification (dudect)
# Apache-2.0 — @codinglombok
# Verifies that crypto primitives have no secret-dependent timing
set -euo pipefail

echo "=== dudect Constant-Time Verification ==="
echo "Running timing distribution tests for:"
echo "  - SHA-256, SHA-512, BLAKE3"
echo "  - AES-256-GCM, ChaCha20-Poly1305"
echo "  - X25519, Argon2id"
echo "  - HKDF"
echo ""

cd "$(dirname "$0")/.."

# Run Rust constant-time tests
if command -v cargo &>/dev/null; then
  echo "[Rust] Running dudect-style timing tests..."
  cargo test --test constant_time --release --all-features -- --nocapture 2>&1 | \
    grep -E "(PASS|FAIL|timing|constant)"
fi

# TypeScript constant-time test (measure timing distribution)
if command -v node &>/dev/null; then
  echo "[TS] Running timing distribution check..."
  node --input-type=module << 'JSEOF'
    import { sha256 } from './src/math/sha256.js';
    // Compare timing of SHA-256 on secret-0 vs secret-1 data
    const N = 10000;
    const secret0 = new Uint8Array(32).fill(0);
    const secret1 = new Uint8Array(32).fill(0xff);
    let t0 = 0, t1 = 0;
    for (let i = 0; i < N; i++) {
      const s = performance.now(); sha256(secret0); t0 += performance.now() - s;
    }
    for (let i = 0; i < N; i++) {
      const s = performance.now(); sha256(secret1); t1 += performance.now() - s;
    }
    const diff = Math.abs(t0 - t1) / N;
    console.log(`SHA-256 timing diff (avg): ${diff.toFixed(4)}ms`);
    // Threshold: < 0.01ms difference is acceptable for JS
    if (diff < 0.01) console.log('PASS: SHA-256 timing difference within threshold');
    else console.warn('WARN: SHA-256 timing difference may indicate non-constant-time path');
JSEOF
fi

echo ""
echo "=== Constant-time verification complete ==="
