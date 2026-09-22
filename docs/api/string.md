# LombokAlgoritma — String API Reference

## Pattern Matching

### `kmpSearch(text, pattern)` / `kmpFind(text, pattern)`
Knuth-Morris-Pratt. O(n+m). Returns all indices / first index.

```typescript
kmpSearch('abcabcabc', 'abc')  // [0, 3, 6]
kmpFind('hello world', 'world') // 6
kmpFind('hello', 'xyz')        // -1
```

### `AhoCorasick` — Multi-pattern matching
O(n + m + z) for n=text, m=total pattern length, z=matches.

```typescript
const ac = new AhoCorasick();
ac.addPattern('he'); ac.addPattern('she'); ac.addPattern('hers');
ac.build();
ac.search('ushers')
// [{pattern:'she',index:1},{pattern:'he',index:2},{pattern:'hers',index:2}]
```

## Edit Distance

### `levenshtein(a, b)`
Wagner-Fischer. O(mn) time, O(min(m,n)) space.

```typescript
levenshtein('kitten', 'sitting')  // 3
levenshtein('hello', 'hello')     // 0
```

### `damerauLevenshtein(a, b)`
Includes transpositions. Useful for typo detection.

### `jaro(a, b)` / `jaroWinkler(a, b, p?)`
Similarity score [0, 1]. Jaro-Winkler gives prefix bonus.

## Hash Functions (also in `string-hash.ts`)

### `fnv1a32(data)` / `fnv1a64(data)`
FNV-1a 32/64-bit. Deterministic, fast. Used by LombokSimHash.

```typescript
fnv1a32('hello')  // 0x4f9f2cab (uint32)
fnv1a64('hello')  // bigint
```

### `murmurHash3_32(data, seed?)`
MurmurHash3 32-bit. Excellent distribution. Used in Bloom filters.

### `xxHash32(data, seed?)` / `polynomialHash(s, base?, mod?)`
Additional non-crypto hash functions.

## String Analysis

### `suffixArray(s)` — SA-IS O(n) suffix array
### `levenshtein(a, b)` — Edit distance
### `lcs(a, b)` — Longest common subsequence
### `manacher(s)` — All palindromic substrings O(n)
### `zAlgorithm(s)` — Z-function O(n)
### `phonetic(s)` — Soundex / Metaphone encoding
### `fuzzyMatch(text, pattern, maxErrors?)` — Bitap approximate matching
