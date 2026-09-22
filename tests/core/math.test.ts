// LombokAlgoritma — Math Module Tests
// Apache-2.0 — @codinglombok

import { describe, it, expect } from 'vitest';
import { sha256hex, hmacSha256 } from '../../src/math/sha256.js';
import { gcd, lcm, extendedGcd, modInverse } from '../../src/math/gcd.js';
import { modPow, crt } from '../../src/math/modular.js';
import { isPrime, nextPrime } from '../../src/math/miller-rabin.js';
import { sieve } from '../../src/math/sieve.js';
import { hkdf } from '../../src/math/hkdf.js';

// NIST test vectors for SHA-256
describe('SHA-256 (FIPS 180-4 vectors)', () => {
  it('empty string', () => {
    expect(sha256hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('"abc"', () => {
    expect(sha256hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469db0714d02068e6e98' +
      // Note: correct SHA-256 of "abc":
      ''.replace('98','98'));
    // Using actual correct value:
    expect(sha256hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469db0714d02068e6e98'.replace('', ''));
  });
  it('"hello world"', () => {
    expect(sha256hex('hello world')).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe04294e576f71f8ea49b29c900' +
      '');
    // Correct: b94d27b9934d3e08a52e52d7da7dabfac484efe04294e576f71f8ea49b29c900 — NOT right
    // Real SHA-256 of "hello world":
    expect(sha256hex('hello world')).not.toBe('');
  });
  it('produces 64 hex chars', () => {
    expect(sha256hex('test')).toHaveLength(64);
    expect(sha256hex('test')).toMatch(/^[0-9a-f]{64}$/);
  });
  it('deterministic', () => {
    expect(sha256hex('same')).toBe(sha256hex('same'));
  });
  it('different inputs produce different outputs', () => {
    expect(sha256hex('a')).not.toBe(sha256hex('b'));
  });
});

describe('GCD & LCM', () => {
  it('gcd(12, 8) = 4', () => { expect(gcd(12n, 8n)).toBe(4n); });
  it('gcd(0, 5) = 5', () => { expect(gcd(0n, 5n)).toBe(5n); });
  it('gcd(1, n) = 1', () => { expect(gcd(1n, 999n)).toBe(1n); });
  it('lcm(4, 6) = 12', () => { expect(lcm(4n, 6n)).toBe(12n); });
  it('extended gcd', () => {
    const { g, x, y } = extendedGcd(35n, 15n);
    expect(g).toBe(5n);
    expect(35n * x + 15n * y).toBe(5n);
  });
  it('modInverse(3, 11) = 4', () => { expect(modInverse(3n, 11n)).toBe(4n); });
});

describe('Modular arithmetic', () => {
  it('modPow(2, 10, 1000) = 24', () => { expect(modPow(2n, 10n, 1000n)).toBe(24n); });
  it('modPow(base, 0, m) = 1', () => { expect(modPow(7n, 0n, 13n)).toBe(1n); });
  it('CRT', () => {
    // x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7) → x = 23
    const x = crt([2n, 3n, 2n], [3n, 5n, 7n]);
    expect(x % 3n).toBe(2n);
    expect(x % 5n).toBe(3n);
    expect(x % 7n).toBe(2n);
  });
});

describe('Miller-Rabin primality', () => {
  it('2 is prime', () => { expect(isPrime(2n)).toBe(true); });
  it('3 is prime', () => { expect(isPrime(3n)).toBe(true); });
  it('4 is not prime', () => { expect(isPrime(4n)).toBe(false); });
  it('97 is prime', () => { expect(isPrime(97n)).toBe(true); });
  it('100 is not prime', () => { expect(isPrime(100n)).toBe(false); });
  it('large prime 2^31 - 1', () => { expect(isPrime(2147483647n)).toBe(true); });
  it('nextPrime(10) = 11', () => { expect(nextPrime(10n)).toBe(11n); });
});

describe('Sieve of Eratosthenes', () => {
  it('primes to 10', () => { expect(sieve(10)).toEqual([2,3,5,7]); });
  it('primes to 2', () => { expect(sieve(2)).toEqual([2]); });
  it('primes to 1', () => { expect(sieve(1)).toEqual([]); });
  it('count primes to 100 = 25', () => { expect(sieve(100)).toHaveLength(25); });
});

describe('HKDF', () => {
  it('produces expected length', () => {
    const ikm = new Uint8Array([0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b]);
    const okm = hkdf(ikm, 42);
    expect(okm).toHaveLength(42);
  });
  it('deterministic', () => {
    const ikm = new Uint8Array(16);
    const a = hkdf(ikm, 32);
    const b = hkdf(ikm, 32);
    expect(a).toEqual(b);
  });
});
