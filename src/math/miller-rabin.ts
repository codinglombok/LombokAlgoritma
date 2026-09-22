// LombokAlgoritma — Miller-Rabin Primality Test
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (RSA prime generation)
// Deterministic for n < 3,317,044,064,679,887,385,961,981 (15 witnesses)

import { modPow } from './modular.js';

const DETERMINISTIC_WITNESSES: bigint[] = [
  2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n,
];

/** Deterministic Miller-Rabin for n < 3.3×10²⁴ */
export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n || n === 5n || n === 7n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  // Write n-1 as 2^r * d
  let d = n - 1n, r = 0n;
  while (d % 2n === 0n) { d /= 2n; r++; }

  for (const a of DETERMINISTIC_WITNESSES) {
    if (a >= n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let i = 0n; i < r - 1n; i++) {
      x = x * x % n;
      if (x === n - 1n) { composite = false; break; }
    }
    if (composite) return false;
  }
  return true;
}

/** Find next prime >= n */
export function nextPrime(n: bigint): bigint {
  if (n <= 2n) return 2n;
  let candidate = n % 2n === 0n ? n + 1n : n;
  while (!isPrime(candidate)) candidate += 2n;
  return candidate;
}
