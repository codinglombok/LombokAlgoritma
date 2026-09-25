// LombokAlgoritma — graph algorithms (SPEC §9)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Graph algorithms on an ordered edge list ([`Graph`]). Adjacency follows edge-list order and
//! every heap uses a total lexicographic key, so outputs are identical in every port.
mod a_star;
mod bellman_ford;
mod bfs;
mod bipartite_matching;
mod dfs;
mod dijkstra;
mod dinic;
mod floyd_warshall;
mod kruskal;
mod pagerank;
mod prim;
mod tarjan_scc;
mod topological_sort;
mod types;

pub use a_star::{a_star, AStarResult};
pub use bellman_ford::{bellman_ford, BellmanFordResult};
pub use bfs::bfs;
pub use bipartite_matching::{bipartite_matching, MatchingResult};
pub use dfs::dfs;
pub use dijkstra::dijkstra;
pub use dinic::dinic;
pub use floyd_warshall::floyd_warshall;
pub use kruskal::kruskal;
pub use pagerank::page_rank;
pub use prim::prim;
pub use tarjan_scc::tarjan_scc;
pub use topological_sort::topological_sort;
pub use types::{Edge, Graph};

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Error;
    use alloc::vec;
    use alloc::vec::Vec;

    const INF: f64 = f64::INFINITY;

    fn g4() -> Graph {
        Graph::from_triples(4, &[(0, 1, 1.0), (1, 2, 2.0), (0, 2, 5.0), (2, 3, 1.0)])
    }

    fn bad() -> Graph {
        Graph::from_triples(2, &[(0, 5, 1.0)])
    }

    #[test]
    fn traversals() {
        let g = g4();
        assert_eq!(bfs(&g, 0), Ok(vec![Some(0), Some(1), Some(1), Some(2)]));
        assert_eq!(bfs(&g, 3), Ok(vec![None, None, None, Some(0)]));
        assert_eq!(dfs(&g, 0), Ok(vec![0, 1, 2, 3]));
        assert_eq!(bfs(&g, 4), Err(Error::OutOfRange));
        assert_eq!(dfs(&bad(), 0), Err(Error::OutOfRange));
        assert_eq!(topological_sort(&g), Ok(vec![0, 1, 2, 3]));
        let cyc = Graph::from_triples(2, &[(0, 1, 1.0), (1, 0, 1.0)]);
        assert_eq!(topological_sort(&cyc), Ok(vec![]));
        assert_eq!(tarjan_scc(&g), Ok(vec![vec![3], vec![2], vec![1], vec![0]]));
        let scc = Graph::from_triples(
            5,
            &[
                (0, 1, 1.0),
                (1, 2, 1.0),
                (2, 0, 1.0),
                (1, 3, 1.0),
                (3, 4, 1.0),
                (4, 3, 1.0),
            ],
        );
        assert_eq!(tarjan_scc(&scc), Ok(vec![vec![3, 4], vec![0, 1, 2]]));
    }

    #[test]
    fn shortest_paths() {
        let g = g4();
        assert_eq!(dijkstra(&g, 0), Ok(vec![0.0, 1.0, 3.0, 4.0]));
        assert_eq!(dijkstra(&g, 2), Ok(vec![INF, INF, 0.0, 1.0]));
        let neg = Graph::from_triples(2, &[(0, 1, -1.0)]);
        assert_eq!(dijkstra(&neg, 0), Err(Error::NegativeWeight));
        assert_eq!(dijkstra(&g, 9), Err(Error::OutOfRange));
        let r = a_star(&g, 0, 3, |_| 0.0).unwrap();
        assert_eq!((r.path, r.cost), (vec![0, 1, 2, 3], 4.0));
        let r = a_star(&g, 3, 0, |_| 0.0).unwrap();
        assert_eq!((r.path, r.cost), (vec![], INF));
        let h = [2.0, 1.5, 1.0, 0.0];
        let r = a_star(&g, 0, 3, |v| h[v]).unwrap();
        assert_eq!(r.cost, 4.0);
        assert_eq!(a_star(&neg, 0, 1, |_| 0.0), Err(Error::NegativeWeight));
        assert_eq!(a_star(&g, 0, 7, |_| 0.0), Err(Error::OutOfRange));
        let bf = bellman_ford(&g, 0).unwrap();
        assert_eq!(bf.distances, vec![0.0, 1.0, 3.0, 4.0]);
        assert!(!bf.has_negative_cycle);
        let nc = Graph::from_triples(3, &[(0, 1, 1.0), (1, 2, -3.0), (2, 1, 1.0)]);
        assert!(bellman_ford(&nc, 0).unwrap().has_negative_cycle);
        assert_eq!(bellman_ford(&g, 4), Err(Error::OutOfRange));
        let fw = floyd_warshall(&g).unwrap();
        assert_eq!(fw[0], vec![0.0, 1.0, 3.0, 4.0]);
        assert_eq!(fw[3], vec![INF, INF, INF, 0.0]);
        let par = Graph::from_triples(2, &[(0, 1, 5.0), (0, 1, 2.0)]);
        assert_eq!(floyd_warshall(&par).unwrap()[0][1], 2.0);
        let selfneg = Graph::from_triples(2, &[(0, 0, -1.0), (0, 1, 1.0)]);
        assert!(floyd_warshall(&selfneg).unwrap()[0][0] < -1.0);
        assert_eq!(floyd_warshall(&bad()), Err(Error::OutOfRange));
    }

    #[test]
    fn spanning_trees() {
        let g = g4();
        let k: Vec<(usize, usize, f64)> = kruskal(&g)
            .unwrap()
            .iter()
            .map(|e| (e.from, e.to, e.weight))
            .collect();
        assert_eq!(k, vec![(0, 1, 1.0), (2, 3, 1.0), (1, 2, 2.0)]);
        let p: Vec<(usize, usize, f64)> = prim(&g)
            .unwrap()
            .iter()
            .map(|e| (e.from, e.to, e.weight))
            .collect();
        assert_eq!(p, vec![(0, 1, 1.0), (1, 2, 2.0), (2, 3, 1.0)]);
        let forest = Graph::from_triples(5, &[(3, 4, 1.0), (4, 4, 0.0), (0, 1, 2.0)]);
        assert_eq!(prim(&forest).unwrap().len(), 2);
        assert_eq!(kruskal(&forest).unwrap().len(), 2);
        assert_eq!(kruskal(&bad()), Err(Error::OutOfRange));
        assert_eq!(prim(&bad()), Err(Error::OutOfRange));
    }

    #[test]
    fn flows_and_matchings() {
        let g = Graph::from_triples(
            4,
            &[
                (0, 1, 3.0),
                (0, 2, 2.0),
                (1, 2, 1.0),
                (1, 3, 2.0),
                (2, 3, 3.0),
                (0, 1, 1.0),
            ],
        );
        assert_eq!(dinic(&g, 0, 3), Ok(5.0));
        assert_eq!(dinic(&g, 3, 0), Ok(0.0));
        assert_eq!(dinic(&g, 0, 0), Err(Error::InvalidInput));
        assert_eq!(dinic(&g, 0, 9), Err(Error::OutOfRange));
        let neg = Graph::from_triples(2, &[(0, 1, -1.0)]);
        assert_eq!(dinic(&neg, 0, 1), Err(Error::NegativeWeight));
        // dead ends force pruning
        let dead = Graph::from_triples(5, &[(0, 1, 1.0), (1, 2, 1.0), (0, 3, 1.0), (3, 4, 1.0)]);
        assert_eq!(dinic(&dead, 0, 4), Ok(1.0));
        let m = bipartite_matching(3, 3, &[(0, 0), (0, 1), (1, 0), (2, 2)]).unwrap();
        assert_eq!(m.size, 3);
        assert!(m.match_left.iter().all(Option::is_some));
        assert!(m.match_right.iter().all(Option::is_some));
        assert_eq!(
            bipartite_matching(4, 4, &[(0, 0), (1, 0), (2, 0), (3, 0)])
                .unwrap()
                .size,
            1
        );
        let chain = [
            (0, 0),
            (0, 1),
            (1, 1),
            (1, 2),
            (2, 2),
            (2, 3),
            (3, 3),
            (3, 0),
        ];
        assert_eq!(bipartite_matching(4, 4, &chain).unwrap().size, 4);
        assert_eq!(bipartite_matching(1, 1, &[(0, 1)]), Err(Error::OutOfRange));
        assert_eq!(bipartite_matching(0, 0, &[]).unwrap().size, 0);
    }

    #[test]
    fn pagerank() {
        assert_eq!(page_rank(&Graph::new(0, vec![]), 2.0, 5), Ok(vec![]));
        assert_eq!(page_rank(&Graph::new(1, vec![]), 0.85, 30), Ok(vec![1.0]));
        let r = page_rank(&g4(), 0.85, 30).unwrap();
        assert_eq!(
            r,
            vec![
                0.120_451_996_225_011_35,
                0.171_644_094_662_007_6,
                0.317_541_574_882_170_94,
                0.390_362_334_230_810_07
            ]
        );
        assert_eq!(page_rank(&g4(), 1.5, 3), Err(Error::OutOfRange));
        assert_eq!(page_rank(&g4(), f64::NAN, 3), Err(Error::OutOfRange));
        assert_eq!(page_rank(&bad(), 0.5, 3), Err(Error::OutOfRange));
    }
}
