// LombokAlgoritma — Math Module Tests
// Apache-2.0 — @codinglombok

import { describe, expect, it } from 'vitest';
import { extendedGcd, gcd, lcm, modInverse } from '../src/math/gcd.js';
import { isPrime, nextPrime } from '../src/math/miller-rabin.js';
import { crt, modPow } from '../src/math/modular.js';
import { sieve } from '../src/math/sieve.js';

// NIST test vectors for SHA-256
describe('GCD & LCM', () => {
  it('gcd(12, 8) = 4', () => {
    expect(gcd(12n, 8n)).toBe(4n);
  });
  it('gcd(0, 5) = 5', () => {
    expect(gcd(0n, 5n)).toBe(5n);
  });
  it('gcd(1, n) = 1', () => {
    expect(gcd(1n, 999n)).toBe(1n);
  });
  it('lcm(4, 6) = 12', () => {
    expect(lcm(4n, 6n)).toBe(12n);
  });
  it('extended gcd', () => {
    const { g, x, y } = extendedGcd(35n, 15n);
    expect(g).toBe(5n);
    expect(35n * x + 15n * y).toBe(5n);
  });
  it('modInverse(3, 11) = 4', () => {
    expect(modInverse(3n, 11n)).toBe(4n);
  });
});

describe('Modular arithmetic', () => {
  it('modPow(2, 10, 1000) = 24', () => {
    expect(modPow(2n, 10n, 1000n)).toBe(24n);
  });
  it('modPow(base, 0, m) = 1', () => {
    expect(modPow(7n, 0n, 13n)).toBe(1n);
  });
  it('CRT', () => {
    // x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7) → x = 23
    const x = crt([2n, 3n, 2n], [3n, 5n, 7n]);
    expect(x).toBe(23n);
    expect(x % 3n).toBe(2n);
    expect(x % 5n).toBe(3n);
    expect(x % 7n).toBe(2n);
  });
});

describe('Miller-Rabin primality', () => {
  it('2 is prime', () => {
    expect(isPrime(2n)).toBe(true);
  });
  it('3 is prime', () => {
    expect(isPrime(3n)).toBe(true);
  });
  it('4 is not prime', () => {
    expect(isPrime(4n)).toBe(false);
  });
  it('97 is prime', () => {
    expect(isPrime(97n)).toBe(true);
  });
  it('100 is not prime', () => {
    expect(isPrime(100n)).toBe(false);
  });
  it('large prime 2^31 - 1', () => {
    expect(isPrime(2147483647n)).toBe(true);
  });
  it('nextPrime(10) = 11', () => {
    expect(nextPrime(10n)).toBe(11n);
  });
});

describe('Sieve of Eratosthenes', () => {
  it('primes to 10', () => {
    expect(sieve(10)).toEqual([2, 3, 5, 7]);
  });
  it('primes to 2', () => {
    expect(sieve(2)).toEqual([2]);
  });
  it('primes to 1', () => {
    expect(sieve(1)).toEqual([]);
  });
  it('count primes to 100 = 25', () => {
    expect(sieve(100)).toHaveLength(25);
  });
});
