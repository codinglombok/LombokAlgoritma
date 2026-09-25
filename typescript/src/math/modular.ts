// LombokAlgoritma — Modular Arithmetic
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (RSA modexp, ECC field arithmetic)

import { InvalidInputError, NotCoprimeError, OutOfRangeError } from '../core/errors.js';
/**
 * base^exp mod m in [0, m) by right-to-left square-and-multiply — O(log exp). A negative base is
 * reduced into [0, m) first (v0.1.x returned negative results for it).
 *
 * @throws OutOfRangeError when m < 1 or exp < 0
 */
export function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m < 1n || exp < 0n) throw new OutOfRangeError('modPow: need m ≥ 1 and exp ≥ 0');
  if (m === 1n) return 0n;
  let result = 1n;
  base = ((base % m) + m) % m;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % m;
    exp >>= 1n;
    base = (base * base) % m;
  }
  return result;
}

/** Modular addition — avoids overflow */
export function modAdd(a: bigint, b: bigint, m: bigint): bigint {
  return (a + b) % m;
}

/** Modular subtraction */
export function modSub(a: bigint, b: bigint, m: bigint): bigint {
  return (((a - b) % m) + m) % m;
}

/** Modular multiplication — safe for large primes */
export function modMul(a: bigint, b: bigint, m: bigint): bigint {
  return (a * b) % m;
}

/**
 * Chinese Remainder Theorem: find the unique x in [0, M) with x ≡ r_i (mod m_i),
 * where M = Π m_i. Moduli must be pairwise coprime.
 *
 * Uses the inverse of M_i = M / m_i modulo m_i. With extendedGcd(M_i, m_i) giving
 * M_i·x + m_i·y = 1, that inverse is the coefficient `x` of M_i (not `y`).
 */
export function crt(remainders: bigint[], moduli: bigint[]): bigint {
  if (remainders.length !== moduli.length) {
    throw new InvalidInputError('crt: remainders and moduli must have equal length');
  }
  const M = moduli.reduce((a, b) => a * b, 1n);
  let x = 0n;
  for (let i = 0; i < remainders.length; i++) {
    const mi = moduli[i] as bigint;
    const Mi = M / mi;
    const { g, x: inv } = extendedGcdLocal(Mi % mi, mi);
    if (g !== 1n && g !== -1n) throw new NotCoprimeError('crt: moduli must be pairwise coprime');
    const invMi = ((inv % mi) + mi) % mi;
    const ri = (((remainders[i] as bigint) % mi) + mi) % mi;
    x = (x + ((ri * Mi) % M) * invMi) % M;
  }
  return ((x % M) + M) % M;
}

function extendedGcdLocal(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const { g, x: x1, y: y1 } = extendedGcdLocal(b, a % b);
  return { g, x: y1, y: x1 - (a / b) * y1 };
}
