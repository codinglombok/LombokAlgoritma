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
- Affected component (e.g. `src/math/sha256.ts`, `ports/rust/src/math/`)
- Vulnerability type (timing side-channel, integer overflow, incorrect output, etc.)
- Steps to reproduce
- Proof of concept (if available)
- Proposed fix (if available)

### Response timeline
- Acknowledgment: within 48 hours
- Severity assessment: within 7 days
- Patch release: within 30 days for critical, 90 days for moderate

### Scope
In-scope: cryptographic primitives (constant-time violations), integer overflow, parser crashes,
incorrect algorithm output that affects security-sensitive use cases, supply chain issues.

Out-of-scope: performance improvements, algorithm selection disagreements,
non-security-relevant incorrect output.

## Security Architecture

All cryptographic implementations in LombokAlgoritma follow:
1. **Constant-time** — no secret-dependent branches or memory accesses
2. **Zero external deps** — no supply chain in core
3. **dudect CI** — timing distribution verification on every CI build
4. **LombokFuzzer** — 10-minute fuzz sessions on all parsers in CI
5. **SBOM** — software bill of materials on every release

Acknowledgments for reported vulnerabilities will be credited in CHANGELOG.md
unless the reporter requests otherwise.
