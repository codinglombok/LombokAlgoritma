// LombokAlgoritma — Number Theoretic Transform (NTT)
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (PQC: Kyber/Dilithium polynomial multiplication)
// NTT = FFT over a prime field — exact integer arithmetic, no floating point

import { modPow } from './modular.js';

// Common NTT-friendly prime: 998244353 = 119 * 2^23 + 1, primitive root g=3
const DEFAULT_MOD = 998244353n;
const DEFAULT_G = 3n;

/** Iterative NTT (forward) */
export function ntt(a: bigint[], mod = DEFAULT_MOD, g = DEFAULT_G): bigint[] {
  const n = a.length;
  const result = [...a];
  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) [result[i], result[j]] = [result[j] as bigint, result[i] as bigint];
  }
  // Cooley-Tukey butterfly
  for (let len = 2; len <= n; len <<= 1) {
    const w = modPow(g, (mod - 1n) / BigInt(len), mod);
    for (let i = 0; i < n; i += len) {
      let wn = 1n;
      for (let j = 0; j < len / 2; j++) {
        const u = result[i + j] as bigint;
        const v = (result[i + j + len / 2] as bigint) * wn % mod;
        result[i + j] = (u + v) % mod;
        result[i + j + len / 2] = (u - v + mod) % mod;
        wn = wn * w % mod;
      }
    }
  }
  return result;
}

/** Inverse NTT */
export function intt(a: bigint[], mod = DEFAULT_MOD, g = DEFAULT_G): bigint[] {
  const result = ntt(a, mod, modPow(g, mod - 2n, mod));
  const nInv = modPow(BigInt(a.length), mod - 2n, mod);
  return result.map(x => x * nInv % mod);
}

/** Polynomial multiplication via NTT */
export function polyMulNTT(a: bigint[], b: bigint[], mod = DEFAULT_MOD): bigint[] {
  let n = 1;
  while (n < a.length + b.length) n <<= 1;
  const fa = [...a, ...new Array(n - a.length).fill(0n)] as bigint[];
  const fb = [...b, ...new Array(n - b.length).fill(0n)] as bigint[];
  const ta = ntt(fa, mod);
  const tb = ntt(fb, mod);
  const tc = ta.map((v, i) => v * (tb[i] as bigint) % mod);
  return intt(tc, mod).slice(0, a.length + b.length - 1);
}
