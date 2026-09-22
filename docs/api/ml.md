# LombokAlgoritma — ML API Reference

## Vector Operations (used by LombokVector, LombokRAGFrameworks)

### `cosineSimilarity(a, b)` — [-1, 1]
```typescript
cosineSimilarity([1,2,3], [4,5,6])  // 0.9746318...
cosineSimilarity([1,0,0], [1,0,0])  // 1.0  (identical)
cosineSimilarity([1,0,0], [0,1,0])  // 0.0  (orthogonal)
```

### `dotProduct(a, b)`, `l2Norm(v)`, `l2Distance(a, b)`, `l1Distance(a, b)`
### `normalize(v)` — returns unit vector

### `batchCosine(query, candidates)` — sorted by score descending
```typescript
batchCosine([1,0,0], [[1,0,0],[0,1,0],[0.7,0.7,0]])
// [{index:0, score:1.0}, {index:2, score:0.707}, {index:1, score:0.0}]
```

### `pearson(a, b)`, `jaccardSimilarity(setA, setB)`
Pearson correlation and Jaccard set similarity.

## Clustering

### `kmeans(points, k, options?)`
k-Means with k-means++ initialization.

```typescript
const { centroids, labels, inertia } = kmeans(
  [[1,1],[2,2],[10,10],[11,11]], 2
);
// labels: [0,0,1,1] (or [1,1,0,0] — label assignment varies)
// inertia: sum of squared distances to cluster centers
```

| Option | Default | Description |
|--------|---------|-------------|
| `maxIter` | 300 | Max iterations |
| `tol` | 1e-4 | Convergence tolerance |
| `seed` | random | RNG seed for reproducibility |

## Decision Tree

### `decisionTree(X, y, options?)` — CART (Gini impurity)

## Dimensionality Reduction

### `pca(data, nComponents?)` — Power iteration SVD

## Distance Matrix

```typescript
import { l2Distance, cosineSimilarity } from 'lombokalgoritma';
// Build n×m distance matrix manually:
const matrix = A.map(a => B.map(b => l2Distance(a, b)));
```
