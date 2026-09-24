// LombokAlgoritma — Cooley-Tukey FFT (Iterative, in-place)
// Apache-2.0 — @codinglombok
// O(n log n). Input size must be power of 2.

import { nextPow2 } from '../core/bit.js';

export interface Complex {
  re: number;
  im: number;
}

function bitReverse(n: number, bits: number): number {
  let rev = 0;
  for (let i = 0; i < bits; i++) {
    rev = (rev << 1) | (n & 1);
    n >>= 1;
  }
  return rev;
}

/** Iterative Cooley-Tukey FFT. Modifies arr in-place. */
export function fft(arr: Complex[], inverse = false): void {
  const n = arr.length;
  const bits = Math.log2(n) | 0;
  // Bit-reversal permutation
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    if (i < j) [arr[i], arr[j]] = [arr[j] as Complex, arr[i] as Complex];
  }
  // Butterfly passes
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 1 : -1) * 2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let j = 0; j < len / 2; j++) {
        const uRe = (arr[i + j] as Complex).re;
        const uIm = (arr[i + j] as Complex).im;
        const vRe =
          (arr[i + j + len / 2] as Complex).re * curRe -
          (arr[i + j + len / 2] as Complex).im * curIm;
        const vIm =
          (arr[i + j + len / 2] as Complex).re * curIm +
          (arr[i + j + len / 2] as Complex).im * curRe;
        (arr[i + j] as Complex).re = uRe + vRe;
        (arr[i + j] as Complex).im = uIm + vIm;
        (arr[i + j + len / 2] as Complex).re = uRe - vRe;
        (arr[i + j + len / 2] as Complex).im = uIm - vIm;
        const newCurRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newCurRe;
      }
    }
  }
  if (inverse) {
    for (const c of arr) {
      c.re /= n;
      c.im /= n;
    }
  }
}

/** Pad real array to next power of 2 and convert to Complex[] */
export function realToComplex(real: number[]): Complex[] {
  const n = nextPow2(real.length);
  const out = new Array<Complex>(n);
  for (let i = 0; i < n; i++) out[i] = { re: real[i] ?? 0, im: 0 };
  return out;
}
