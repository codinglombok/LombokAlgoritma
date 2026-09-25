// LombokAlgoritma — Segmented Sieve of Eratosthenes
// Apache-2.0 — @codinglombok

/** Simple sieve up to n — returns array of primes */
export function sieve(n: number): number[] {
  if (n < 2) return [];
  const isComposite = new Uint8Array(n + 1);
  isComposite[0] = isComposite[1] = 1;
  for (let i = 2; i * i <= n; i++) {
    if (isComposite[i] === 0) {
      for (let j = i * i; j <= n; j += i) isComposite[j] = 1;
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) if (isComposite[i] === 0) primes.push(i);
  return primes;
}

/** Segmented sieve for large ranges [lo, hi] */
export function segmentedSieve(lo: number, hi: number): number[] {
  const sqrtHi = Math.ceil(Math.sqrt(hi));
  const basePrimes = sieve(sqrtHi);
  const size = hi - lo + 1;
  const isComposite = new Uint8Array(size);
  for (const p of basePrimes) {
    let start = Math.max(p * p, Math.ceil(lo / p) * p);
    if (start === p) start += p;
    for (let j = start; j <= hi; j += p) isComposite[j - lo] = 1;
  }
  const primes: number[] = [];
  for (let i = 0; i < size; i++) {
    if (isComposite[i] === 0 && lo + i > 1) primes.push(lo + i);
  }
  return primes;
}
