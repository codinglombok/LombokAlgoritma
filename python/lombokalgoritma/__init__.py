# LombokAlgoritma — Python Port
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Pure-Python (3.10+) port of LombokAlgoritma — deterministic, zero runtime dependencies.

Conforms to SPEC v0.2.0 (shared vectors ``vectors/lombokalgoritma-vectors-v1.json``).
Cryptography (SHA-256, HMAC, HKDF) was removed in v0.2.0 → ``lombokencryptdecrypt``.
"""

from . import (
    compression,
    datastructure,
    errors,
    geometry,
    graph,
    hash,  # noqa: A004 — module name mirrors the SPEC "hash.*" group
    math,
    ml,
    rng,
    search,
    sort,
    string,
)
from .errors import AlgoError, ErrorCode
from .math import crt, gcd, is_prime, mod_pow
from .ml import cosine_similarity, dot_product, l2_distance, normalize
from .rng import Pcg32, SplitMix64, Xoshiro256pp
from .search import binary_search, lower_bound
from .sort import mergesort, quicksort, timsort
from .string import jaro_winkler, kmp_search, levenshtein

__version__ = "0.2.0"  # x-release-please-version
__all__ = [
    "AlgoError",
    "ErrorCode",
    "Pcg32",
    "SplitMix64",
    "Xoshiro256pp",
    "binary_search",
    "compression",
    "cosine_similarity",
    "crt",
    "datastructure",
    "dot_product",
    "errors",
    "gcd",
    "geometry",
    "graph",
    "hash",
    "is_prime",
    "jaro_winkler",
    "kmp_search",
    "l2_distance",
    "levenshtein",
    "lower_bound",
    "math",
    "mergesort",
    "ml",
    "mod_pow",
    "normalize",
    "quicksort",
    "rng",
    "search",
    "sort",
    "string",
    "timsort",
]
