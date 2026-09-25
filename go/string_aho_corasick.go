// LombokAlgoritma — Aho–Corasick multi-pattern search over code points (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

package lombokalgoritma

type acNode struct {
	children map[rune]int
	order    []rune // child insertion order (keeps the BFS deterministic)
	fail     int
	own      []string // patterns ending exactly here, in insertion order
	output   []string // own followed by the failure node's output
}

// AhoCorasickMatch is one match: Pattern found at code-point offset Index.
type AhoCorasickMatch struct {
	Pattern string
	Index   int
}

// AhoCorasick is a multi-pattern matcher. The zero value is not usable; call NewAhoCorasick.
type AhoCorasick struct {
	nodes []acNode
	built bool
}

// NewAhoCorasick returns an empty automaton.
func NewAhoCorasick() *AhoCorasick {
	return &AhoCorasick{nodes: []acNode{{children: map[rune]int{}}}}
}

// AddPattern adds a pattern (empty patterns are ignored); duplicates are reported once per
// addition. Adding after Build or Search triggers a rebuild on the next Search.
func (ac *AhoCorasick) AddPattern(pattern string) {
	if pattern == "" {
		return
	}
	cur := 0
	for _, ch := range pattern {
		next, ok := ac.nodes[cur].children[ch]
		if !ok {
			next = len(ac.nodes)
			ac.nodes[cur].children[ch] = next
			ac.nodes[cur].order = append(ac.nodes[cur].order, ch)
			ac.nodes = append(ac.nodes, acNode{children: map[rune]int{}})
		}
		cur = next
	}
	ac.nodes[cur].own = append(ac.nodes[cur].own, pattern)
	ac.built = false
}

// Build computes the failure links (BFS).
func (ac *AhoCorasick) Build() {
	for i := range ac.nodes {
		ac.nodes[i].output = append([]string(nil), ac.nodes[i].own...)
	}
	queue := make([]int, 0, len(ac.nodes))
	for _, ch := range ac.nodes[0].order {
		child := ac.nodes[0].children[ch]
		ac.nodes[child].fail = 0
		queue = append(queue, child)
	}
	for h := 0; h < len(queue); h++ {
		u := queue[h]
		for _, ch := range ac.nodes[u].order {
			v := ac.nodes[u].children[ch]
			fail := ac.nodes[u].fail
			for fail != 0 {
				if _, ok := ac.nodes[fail].children[ch]; ok {
					break
				}
				fail = ac.nodes[fail].fail
			}
			fv, ok := ac.nodes[fail].children[ch]
			if ok && fv != v {
				ac.nodes[v].fail = fv
			} else {
				ac.nodes[v].fail = 0
			}
			ac.nodes[v].output = append(ac.nodes[v].output, ac.nodes[ac.nodes[v].fail].output...)
			queue = append(queue, v)
		}
	}
	ac.built = true
}

// Search returns all matches in text, ordered by end position; at one end position the node's
// own patterns come first (insertion order), then those inherited through failure links.
func (ac *AhoCorasick) Search(text string) []AhoCorasickMatch {
	if !ac.built {
		ac.Build()
	}
	results := []AhoCorasickMatch{}
	cur := 0
	i := 0
	for _, ch := range text {
		for cur != 0 {
			if _, ok := ac.nodes[cur].children[ch]; ok {
				break
			}
			cur = ac.nodes[cur].fail
		}
		cur = ac.nodes[cur].children[ch] // missing child → 0 (root)
		for _, p := range ac.nodes[cur].output {
			results = append(results, AhoCorasickMatch{Pattern: p, Index: i - runeCount(p) + 1})
		}
		i++
	}
	return results
}

func runeCount(s string) int {
	n := 0
	for range s {
		n++
	}
	return n
}
