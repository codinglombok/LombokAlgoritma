// LombokAlgoritma — Aho-Corasick Multi-Pattern Search
// Apache-2.0 — @codinglombok
// O(n + m + z) — n=text length, m=total pattern length, z=matches
// Builds automaton for simultaneous search of multiple patterns

interface ACNode {
  children: Map<string, number>;
  fail: number;
  output: string[];
}

export class AhoCorasick {
  private readonly nodes: ACNode[] = [{ children: new Map(), fail: 0, output: [] }];

  /** Add a pattern to the automaton (call before build()) */
  addPattern(pattern: string): void {
    let cur = 0;
    for (const ch of pattern) {
      if (!this.nodes[cur]!.children.has(ch)) {
        this.nodes[cur]!.children.set(ch, this.nodes.length);
        this.nodes.push({ children: new Map(), fail: 0, output: [] });
      }
      cur = this.nodes[cur]!.children.get(ch)!;
    }
    this.nodes[cur]!.output.push(pattern);
  }

  /** Build failure links (BFS) */
  build(): void {
    const queue: number[] = [];
    for (const [, child] of this.nodes[0]!.children) {
      this.nodes[child]!.fail = 0;
      queue.push(child);
    }
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const [ch, v] of this.nodes[u]!.children) {
        let fail = this.nodes[u]!.fail;
        while (fail !== 0 && !this.nodes[fail]!.children.has(ch)) fail = this.nodes[fail]!.fail;
        const fv = this.nodes[fail]!.children.get(ch);
        this.nodes[v]!.fail = fv !== undefined && fv !== v ? fv : 0;
        this.nodes[v]!.output = [
          ...this.nodes[v]!.output,
          ...this.nodes[this.nodes[v]!.fail]!.output,
        ];
        queue.push(v);
      }
    }
  }

  /** Search text, returns [{pattern, index}] */
  search(text: string): Array<{ pattern: string; index: number }> {
    const results: Array<{ pattern: string; index: number }> = [];
    let cur = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;
      while (cur !== 0 && !this.nodes[cur]!.children.has(ch)) cur = this.nodes[cur]!.fail;
      const next = this.nodes[cur]!.children.get(ch);
      cur = next !== undefined ? next : 0;
      for (const pattern of this.nodes[cur]!.output) {
        results.push({ pattern, index: i - pattern.length + 1 });
      }
    }
    return results;
  }
}
