# LombokAlgoritma — Python String Module
# Apache-2.0 — @codinglombok

def kmp_search(text: str, pattern: str) -> list[int]:
    if not pattern: return []
    m = len(pattern)
    f = [0] * m; k = 0
    for i in range(1, m):
        while k > 0 and pattern[k] != pattern[i]: k = f[k-1]
        if pattern[k] == pattern[i]: k += 1
        f[i] = k
    results = []; k = 0
    for i, ch in enumerate(text):
        while k > 0 and pattern[k] != ch: k = f[k-1]
        if pattern[k] == ch: k += 1
        if k == m: results.append(i - m + 1); k = f[k-1]
    return results

def levenshtein(a: str, b: str) -> int:
    if a == b: return 0
    if len(a) > len(b): a, b = b, a
    prev = list(range(len(a) + 1))
    for j, ch_b in enumerate(b, 1):
        curr = [j] + [0] * len(a)
        for i, ch_a in enumerate(a, 1):
            cost = 0 if ch_a == ch_b else 1
            curr[i] = min(curr[i-1]+1, prev[i]+1, prev[i-1]+cost)
        prev = curr
    return prev[len(a)]

def jaro(a: str, b: str) -> float:
    if a == b: return 1.0
    match_dist = max(len(a), len(b)) // 2 - 1
    if match_dist < 0: return 0.0
    a_matched = [False]*len(a); b_matched = [False]*len(b)
    matches = 0
    for i in range(len(a)):
        lo = max(0, i - match_dist); hi = min(i + match_dist + 1, len(b))
        for j in range(lo, hi):
            if b_matched[j] or a[i] != b[j]: continue
            a_matched[i] = b_matched[j] = True; matches += 1; break
    if matches == 0: return 0.0
    trans = 0; k = 0
    for i in range(len(a)):
        if not a_matched[i]: continue
        while not b_matched[k]: k += 1
        if a[i] != b[k]: trans += 1
        k += 1
    return (matches/len(a) + matches/len(b) + (matches - trans/2)/matches) / 3

def jaro_winkler(a: str, b: str, p: float=0.1) -> float:
    j = jaro(a, b)
    prefix = 0
    for x, y in zip(a[:4], b[:4]):
        if x == y: prefix += 1
        else: break
    return j + prefix * p * (1 - j)

def fnv1a32(data: bytes | str) -> int:
    if isinstance(data, str): data = data.encode()
    h = 0x811c9dc5
    for b in data: h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return h

def fnv1a64(data: bytes | str) -> int:
    if isinstance(data, str): data = data.encode()
    h = 0xcbf29ce484222325
    for b in data: h = ((h ^ b) * 0x00000100000001b3) & 0xFFFFFFFFFFFFFFFF
    return h
