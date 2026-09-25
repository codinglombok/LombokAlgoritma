// LombokAlgoritma — Disjoint Set (Union-Find)
// Apache-2.0 — @codinglombok
// Path compression + union by rank — nearly O(1) amortized per op

export class DisjointSet {
  private parent: Int32Array;
  private readonly rank: Uint8Array;
  private _count: number;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.rank = new Uint8Array(n);
    this._count = n;
    for (let i = 0; i < n; i++) this.parent[i] = i;
  }

  find(x: number): number {
    const p = this.parent[x] as number;
    if (p !== x) this.parent[x] = this.find(p); // path compression
    return this.parent[x] as number;
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    const rankX = this.rank[rx] as number;
    const rankY = this.rank[ry] as number;
    if (rankX < rankY) this.parent[rx] = ry;
    else if (rankX > rankY) this.parent[ry] = rx;
    else {
      this.parent[ry] = rx;
      this.rank[rx] = rankX + 1;
    }
    this._count--;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }
  get count(): number {
    return this._count;
  }
}
