// LombokAlgoritma — Binary min-heap
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//
// Used by the graph algorithms. Keys are compared with `less`; SPEC §6.1 requires every graph heap
// to use a *total* lexicographic key (e.g. [distance, node]) so the pop order — and therefore every
// output — is independent of how a port implements its heap.

/** Array-backed binary min-heap. */
export class MinHeap<T> {
  private readonly items: T[] = [];

  constructor(private readonly less: (a: T, b: T) => boolean) {}

  get size(): number {
    return this.items.length;
  }

  push(item: T): void {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i] as T, a[p] as T)) break;
      [a[i], a[p]] = [a[p] as T, a[i] as T];
      i = p;
    }
  }

  /** Remove and return the minimum, or `undefined` when empty. */
  pop(): T | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0] as T;
    const last = a.pop() as T;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l] as T, a[m] as T)) m = l;
        if (r < a.length && this.less(a[r] as T, a[m] as T)) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m] as T, a[i] as T];
        i = m;
      }
    }
    return top;
  }
}

/** Lexicographic `<` on equal-length numeric tuples. */
export function tupleLess(a: readonly number[], b: readonly number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    const x = a[i] as number;
    const y = b[i] as number;
    if (x !== y) return x < y;
  }
  return false;
}
