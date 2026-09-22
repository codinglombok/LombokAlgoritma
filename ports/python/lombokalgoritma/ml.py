# LombokAlgoritma — Python ML Module
# Apache-2.0 — @codinglombok
import math
from typing import Optional

def dot_product(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))

def l2_norm(v: list[float]) -> float:
    return math.sqrt(sum(x * x for x in v))

def cosine_similarity(a: list[float], b: list[float]) -> float:
    na, nb = l2_norm(a), l2_norm(b)
    if na == 0 or nb == 0: return 0.0
    return dot_product(a, b) / (na * nb)

def l2_distance(a: list[float], b: list[float]) -> float:
    return math.sqrt(sum((x - y)**2 for x, y in zip(a, b)))

def l1_distance(a: list[float], b: list[float]) -> float:
    return sum(abs(x - y) for x, y in zip(a, b))

def normalize(v: list[float]) -> list[float]:
    n = l2_norm(v)
    return [x / n for x in v] if n > 0 else [0.0] * len(v)

def kmeans(points: list[list[float]], k: int, max_iter: int=300, tol: float=1e-4, seed: int=42) -> dict:
    import random
    rng = random.Random(seed)
    n = len(points); d = len(points[0])
    # k-means++ init
    centroids = [points[rng.randint(0, n-1)]]
    while len(centroids) < k:
        dists = [min(l2_distance(p, c)**2 for c in centroids) for p in points]
        total = sum(dists); r = rng.random() * total
        for i, d_ in enumerate(dists):
            r -= d_
            if r <= 0: centroids.append(points[i]); break
        else: centroids.append(points[-1])
    labels = [0] * n
    for it in range(max_iter):
        new_labels = [min(range(k), key=lambda c: l2_distance(p, centroids[c])) for p in points]
        new_centroids = [[0.0]*d for _ in range(k)]
        counts = [0]*k
        for i, l in enumerate(new_labels):
            for j in range(d): new_centroids[l][j] += points[i][j]
            counts[l] += 1
        max_shift = 0.0
        for c in range(k):
            if counts[c]:
                nc = [v/counts[c] for v in new_centroids[c]]
                max_shift = max(max_shift, l2_distance(centroids[c], nc))
                new_centroids[c] = nc
            else: new_centroids[c] = centroids[c][:]
        labels = new_labels; centroids = new_centroids
        if max_shift < tol: break
    inertia = sum(l2_distance(points[i], centroids[labels[i]])**2 for i in range(n))
    return {"centroids": centroids, "labels": labels, "inertia": inertia}
