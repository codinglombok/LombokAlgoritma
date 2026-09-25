# LombokAlgoritma — strongly connected components, Tarjan (SPEC §9.10)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from .types import Graph, build_adj_list


def tarjan_scc(g: Graph) -> list[list[int]]:
    """SCCs in completion order (reverse topological order of the condensation), members sorted.

    Iterative, but visits exactly like the recursive version (roots ascending, edge-list order).
    """
    adj = build_adj_list(g)
    n = len(adj)
    index = [-1] * n
    low = [0] * n
    on_stack = [False] * n
    stack: list[int] = []
    out: list[list[int]] = []
    counter = 0
    for root in range(n):
        if index[root] != -1:
            continue
        call = [[root, 0]]
        index[root] = low[root] = counter
        counter += 1
        stack.append(root)
        on_stack[root] = True
        while call:
            frame = call[-1]
            v, pos = frame
            edges = adj[v]
            if pos < len(edges):
                frame[1] = pos + 1
                w = edges[pos][0]
                if index[w] == -1:
                    index[w] = low[w] = counter
                    counter += 1
                    stack.append(w)
                    on_stack[w] = True
                    call.append([w, 0])
                elif on_stack[w]:
                    low[v] = min(low[v], index[w])
                continue
            call.pop()
            if call:
                parent = call[-1][0]
                low[parent] = min(low[parent], low[v])
            if low[v] == index[v]:
                comp: list[int] = []
                while True:
                    w = stack.pop()
                    on_stack[w] = False
                    comp.append(w)
                    if w == v:
                        break
                out.append(sorted(comp))
    return out
