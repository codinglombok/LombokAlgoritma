// LombokAlgoritma — Pollard's Rho Factorization
// Apache-2.0 — @codinglombok
// Expected O(n^(1/4)) — fast for medium-sized composites

import { gcd } from './gcd.js';
import { isPrime } from './miller-rabin.js';

function f(x: bigint, c: bigint, n: bigint): bigint {
  return (x * x + c) % n;
}

/** Pollard's rho — returns a non-trivial factor of n */
export function pollardRho(n: bigint): bigint {
  if (n % 2n === 0n) return 2n;
  let x = 2n;
  let y = 2n;
  let c = 1n;
  let d = 1n;
  while (d === 1n) {
    x = f(x, c, n);
    y = f(f(y, c, n), c, n);
    d = gcd(x > y ? x - y : y - x, n);
  }
  if (d !== n) return d;
  // Retry with different c
  c = 2n;
  x = 2n;
  y = 2n;
  d = 1n;
  while (d === 1n) {
    x = f(x, c, n);
    y = f(f(y, c, n), c, n);
    d = gcd(x > y ? x - y : y - x, n);
  }
  return d;
}

/** Full factorization into prime factors */
export function factorize(n: bigint): bigint[] {
  if (n <= 1n) return [];
  if (isPrime(n)) return [n];
  const d = pollardRho(n);
  return [...factorize(d), ...factorize(n / d)].sort((a, b) => (a < b ? -1 : 1));
}
