# Security Policy — LombokAlgoritma

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | YES       |
| < 0.1   | NO        |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: security@codinglombok.dev
GPG: https://codinglombok.dev/gpg-key.asc (fingerprint: published on GitHub)

### What to include
- Affected component (e.g. `src/sort/timsort.ts`, `rust/lombokalgoritma/src/string/`)
- Vulnerability type (timing side-channel, integer overflow, incorrect output, etc.)
- Steps to reproduce
- Proof of concept (if available)
- Proposed fix (if available)

### Response timeline
- Acknowledgment: within 48 hours
- Severity assessment: within 7 days
- Patch release: within 30 days for critical, 90 days for moderate

### Scope
In-scope: integer overflow, decoder/parser crashes (LZ77, RLE, Huffman), algorithmic-complexity DoS,
incorrect algorithm output that affects security-sensitive use cases, supply chain issues.

Out-of-scope: performance improvements, algorithm selection disagreements,
non-security-relevant incorrect output.

## Security Architecture

LombokAlgoritma contains **no cryptography** since v0.2.0 (ADR-016) — SHA-2, HMAC and HKDF moved to
[LombokEncryptDecrypt](https://github.com/codinglombok/LombokEncryptDecrypt). SipHash-2-4 is provided only as a
hash-table PRF, not as a protocol MAC. Safeguards:
1. **Zero runtime dependencies** in every port — no supply chain in the libraries.
2. **Canonical errors** — malformed input is rejected (`INVALID_INPUT`), never partially decoded.
3. **Cross-port vectors** — the same 1059 cases run in five languages on every CI build.
4. **Audits** — npm audit, cargo audit, govulncheck, pip-audit, composer audit, CodeQL; SBOM on `main`.

Acknowledgments for reported vulnerabilities will be credited in CHANGELOG.md
unless the reporter requests otherwise.
