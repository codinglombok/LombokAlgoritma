// LombokAlgoritma — Segment Tree with Lazy Propagation
// Apache-2.0 — @codinglombok
// O(n) build, O(log n) query/update, O(n) space

export class SegmentTree {
  private readonly tree: number[];
  private readonly lazy: number[];
  private readonly n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array<number>(4 * this.n).fill(0);
    this.lazy = new Array<number>(4 * this.n).fill(0);
    if (this.n > 0) this.build(arr, 1, 0, this.n - 1);
  }

  private build(arr: number[], node: number, lo: number, hi: number): void {
    if (lo === hi) {
      this.tree[node] = arr[lo]!;
      return;
    }
    const mid = (lo + hi) >> 1;
    this.build(arr, 2 * node, lo, mid);
    this.build(arr, 2 * node + 1, mid + 1, hi);
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!;
  }

  /** Apply a pending "+val to every element" to a node covering [lo, hi]. */
  private apply(node: number, lo: number, hi: number, val: number): void {
    this.tree[node] = (this.tree[node] ?? 0) + val * (hi - lo + 1);
    this.lazy[node] = (this.lazy[node] ?? 0) + val;
  }

  private push(node: number, lo: number, hi: number): void {
    const pending = this.lazy[node] ?? 0;
    if (pending !== 0) {
      const mid = (lo + hi) >> 1;
      this.apply(2 * node, lo, mid, pending);
      this.apply(2 * node + 1, mid + 1, hi, pending);
      this.lazy[node] = 0;
    }
  }

  /** Range sum query [l, r] */
  query(l: number, r: number, node = 1, lo = 0, hi = this.n - 1): number {
    if (this.n === 0 || r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return this.tree[node] ?? 0;
    this.push(node, lo, hi);
    const mid = (lo + hi) >> 1;
    return this.query(l, r, 2 * node, lo, mid) + this.query(l, r, 2 * node + 1, mid + 1, hi);
  }

  /** Range update: add val to [l, r] */
  update(l: number, r: number, val: number, node = 1, lo = 0, hi = this.n - 1): void {
    if (this.n === 0 || r < lo || hi < l) return;
    if (l <= lo && hi <= r) {
      this.apply(node, lo, hi, val);
      return;
    }
    this.push(node, lo, hi);
    const mid = (lo + hi) >> 1;
    this.update(l, r, val, 2 * node, lo, mid);
    this.update(l, r, val, 2 * node + 1, mid + 1, hi);
    this.tree[node] = this.tree[2 * node]! + this.tree[2 * node + 1]!;
  }
}
