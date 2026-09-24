# lombokalgoritma (Python)

Pure-Python 3.10+ port of [LombokAlgoritma](https://github.com/codinglombok/LombokAlgoritma):
sorting, searching, number theory, string algorithms and non-cryptographic hashes,
vector similarity and k-means. Zero runtime dependencies.

```bash
pip install lombokalgoritma
```

```python
from lombokalgoritma import quicksort, binary_search, levenshtein
from lombokalgoritma.string import xxhash32

quicksort([3, 1, 2])            # [1, 2, 3]
binary_search([1, 3, 5], 5)     # 2
levenshtein("kitten", "sitting")  # 3
xxhash32(b"abc")                # 0x32D153FF
```

`sha256`, `sha256_hex`, `hmac_sha256` and `hkdf` are **deprecated** (moved to
`lombokencryptdecrypt`) and are removed in v0.2.0.

License: Apache-2.0 OR MIT.
