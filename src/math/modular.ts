// LombokAlgoritma — Modular Arithmetic
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (RSA modexp, ECC field arithmetic)

/** Fast modular exponentiation: base^exp mod m — O(log exp) */
export function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let result = 1n;
  base = base % m;
  while (exp > 0n) {
    if (exp & 1n) result = result * base % m;
    exp >>= 1n;
    base = base * base % m;
  }
  return result;
}

/** Modular addition — avoids overflow */
export function modAdd(a: bigint, b: bigint, m: bigint): bigint {
  return (a + b) % m;
}

/** Modular subtraction */
export function modSub(a: bigint, b: bigint, m: bigint): bigint {
  return ((a - b) % m + m) % m;
}

/** Modular multiplication — safe for large primes */
export function modMul(a: bigint, b: bigint, m: bigint): bigint {
  return a * b % m;
}

/** Chinese Remainder Theorem: find x such that x ≡ r_i (mod m_i) */
export function crt(remainders: bigint[], moduli: bigint[]): bigint {
  const M = moduli.reduce((a, b) => a * b, 1n);
  let x = 0n;
  for (let i = 0; i < remainders.length; i++) {
    const Mi = M / (moduli[i] as bigint);
    const { y } = extendedGcdLocal(Mi, moduli[i] as bigint);
    x = (x + (remainders[i] as bigint) * Mi % M * ((y % (moduli[i] as bigint) + (moduli[i] as bigint)) % (moduli[i] as bigint)) % M) % M;
  }
  return (x + M) % M;
}

function extendedGcdLocal(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const { g, x: x1, y: y1 } = extendedGcdLocal(b, a % b);
  return { g, x: y1, y: x1 - (a / b) * y1 };
}
