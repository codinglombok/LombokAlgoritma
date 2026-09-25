# LombokAlgoritma — Python Port
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Pure-Python (3.10+) port of LombokAlgoritma — zero runtime dependencies."""

from . import datastructure, math, ml, search, sort, string
from .math import crt, gcd, hkdf, is_prime, mod_pow, sha256, sha256_hex
from .ml import cosine_similarity, dot_product, l2_distance, normalize
from .search import binary_search, lower_bound
from .sort import mergesort, quicksort, timsort
from .string import jaro_winkler, kmp_search, levenshtein

__version__ = "0.1.1"  # x-release-please-version
__all__ = [
    "binary_search",
    "cosine_similarity",
    "crt",
    "datastructure",
    "dot_product",
    "gcd",
    "hkdf",
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
    "search",
    "sha256",
    "sha256_hex",
    "sort",
    "string",
    "timsort",
]
