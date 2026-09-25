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
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]!); // path compression
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx]! < this.rank[ry]!) this.parent[rx] = ry;
    else if (this.rank[rx]! > this.rank[ry]!) this.parent[ry] = rx;
    else {
      this.parent[ry] = rx;
      this.rank[rx]!++;
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
