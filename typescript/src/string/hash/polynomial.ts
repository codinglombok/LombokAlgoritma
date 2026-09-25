// LombokAlgoritma — Polynomial rolling hash
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

/**
 * Polynomial rolling hash h = Σ (cp(sᵢ) − 96)·baseⁿ⁻¹⁻ⁱ mod `mod`, always in [0, mod), over Unicode
 * code points (SPEC §5.1; v0.1.x used UTF-16 units). Evaluated by Horner's rule with the
 * intermediate reduced into [0, mod) after every step; `(mod − 1)·base + 0x10FFFF` must stay below
 * 2^53.
 */
export function polynomialHash(s: string, base = 31, mod = 1_000_000_007): number {
  let h = 0;
  for (const ch of s) {
    h = (((h * base + ((ch.codePointAt(0) as number) - 96)) % mod) + mod) % mod;
  }
  return h;
}
