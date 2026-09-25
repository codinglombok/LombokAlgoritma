<?php

// LombokAlgoritma — Aho–Corasick multi-pattern search (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\String;

/**
 * Aho–Corasick automaton over code points, O(n + m + z). Matches are reported by ascending *end*
 * position; at one end position the node's own patterns come first (insertion order), then those
 * inherited through the failure link.
 */
final class AhoCorasick
{
    /** @var list<array<string, int>> children per node, keyed by "c" . code point */
    private array $children = [[]];
    /** @var list<int> */
    private array $fail = [0];
    /** @var list<list<string>> patterns ending exactly at the node */
    private array $own = [[]];
    /** @var list<list<string>> */
    private array $output = [[]];
    private bool $built = false;

    /** Add a pattern (empty patterns are ignored). */
    public function addPattern(string $pattern): void
    {
        $chars = StringAlgo::codePoints($pattern);
        if ($chars === []) {
            return;
        }
        $cur = 0;
        foreach ($chars as $ch) {
            $key = 'c' . $ch;
            $next = $this->children[$cur][$key] ?? null;
            if ($next === null) {
                $next = count($this->children);
                $this->children[$cur][$key] = $next;
                $this->children[] = [];
                $this->fail[] = 0;
                $this->own[] = [];
                $this->output[] = [];
            }
            $cur = $next;
        }
        $this->own[$cur][] = $pattern;
        $this->built = false;
    }

    /** Compute failure links and outputs (BFS). */
    public function build(): void
    {
        $this->output = $this->own;
        $queue = [];
        foreach ($this->children[0] as $child) {
            $this->fail[$child] = 0;
            $queue[] = $child;
        }
        for ($h = 0; $h < count($queue); $h++) {
            $u = $queue[$h];
            foreach ($this->children[$u] as $key => $v) {
                $f = $this->fail[$u];
                while ($f !== 0 && !isset($this->children[$f][$key])) {
                    $f = $this->fail[$f];
                }
                $fv = $this->children[$f][$key] ?? null;
                $this->fail[$v] = $fv !== null && $fv !== $v ? $fv : 0;
                $this->output[$v] = array_merge($this->output[$v], $this->output[$this->fail[$v]]);
                $queue[] = $v;
            }
        }
        $this->built = true;
    }

    /**
     * All matches in `$text` (builds the automaton on first use).
     *
     * @return list<array{pattern: string, index: int}>
     */
    public function search(string $text): array
    {
        if (!$this->built) {
            $this->build();
        }
        $results = [];
        $cur = 0;
        foreach (StringAlgo::codePoints($text) as $i => $ch) {
            $key = 'c' . $ch;
            while ($cur !== 0 && !isset($this->children[$cur][$key])) {
                $cur = $this->fail[$cur];
            }
            $cur = $this->children[$cur][$key] ?? 0;
            foreach ($this->output[$cur] as $pattern) {
                $results[] = ['pattern' => $pattern, 'index' => $i - mb_strlen($pattern, 'UTF-8') + 1];
            }
        }
        return $results;
    }
}
