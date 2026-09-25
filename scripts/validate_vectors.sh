#!/usr/bin/env bash
# LombokAlgoritma — Cross-Language Test Vector Validation
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
# Runs every available language against shared JSON test vectors

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
VECTORS_DIR="$ROOT/tests/vectors"
PASS=0; FAIL=0; SKIP=0

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log_pass() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASS++)) || true; }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAIL++)) || true; }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $1"; ((SKIP++)) || true; }

echo "=== LombokAlgoritma — Cross-Language Vector Validation ==="
echo "Vectors: $VECTORS_DIR"
echo ""

# TypeScript (primary reference — must always pass)
if command -v node &>/dev/null; then
  echo "--- TypeScript ---"
  if node --input-type=module << 'JSEOF' 2>/dev/null
    import { execSync } from 'node:child_process';
    execSync('npx vitest run tests/core/vectors.test.ts', { stdio: 'inherit' });
JSEOF
  then log_pass "TypeScript shared vectors"
  else log_fail "TypeScript shared vectors"; fi
else log_skip "TypeScript (node not found)"; fi

# Rust
if command -v cargo &>/dev/null; then
  echo "--- Rust ---"
  if cd "$ROOT/rust" && cargo test --quiet --workspace 2>/dev/null; then
    log_pass "Rust all tests"
  else log_fail "Rust tests"; fi
else log_skip "Rust (cargo not found)"; fi

# Python
if command -v python3 &>/dev/null && [ -d "$ROOT/ports/python" ]; then
  echo "--- Python ---"
  if python3 -m pytest "$ROOT/ports/python/tests" -q --tb=no 2>/dev/null; then
    log_pass "Python all tests"
  else log_fail "Python tests"; fi
else log_skip "Python port (not available)"; fi

# Go
if command -v go &>/dev/null && [ -d "$ROOT/go" ]; then
  echo "--- Go ---"
  if cd "$ROOT/go" && go test ./... -count=1 -q 2>/dev/null; then
    log_pass "Go all tests"
  else log_fail "Go tests"; fi
else log_skip "Go port (not available)"; fi

# PHP
if command -v php &>/dev/null && [ -f "$ROOT/vendor/bin/phpunit" ]; then
  echo "--- PHP ---"
  if cd "$ROOT" && php vendor/bin/phpunit --no-coverage -q 2>/dev/null; then
    log_pass "PHP all tests"
  else log_fail "PHP tests"; fi
else log_skip "PHP port (vendor not installed)"; fi

echo ""
echo "=== Results ==="
echo -e "  ${GREEN}PASS: $PASS${NC}  ${RED}FAIL: $FAIL${NC}  ${YELLOW}SKIP: $SKIP${NC}"
if [ "$FAIL" -gt 0 ]; then echo -e "${RED}VALIDATION FAILED${NC}"; exit 1; fi
echo -e "${GREEN}ALL VALIDATIONS PASSED${NC}"
