// LombokAlgoritma — Pollard's Rho Factorization
// Apache-2.0 — @codinglombok
// Expected O(n^(1/4)) — fast for medium-sized composites

import { InvalidInputError } from '../core/errors.js';
import { gcd } from './gcd.js';
import { isPrime } from './miller-rabin.js';

function f(x: bigint, c: bigint, n: bigint): bigint {
  return (x * x + c) % n;
}

/**
 * Pollard's rho (Floyd cycle detection) — returns a non-trivial factor of a composite `n`.
 *
 * v0.1.0 tried only c = 1 and c = 2 and could return `n` itself (e.g. n = 9, 25, 49), which made
 * `factorize` recurse forever. Now c runs 1, 2, 3, … until a proper factor appears; the sequence
 * is deterministic (x₀ = 2) so every port finds the same factor.
 *
 * @throws RangeError when n < 4 or n is prime (no non-trivial factor exists)
 */
export function pollardRho(n: bigint): bigint {
  if (n < 4n || isPrime(n)) throw new InvalidInputError('pollardRho: n must be composite');
  if (n % 2n === 0n) return 2n;
  for (let c = 1n; ; c++) {
    let x = 2n;
    let y = 2n;
    let d = 1n;
    while (d === 1n) {
      x = f(x, c, n);
      y = f(f(y, c, n), c, n);
      d = gcd(x > y ? x - y : y - x, n);
    }
    if (d !== n) return d;
  }
}

const SMALL_PRIMES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];

/** Prime factorisation in ascending order, with multiplicity (n ≤ 1 → []). */
export function factorize(n: bigint): bigint[] {
  if (n < 0n) n = -n;
  const out: bigint[] = [];
  for (const p of SMALL_PRIMES) {
    while (n % p === 0n) {
      out.push(p);
      n /= p;
    }
  }
  const stack = n > 1n ? [n] : [];
  while (stack.length > 0) {
    const m = stack.pop() as bigint;
    if (isPrime(m)) {
      out.push(m);
      continue;
    }
    const d = pollardRho(m);
    stack.push(d, m / d);
  }
  return out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
