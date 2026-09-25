// LombokAlgoritma — Aho–Corasick multi-pattern search
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
// O(n + m + z) — n = text length, m = total pattern length, z = matches.
//
// SPEC §5.4: patterns and text are code-point sequences. Matches are reported in order of their
// *end* position; at one end position the node's own patterns come first (insertion order), then
// those inherited through the failure link. v0.1.x built the trie over code points but scanned the
// text by UTF-16 unit, so patterns with astral characters never matched.

interface ACNode {
  children: Map<string, number>;
  fail: number;
  /** Patterns ending exactly here, in insertion order. */
  own: string[];
  /** `own` followed by the failure node's `output` (filled by build()). */
  output: string[];
}

/** One match: `pattern` found at code-point `index`. */
export interface AhoCorasickMatch {
  pattern: string;
  index: number;
}

export class AhoCorasick {
  private readonly nodes: ACNode[] = [{ children: new Map(), fail: 0, own: [], output: [] }];
  private built = false;

  /** Add a pattern (empty patterns are ignored). Adding after {@link build} requires a rebuild. */
  addPattern(pattern: string): void {
    const chars = Array.from(pattern);
    if (chars.length === 0) return;
    let cur = 0;
    for (const ch of chars) {
      const node = this.nodes[cur] as ACNode;
      let next = node.children.get(ch);
      if (next === undefined) {
        next = this.nodes.length;
        node.children.set(ch, next);
        this.nodes.push({ children: new Map(), fail: 0, own: [], output: [] });
      }
      cur = next;
    }
    (this.nodes[cur] as ACNode).own.push(pattern);
    this.built = false;
  }

  /** Compute failure links (BFS). */
  build(): void {
    for (const n of this.nodes) n.output = n.own.slice();
    const queue: number[] = [];
    for (const child of (this.nodes[0] as ACNode).children.values()) {
      (this.nodes[child] as ACNode).fail = 0;
      queue.push(child);
    }
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h] as number;
      for (const [ch, v] of (this.nodes[u] as ACNode).children) {
        let fail = (this.nodes[u] as ACNode).fail;
        while (fail !== 0 && !(this.nodes[fail] as ACNode).children.has(ch)) {
          fail = (this.nodes[fail] as ACNode).fail;
        }
        const fv = (this.nodes[fail] as ACNode).children.get(ch);
        const nodeV = this.nodes[v] as ACNode;
        nodeV.fail = fv !== undefined && fv !== v ? fv : 0;
        nodeV.output = [...nodeV.output, ...(this.nodes[nodeV.fail] as ACNode).output];
        queue.push(v);
      }
    }
    this.built = true;
  }

  /** All matches in `text` (builds the automaton on first use). */
  search(text: string): AhoCorasickMatch[] {
    if (!this.built) this.build();
    const results: AhoCorasickMatch[] = [];
    let cur = 0;
    let i = 0;
    for (const ch of text) {
      while (cur !== 0 && !(this.nodes[cur] as ACNode).children.has(ch)) {
        cur = (this.nodes[cur] as ACNode).fail;
      }
      cur = (this.nodes[cur] as ACNode).children.get(ch) ?? 0;
      for (const pattern of (this.nodes[cur] as ACNode).output) {
        results.push({ pattern, index: i - Array.from(pattern).length + 1 });
      }
      i++;
    }
    return results;
  }
}
