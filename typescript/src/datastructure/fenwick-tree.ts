// LombokAlgoritma — Fenwick Tree (Binary Indexed Tree)
// Apache-2.0 — @codinglombok
// O(n) build, O(log n) prefix sum and point update

export class FenwickTree {
  private readonly tree: number[];
  readonly n: number;

  /** @param arg size `n` (all zeros) or an initial array of values */
  constructor(arg: number | number[]) {
    if (typeof arg === 'number') {
      this.n = arg;
      this.tree = new Array<number>(arg + 1).fill(0);
    } else {
      this.n = arg.length;
      this.tree = new Array<number>(arg.length + 1).fill(0);
      for (let i = 0; i < arg.length; i++) this.update(i + 1, arg[i] as number);
    }
  }

  /** Point update: add val to index i (1-based) */
  update(i: number, val: number): void {
    for (; i <= this.n; i += i & -i) this.tree[i] = (this.tree[i] as number) + val;
  }

  /** Prefix sum [1, i] (1-based) */
  prefixSum(i: number): number {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.tree[i] as number;
    return s;
  }

  /** Range sum [l, r] (1-based) */
  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }

  /** Point query (recover original value at index i) */
  pointQuery(i: number): number {
    return this.rangeSum(i, i);
  }
}
