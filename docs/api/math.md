# LombokAlgoritma — Math API Reference

## Cryptographic Primitives (constant-time)

> **All crypto functions in this module are constant-time** — no secret-dependent
> branches or memory accesses. For production cryptographic use, prefer the
> **Rust WASM bundle** which has stronger JIT-invariance guarantees.

### `sha256(input)` / `sha256hex(input)`
SHA-256 (FIPS 180-4). Returns 32-byte `Uint8Array` or hex string.

```typescript
sha256hex('')       // 'e3b0c44...' (NIST vector)
sha256hex('abc')    // 'ba7816bf...'
sha256(new Uint8Array([0x61,0x62,0x63]))  // Uint8Array[32]
```

### `hmacSha256(key, data)`
HMAC-SHA-256. Returns 32-byte `Uint8Array`.

### `hkdf(ikm, length, options?)`
HKDF-SHA-256 (RFC 5869). Key derivation.

```typescript
hkdf(ikm, 32, { salt, info })  // Uint8Array[32]
```

### `argon2id(password, salt, options?)`
Argon2id (RFC 9106). Password hashing. Memory-hard.

### `aesGcmEncrypt(key, iv, plaintext)` / `aesGcmDecrypt(key, iv, ciphertext)`
AES-256-GCM (FIPS 197 + NIST SP 800-38D). AEAD encryption.

### `chaCha20Poly1305Encrypt(key, nonce, plaintext)` / `...Decrypt`
ChaCha20-Poly1305 (RFC 8439). AEAD encryption.

### `x25519(privateKey, publicKey)`
X25519 ECDH key exchange (RFC 7748). Returns 32-byte shared secret.

---

## Number Theory

### `gcd(a, b)` / `gcdNum(a, b)`
Greatest common divisor via binary GCD. `bigint` or `number`.

### `lcm(a, b)` / `lcmNum(a, b)`
Least common multiple.

### `extendedGcd(a, b)`
Returns `{ g, x, y }` where `a*x + b*y = g = gcd(a,b)`.

### `modInverse(a, m)`
Modular multiplicative inverse `a^(-1) mod m`. Throws if no inverse.

### `modPow(base, exp, m)`
Fast modular exponentiation `base^exp mod m`. O(log exp).

### `crt(remainders, moduli)`
Chinese Remainder Theorem.

### `isPrime(n)` / `nextPrime(n)`
Deterministic Miller-Rabin primality test (n < 3.3×10²⁴).

### `sieve(n)` / `segmentedSieve(lo, hi)`
Sieve of Eratosthenes.

### `pollardRho(n)` / `factorize(n)`
Integer factorization.

---

## Numerical Algorithms

### `fft(arr, inverse?)` — Cooley-Tukey FFT
### `ntt(a, mod, g)` / `intt(a, mod, g)` / `polyMulNTT(a, b)` — Number Theoretic Transform
### `karatsuba(x, y)` — Big integer multiplication O(n^1.585)
### `strassenMul(A, B)` — Matrix multiply O(n^2.807)
### `matMul(A, B)` — Standard O(n³) matrix multiply
### `newtonRaphson(f, df, x0)` — Root finding
### `bisection(f, lo, hi)` — Root finding (bracketing)
### `rk4(f, y0, t0, t1, h)` — Runge-Kutta 4th order ODE solver
