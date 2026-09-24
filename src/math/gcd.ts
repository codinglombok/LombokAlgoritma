// LombokAlgoritma — GCD, LCM, Extended Euclidean
// Apache-2.0 — @codinglombok
// DIPAKAI: LombokEncryptDecrypt (RSA keygen), LombokTableSheet (fractions)

/** Binary GCD (Stein's algorithm) — faster than Euclidean for large integers */
export function gcd(a: bigint, b: bigint): bigint {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  if (a === 0n) return b;
  if (b === 0n) return a;
  let shift = 0n;
  while (((a | b) & 1n) === 0n) {
    a >>= 1n;
    b >>= 1n;
    shift++;
  }
  while ((a & 1n) === 0n) a >>= 1n;
  while (b !== 0n) {
    while ((b & 1n) === 0n) b >>= 1n;
    if (a > b) [a, b] = [b, a];
    b -= a;
  }
  return a << shift;
}

/** Number GCD (safe for JS numbers up to 2^53) */
export function gcdNum(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Least common multiple */
export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a / gcd(a, b)) * b;
}

export function lcmNum(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcdNum(a, b)) * b);
}

/** Extended Euclidean: returns {g, x, y} such that a*x + b*y = g = gcd(a,b) */
export function extendedGcd(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint } {
  if (b === 0n) return { g: a, x: 1n, y: 0n };
  const { g, x: x1, y: y1 } = extendedGcd(b, a % b);
  return { g, x: y1, y: x1 - (a / b) * y1 };
}

/** Modular multiplicative inverse: a^(-1) mod m */
export function modInverse(a: bigint, m: bigint): bigint {
  const { g, x } = extendedGcd(((a % m) + m) % m, m);
  if (g !== 1n) throw new Error(`No modular inverse: gcd(${a}, ${m}) = ${g}`);
  return ((x % m) + m) % m;
}
