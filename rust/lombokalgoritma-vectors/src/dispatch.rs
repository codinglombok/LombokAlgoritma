// LombokAlgoritma — vector dispatch: group name + input → output value (SPEC §4.2)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Mirrors `typescript/tests/vectors/dispatch.ts` group by group (same input field names).
use crate::json::Value;
use lombokalgoritma as la;
use lombokalgoritma::compression::{
    huffman_encode, lz77_compress, lz77_decompress, rle_decode, rle_encode,
};
use lombokalgoritma::datastructure::{
    BloomFilter, DisjointSet, FenwickTree, HyperLogLog, SegmentTree,
};
use lombokalgoritma::geometry::{self as geo, Point2D};
use lombokalgoritma::graph::{self, Edge, Graph};
use lombokalgoritma::math;
use lombokalgoritma::ml;
use lombokalgoritma::rng::{Pcg32, SplitMix64, Xoshiro256pp};
use lombokalgoritma::search;
use lombokalgoritma::sort;
use lombokalgoritma::string as s;

/// Why a case did not produce a value.
#[derive(Debug)]
pub enum CaseError {
    /// A canonical library error: the case output is `{"error": code}`.
    Algo(la::Error),
    /// A runner/input bug (unknown group, malformed input): the run fails.
    Bug(String),
}

impl From<la::Error> for CaseError {
    fn from(e: la::Error) -> Self {
        CaseError::Algo(e)
    }
}

type R<T> = Result<T, CaseError>;

fn bug<T>(msg: impl Into<String>) -> R<T> {
    Err(CaseError::Bug(msg.into()))
}

fn field<'a>(i: &'a Value, k: &str) -> R<&'a Value> {
    i.get(k)
        .ok_or_else(|| CaseError::Bug(format!("missing field {k}")))
}

fn opt<'a>(i: &'a Value, k: &str) -> Option<&'a Value> {
    match i.get(k) {
        None | Some(Value::Null) => None,
        v => v,
    }
}

fn f(v: &Value) -> R<f64> {
    match v {
        Value::Num(x) => Ok(*x),
        _ => bug(format!("not a number: {v:?}")),
    }
}

/// Integer input: a JSON number with an exact safe-integer value, or a decimal string.
fn big(v: &Value) -> R<i128> {
    match v {
        Value::Num(x) if x.fract() == 0.0 && x.abs() <= 9_007_199_254_740_991.0 => Ok(*x as i128),
        Value::Str(t) => t
            .parse::<i128>()
            .map_err(|_| CaseError::Bug(format!("not an integer: {t}"))),
        _ => bug(format!("not an integer: {v:?}")),
    }
}

fn int<T: TryFrom<i128>>(v: &Value) -> R<T> {
    T::try_from(big(v)?).map_err(|_| CaseError::Bug(format!("integer out of type range: {v:?}")))
}

fn fld_int<T: TryFrom<i128>>(i: &Value, k: &str) -> R<T> {
    int(field(i, k)?)
}

fn fld_f(i: &Value, k: &str) -> R<f64> {
    f(field(i, k)?)
}

fn arr(v: &Value) -> R<&[Value]> {
    match v {
        Value::Arr(a) => Ok(a),
        _ => bug(format!("not an array: {v:?}")),
    }
}

fn st(v: &Value) -> R<&str> {
    match v {
        Value::Str(t) => Ok(t),
        _ => bug(format!("not a string: {v:?}")),
    }
}

fn boolean(v: &Value) -> R<bool> {
    match v {
        Value::Bool(b) => Ok(*b),
        _ => bug(format!("not a bool: {v:?}")),
    }
}

fn floats(v: &Value) -> R<Vec<f64>> {
    arr(v)?.iter().map(f).collect()
}

fn ints<T: TryFrom<i128>>(v: &Value) -> R<Vec<T>> {
    arr(v)?.iter().map(int).collect()
}

fn strs(v: &Value) -> R<Vec<&str>> {
    arr(v)?.iter().map(st).collect()
}

fn matrix(v: &Value) -> R<Vec<Vec<f64>>> {
    arr(v)?.iter().map(floats).collect()
}

/// Lowercase hex → bytes.
///
/// # Errors
/// [`CaseError::Bug`] for odd length or a non-lowercase-hex digit.
pub fn from_hex(h: &str) -> R<Vec<u8>> {
    if h.len() % 2 != 0 {
        return bug(format!("bad hex: {h}"));
    }
    (0..h.len())
        .step_by(2)
        .map(|k| {
            let d = &h[k..k + 2];
            if d.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
            {
                u8::from_str_radix(d, 16).map_err(|_| CaseError::Bug(format!("bad hex: {h}")))
            } else {
                bug(format!("bad hex: {h}"))
            }
        })
        .collect()
}

fn hex_in(i: &Value, k: &str) -> R<Vec<u8>> {
    from_hex(st(field(i, k)?)?)
}

/// Bytes → lowercase hex.
pub fn to_hex(b: &[u8]) -> String {
    use std::fmt::Write as _;
    let mut out = String::with_capacity(2 * b.len());
    for x in b {
        let _ = write!(out, "{x:02x}");
    }
    out
}

fn hex64(x: u64) -> Value {
    Value::Str(format!("{x:016x}"))
}

fn num(x: f64) -> Value {
    Value::Num(x)
}

fn int_out<T: Into<i128>>(x: T) -> Value {
    Value::Int(x.into())
}

fn usize_out(x: usize) -> Value {
    Value::Int(x as i128)
}

fn u128_out(x: u128) -> R<Value> {
    i128::try_from(x)
        .map(Value::Int)
        .map_err(|_| CaseError::Bug("u128 result too large".into()))
}

fn nums(v: &[f64]) -> Value {
    Value::Arr(v.iter().copied().map(Value::Num).collect())
}

fn usizes(v: &[usize]) -> Value {
    Value::Arr(v.iter().copied().map(usize_out).collect())
}

fn opt_index(v: Option<usize>) -> Value {
    v.map_or(Value::Int(-1), usize_out)
}

fn pt(v: &Value) -> R<Point2D> {
    let a = arr(v)?;
    if a.len() != 2 {
        return bug("point must be [x, y]");
    }
    Ok(Point2D::new(f(&a[0])?, f(&a[1])?))
}

fn pts(v: &Value) -> R<Vec<Point2D>> {
    arr(v)?.iter().map(pt).collect()
}

fn pt_out(p: Point2D) -> Value {
    Value::Arr(vec![num(p.x), num(p.y)])
}

fn graph_of(v: &Value) -> R<Graph> {
    let nodes: usize = fld_int(v, "nodes")?;
    let edges = arr(field(v, "edges")?)?
        .iter()
        .map(|e| {
            let t = arr(e)?;
            if t.len() != 3 {
                return bug("edge must be [from, to, weight]");
            }
            Ok(Edge::new(int(&t[0])?, int(&t[1])?, f(&t[2])?))
        })
        .collect::<R<Vec<Edge>>>()?;
    Ok(Graph::new(nodes, edges))
}

fn edges_out(es: &[Edge]) -> Value {
    Value::Arr(
        es.iter()
            .map(|e| Value::Arr(vec![usize_out(e.from), usize_out(e.to), num(e.weight)]))
            .collect(),
    )
}

/// HyperLogLog item stream: `prefix + decimal(i)` for `i ∈ [0, count)`.
fn items(v: &Value) -> R<Vec<String>> {
    let prefix = st(field(v, "prefix")?)?;
    let count: usize = fld_int(v, "count")?;
    Ok((0..count).map(|i| format!("{prefix}{i}")).collect())
}

fn repeat<T>(count: usize, mut g: impl FnMut() -> R<T>) -> R<Vec<T>> {
    (0..count).map(|_| g()).collect()
}

/// Stable-sort permutation: indices of `keys` in sorted order.
fn stable_perm(i: &Value, sorter: fn(&mut [(f64, usize)])) -> R<Value> {
    let keys = floats(field(i, "keys")?)?;
    let mut pairs: Vec<(f64, usize)> = keys.into_iter().enumerate().map(|(k, x)| (x, k)).collect();
    sorter(&mut pairs);
    Ok(Value::Arr(
        pairs.into_iter().map(|p| usize_out(p.1)).collect(),
    ))
}

fn by_key(a: &(f64, usize), b: &(f64, usize)) -> core::cmp::Ordering {
    a.0.partial_cmp(&b.0).unwrap_or(core::cmp::Ordering::Equal)
}

fn int_sort(i: &Value, sorter: fn(&mut [i64])) -> R<Value> {
    let mut v: Vec<i64> = ints(field(i, "input")?)?;
    sorter(&mut v);
    Ok(Value::Arr(v.into_iter().map(int_out).collect()))
}

/// Every group of the vector file, sorted (SPEC §14).
pub const GROUPS: &[&str] = &[
    "canon.number",
    "compression.huffman",
    "compression.lz77_compress",
    "compression.lz77_decompress",
    "compression.rle_decode",
    "compression.rle_encode",
    "datastructure.bloom",
    "datastructure.disjoint_set",
    "datastructure.fenwick",
    "datastructure.hyperloglog",
    "datastructure.hyperloglog_merge",
    "datastructure.segment_tree",
    "geometry.bezier",
    "geometry.closest_pair",
    "geometry.convex_hull",
    "geometry.cross",
    "geometry.point_in_polygon",
    "graph.a_star",
    "graph.bellman_ford",
    "graph.bfs",
    "graph.bipartite_matching",
    "graph.dfs",
    "graph.dijkstra",
    "graph.dinic",
    "graph.floyd_warshall",
    "graph.kruskal",
    "graph.pagerank",
    "graph.prim",
    "graph.tarjan_scc",
    "graph.topological_sort",
    "hash.fnv1a32",
    "hash.fnv1a64",
    "hash.murmur3_32",
    "hash.siphash24",
    "hash.xxhash32",
    "hash.xxhash64",
    "math.crt",
    "math.extended_gcd",
    "math.factorize",
    "math.gcd",
    "math.is_prime",
    "math.karatsuba",
    "math.lcm",
    "math.mat_mul",
    "math.mod_inverse",
    "math.mod_pow",
    "math.next_prime",
    "math.ntt",
    "math.poly_mul_ntt",
    "math.segmented_sieve",
    "math.sieve",
    "math.strassen",
    "ml.batch_cosine",
    "ml.cosine",
    "ml.dot",
    "ml.jaccard",
    "ml.kmeans",
    "ml.l1_distance",
    "ml.l2_distance",
    "ml.l2_norm",
    "ml.normalize",
    "ml.pearson",
    "rng.pcg32",
    "rng.pcg32_bounded",
    "rng.splitmix64",
    "rng.xoshiro256pp",
    "rng.xoshiro256pp_float",
    "rng.xoshiro256pp_int",
    "search.binary",
    "search.exponential",
    "search.fibonacci",
    "search.interpolation",
    "search.jump",
    "search.linear",
    "search.lower_bound",
    "search.ternary",
    "search.upper_bound",
    "sort.counting",
    "sort.heapsort",
    "sort.mergesort",
    "sort.mergesort_stable",
    "sort.quicksort",
    "sort.radix_lsd",
    "sort.timsort",
    "sort.timsort_stable",
    "string.aho_corasick",
    "string.damerau_levenshtein",
    "string.jaro",
    "string.jaro_winkler",
    "string.kmp",
    "string.levenshtein",
    "string.polynomial_hash",
];

/// Run one case; a library [`la::Error`] becomes `{"error": "<CODE>"}` (SPEC §2, §4.2).
///
/// # Errors
/// [`CaseError::Bug`] for an unknown group or malformed input (the run must fail).
pub fn run_case(group: &str, i: &Value) -> Result<Value, String> {
    match dispatch(group, i) {
        Ok(v) => Ok(v),
        Err(CaseError::Algo(e)) => Ok(Value::obj([("error", Value::Str(e.code().into()))])),
        Err(CaseError::Bug(m)) => Err(format!("{group}: {m}")),
    }
}

#[allow(clippy::too_many_lines)]
fn dispatch(group: &str, i: &Value) -> R<Value> {
    Ok(match group {
        // ── §3 canonical number formatting ──────────────────────────────────────────────
        "canon.number" => {
            let b = hex_in(i, "bits")?;
            let bytes: [u8; 8] = b
                .try_into()
                .map_err(|_| CaseError::Bug("bits must be 8 bytes".into()))?;
            num(f64::from_bits(u64::from_be_bytes(bytes)))
        }

        // ── §5 PRNG ─────────────────────────────────────────────────────────────────────
        "rng.splitmix64" => {
            let mut r = SplitMix64::new(fld_int(i, "seed")?);
            Value::Arr(repeat(fld_int(i, "count")?, || Ok(hex64(r.next_u64())))?)
        }
        "rng.xoshiro256pp" => {
            let mut r = Xoshiro256pp::new(fld_int(i, "seed")?);
            Value::Arr(repeat(fld_int(i, "count")?, || Ok(hex64(r.next_u64())))?)
        }
        "rng.xoshiro256pp_float" => {
            let mut r = Xoshiro256pp::new(fld_int(i, "seed")?);
            Value::Arr(repeat(fld_int(i, "count")?, || Ok(num(r.next_float())))?)
        }
        "rng.xoshiro256pp_int" => {
            let mut r = Xoshiro256pp::new(fld_int(i, "seed")?);
            let n: u64 = fld_int(i, "n")?;
            Value::Arr(repeat(fld_int(i, "count")?, || {
                Ok(int_out(r.next_int(n)?))
            })?)
        }
        "rng.pcg32" => {
            let mut r = Pcg32::new(fld_int(i, "state")?, fld_int(i, "seq")?);
            Value::Arr(repeat(fld_int(i, "count")?, || Ok(int_out(r.next_u32())))?)
        }
        "rng.pcg32_bounded" => {
            let mut r = Pcg32::new(fld_int(i, "state")?, fld_int(i, "seq")?);
            let b: u32 = fld_int(i, "bound")?;
            Value::Arr(repeat(fld_int(i, "count")?, || {
                Ok(int_out(r.next_bounded(b)?))
            })?)
        }

        // ── §6 sort ─────────────────────────────────────────────────────────────────────
        "sort.quicksort" => int_sort(i, sort::quicksort)?,
        "sort.timsort" => int_sort(i, sort::timsort)?,
        "sort.mergesort" => int_sort(i, sort::mergesort)?,
        "sort.heapsort" => int_sort(i, sort::heapsort)?,
        "sort.radix_lsd" => int_sort(i, sort::radix_sort_lsd)?,
        "sort.counting" => {
            let v: Vec<i64> = ints(field(i, "input")?)?;
            Value::Arr(
                sort::counting_sort(&v, None)?
                    .into_iter()
                    .map(int_out)
                    .collect(),
            )
        }
        "sort.timsort_stable" => stable_perm(i, |a| sort::timsort_by(a, by_key))?,
        "sort.mergesort_stable" => stable_perm(i, |a| sort::mergesort_by(a, by_key))?,

        // ── §7 search ───────────────────────────────────────────────────────────────────
        "search.binary"
        | "search.lower_bound"
        | "search.upper_bound"
        | "search.interpolation"
        | "search.exponential"
        | "search.jump"
        | "search.fibonacci"
        | "search.linear" => {
            let a: Vec<i64> = ints(field(i, "arr")?)?;
            let t: i64 = fld_int(i, "target")?;
            match group {
                "search.binary" => opt_index(search::binary_search(&a, &t)),
                "search.lower_bound" => usize_out(search::lower_bound(&a, &t)),
                "search.upper_bound" => usize_out(search::upper_bound(&a, &t)),
                "search.interpolation" => opt_index(search::interpolation_search(&a, t)),
                "search.exponential" => opt_index(search::exponential_search(&a, &t)),
                "search.jump" => opt_index(search::jump_search(&a, &t)),
                "search.fibonacci" => opt_index(search::fibonacci_search(&a, &t)),
                _ => opt_index(search::linear_search(&a, &t)),
            }
        }
        "search.ternary" => {
            let c = fld_f(i, "c")?;
            let maximize = boolean(field(i, "maximize")?)?;
            let (lo, hi, eps) = (fld_f(i, "lo")?, fld_f(i, "hi")?, fld_f(i, "epsilon")?);
            let x = if maximize {
                search::ternary_search(lo, hi, |x| -((x - c) * (x - c)), true, eps)
            } else {
                search::ternary_search(lo, hi, |x| (x - c) * (x - c), false, eps)
            };
            num(x)
        }

        // ── §10 math ────────────────────────────────────────────────────────────────────
        "math.gcd" => int_out(math::gcd(fld_int(i, "a")?, fld_int(i, "b")?)),
        "math.lcm" => u128_out(math::lcm(fld_int(i, "a")?, fld_int(i, "b")?))?,
        "math.extended_gcd" => {
            let r = math::extended_gcd(fld_int(i, "a")?, fld_int(i, "b")?);
            Value::obj([
                ("g", int_out(r.g)),
                ("x", int_out(r.x)),
                ("y", int_out(r.y)),
            ])
        }
        "math.mod_inverse" => int_out(math::mod_inverse(fld_int(i, "a")?, fld_int(i, "m")?)?),
        "math.mod_pow" => int_out(math::mod_pow(
            fld_int(i, "base")?,
            fld_int(i, "exp")?,
            fld_int(i, "mod")?,
        )?),
        "math.crt" => {
            let r: Vec<i64> = ints(field(i, "r")?)?;
            let m: Vec<i64> = ints(field(i, "m")?)?;
            u128_out(math::crt(&r, &m)?)?
        }
        "math.is_prime" => Value::Bool(math::is_prime(fld_int(i, "n")?)),
        "math.next_prime" => int_out(math::next_prime(fld_int(i, "n")?)?),
        "math.sieve" => usizes(&math::sieve(fld_int(i, "n")?)),
        "math.segmented_sieve" => Value::Arr(
            math::segmented_sieve(fld_int(i, "lo")?, fld_int(i, "hi")?)
                .into_iter()
                .map(int_out)
                .collect(),
        ),
        "math.factorize" => Value::Arr(
            math::factorize(fld_int(i, "n")?)
                .into_iter()
                .map(int_out)
                .collect(),
        ),
        "math.karatsuba" => int_out(math::karatsuba(fld_int(i, "x")?, fld_int(i, "y")?)),
        "math.ntt" => {
            let a: Vec<u64> = ints(field(i, "a")?)?;
            Value::Arr(math::ntt(&a)?.into_iter().map(int_out).collect())
        }
        "math.poly_mul_ntt" => {
            let a: Vec<u64> = ints(field(i, "a")?)?;
            let b: Vec<u64> = ints(field(i, "b")?)?;
            Value::Arr(
                math::poly_mul_ntt(&a, &b)?
                    .into_iter()
                    .map(int_out)
                    .collect(),
            )
        }
        "math.mat_mul" | "math.strassen" => {
            let a = matrix(field(i, "a")?)?;
            let b = matrix(field(i, "b")?)?;
            let c = if group == "math.mat_mul" {
                math::mat_mul(&a, &b)?
            } else {
                math::strassen_mul(&a, &b)?
            };
            Value::Arr(c.iter().map(|r| nums(r)).collect())
        }

        // ── §11 string ──────────────────────────────────────────────────────────────────
        "string.kmp" => usizes(&s::kmp_search(
            st(field(i, "text")?)?,
            st(field(i, "pattern")?)?,
        )),
        "string.levenshtein" => usize_out(s::levenshtein(st(field(i, "a")?)?, st(field(i, "b")?)?)),
        "string.damerau_levenshtein" => usize_out(s::damerau_levenshtein(
            st(field(i, "a")?)?,
            st(field(i, "b")?)?,
        )),
        "string.jaro" => num(s::jaro(st(field(i, "a")?)?, st(field(i, "b")?)?)),
        "string.jaro_winkler" => {
            let p = opt(i, "p").map_or(Ok(0.1), f)?;
            num(s::jaro_winkler(st(field(i, "a")?)?, st(field(i, "b")?)?, p))
        }
        "string.aho_corasick" => {
            let mut ac = s::AhoCorasick::new();
            for p in strs(field(i, "patterns")?)? {
                ac.add_pattern(p);
            }
            Value::Arr(
                ac.search(st(field(i, "text")?)?)
                    .into_iter()
                    .map(|m| Value::Arr(vec![Value::Str(m.pattern), usize_out(m.index)]))
                    .collect(),
            )
        }
        "string.polynomial_hash" => {
            let base = opt(i, "base").map_or(Ok(31), int)?;
            let m = opt(i, "mod").map_or(Ok(1_000_000_007), int)?;
            int_out(s::polynomial_hash(st(field(i, "s")?)?, base, m)?)
        }

        // ── §12 hashes (bytes as hex) ───────────────────────────────────────────────────
        "hash.fnv1a32" => int_out(s::fnv1a32(&hex_in(i, "data")?)),
        "hash.fnv1a64" => hex64(s::fnv1a64(&hex_in(i, "data")?)),
        "hash.murmur3_32" => int_out(s::murmur3_32(&hex_in(i, "data")?, fld_int(i, "seed")?)),
        "hash.xxhash32" => int_out(s::xxhash32(&hex_in(i, "data")?, fld_int(i, "seed")?)),
        "hash.xxhash64" => hex64(s::xxhash64(&hex_in(i, "data")?, fld_int(i, "seed")?)),
        "hash.siphash24" => hex64(s::siphash24(&hex_in(i, "key")?, &hex_in(i, "data")?)?),

        // ── §8 data structures ──────────────────────────────────────────────────────────
        "datastructure.bloom" => {
            let mut bf = BloomFilter::with_params(fld_int(i, "m")?, fld_int(i, "k")?)?;
            for x in strs(field(i, "add")?)? {
                bf.add(x);
            }
            let has = strs(field(i, "query")?)?
                .into_iter()
                .map(|q| Value::Bool(bf.has(q)))
                .collect();
            Value::obj([
                ("bits", Value::Str(to_hex(bf.as_bytes()))),
                ("set_bits", int_out(bf.set_bits())),
                ("has", Value::Arr(has)),
            ])
        }
        "datastructure.hyperloglog" => {
            let mut h = HyperLogLog::new(fld_int(i, "b")?);
            for x in items(field(i, "items")?)? {
                h.add(&x);
            }
            Value::obj([
                ("estimate", num(h.count())),
                ("registers_fnv1a64", hex64(s::fnv1a64(h.registers()))),
            ])
        }
        "datastructure.hyperloglog_merge" => {
            let b: u32 = fld_int(i, "b")?;
            let (mut x, mut y) = (HyperLogLog::new(b), HyperLogLog::new(b));
            for it in items(field(i, "a")?)? {
                x.add(&it);
            }
            for it in items(field(i, "b_items")?)? {
                y.add(&it);
            }
            num(x.merge(&y)?.count())
        }
        "datastructure.disjoint_set" => {
            let mut ds = DisjointSet::new(fld_int(i, "n")?);
            let mut out = Vec::new();
            for op in arr(field(i, "ops")?)? {
                let op = arr(op)?;
                let name = st(op
                    .first()
                    .ok_or_else(|| CaseError::Bug("empty op".into()))?)?;
                let arg = |k: usize| -> R<usize> {
                    op.get(k).map_or_else(|| bug("missing op argument"), int)
                };
                out.push(match name {
                    "union" => Value::Bool(ds.union(arg(1)?, arg(2)?)?),
                    "find" => usize_out(ds.find(arg(1)?)?),
                    "connected" => Value::Bool(ds.connected(arg(1)?, arg(2)?)?),
                    "count" => usize_out(ds.count()),
                    other => return bug(format!("unknown op {other}")),
                });
            }
            Value::Arr(out)
        }
        "datastructure.fenwick" => {
            let init: Vec<i64> = ints(field(i, "init")?)?;
            let mut ft = FenwickTree::from_slice(&init);
            let mut out = Vec::new();
            for op in arr(field(i, "ops")?)? {
                let op = arr(op)?;
                let name = st(op
                    .first()
                    .ok_or_else(|| CaseError::Bug("empty op".into()))?)?;
                let a: usize = op.get(1).map_or_else(|| bug("missing op argument"), int)?;
                out.push(match name {
                    "update" => {
                        let v: i64 = op.get(2).map_or_else(|| bug("missing value"), int)?;
                        ft.update(a, v)?;
                        Value::Null
                    }
                    "prefix" => int_out(ft.prefix_sum(a)?),
                    "range" => {
                        let b: usize = op.get(2).map_or_else(|| bug("missing r"), int)?;
                        int_out(ft.range_sum(a, b)?)
                    }
                    "point" => int_out(ft.point_query(a)?),
                    other => return bug(format!("unknown op {other}")),
                });
            }
            Value::Arr(out)
        }
        "datastructure.segment_tree" => {
            let init: Vec<i64> = ints(field(i, "init")?)?;
            let mut t = SegmentTree::new(&init);
            let mut out = Vec::new();
            for op in arr(field(i, "ops")?)? {
                let op = arr(op)?;
                let name = st(op
                    .first()
                    .ok_or_else(|| CaseError::Bug("empty op".into()))?)?;
                let l: usize = op.get(1).map_or_else(|| bug("missing l"), int)?;
                let r: usize = op.get(2).map_or_else(|| bug("missing r"), int)?;
                out.push(match name {
                    "update" => {
                        let v: i64 = op.get(3).map_or_else(|| bug("missing value"), int)?;
                        t.update(l, r, v);
                        Value::Null
                    }
                    "query" => int_out(t.query(l, r)),
                    other => return bug(format!("unknown op {other}")),
                });
            }
            Value::Arr(out)
        }

        // ── §9 graph ────────────────────────────────────────────────────────────────────
        "graph.bfs" => {
            let d = graph::bfs(&graph_of(field(i, "graph")?)?, fld_int(i, "source")?)?;
            Value::Arr(d.into_iter().map(opt_index).collect())
        }
        "graph.dfs" => usizes(&graph::dfs(
            &graph_of(field(i, "graph")?)?,
            fld_int(i, "source")?,
        )?),
        "graph.dijkstra" => nums(&graph::dijkstra(
            &graph_of(field(i, "graph")?)?,
            fld_int(i, "source")?,
        )?),
        "graph.bellman_ford" => {
            let r = graph::bellman_ford(&graph_of(field(i, "graph")?)?, fld_int(i, "source")?)?;
            Value::obj([
                ("distances", nums(&r.distances)),
                ("has_negative_cycle", Value::Bool(r.has_negative_cycle)),
            ])
        }
        "graph.floyd_warshall" => Value::Arr(
            graph::floyd_warshall(&graph_of(field(i, "graph")?)?)?
                .iter()
                .map(|r| nums(r))
                .collect(),
        ),
        "graph.topological_sort" => {
            usizes(&graph::topological_sort(&graph_of(field(i, "graph")?)?)?)
        }
        "graph.kruskal" => edges_out(&graph::kruskal(&graph_of(field(i, "graph")?)?)?),
        "graph.prim" => edges_out(&graph::prim(&graph_of(field(i, "graph")?)?)?),
        "graph.tarjan_scc" => Value::Arr(
            graph::tarjan_scc(&graph_of(field(i, "graph")?)?)?
                .iter()
                .map(|c| usizes(c))
                .collect(),
        ),
        "graph.dinic" => num(graph::dinic(
            &graph_of(field(i, "graph")?)?,
            fld_int(i, "source")?,
            fld_int(i, "sink")?,
        )?),
        "graph.bipartite_matching" => {
            let pairs = arr(field(i, "pairs")?)?
                .iter()
                .map(|p| {
                    let p = arr(p)?;
                    if p.len() != 2 {
                        return bug("pair must be [l, r]");
                    }
                    Ok((int(&p[0])?, int(&p[1])?))
                })
                .collect::<R<Vec<(usize, usize)>>>()?;
            let r =
                graph::bipartite_matching(fld_int(i, "n_left")?, fld_int(i, "n_right")?, &pairs)?;
            usize_out(r.size)
        }
        "graph.a_star" => {
            let g = graph_of(field(i, "graph")?)?;
            let h = opt(i, "heuristic").map(floats).transpose()?;
            let heur = |v: usize| {
                h.as_ref()
                    .map_or(0.0, |h| h.get(v).copied().unwrap_or(f64::NAN))
            };
            let r = graph::a_star(&g, fld_int(i, "source")?, fld_int(i, "target")?, heur)?;
            Value::obj([("path", usizes(&r.path)), ("cost", num(r.cost))])
        }
        "graph.pagerank" => nums(&graph::page_rank(
            &graph_of(field(i, "graph")?)?,
            fld_f(i, "damping")?,
            fld_int(i, "iterations")?,
        )?),

        // ── §13.1 ml ────────────────────────────────────────────────────────────────────
        "ml.dot" => num(ml::dot_product(
            &floats(field(i, "a")?)?,
            &floats(field(i, "b")?)?,
        )?),
        "ml.l2_norm" => num(ml::l2_norm(&floats(field(i, "v")?)?)),
        "ml.cosine" => num(ml::cosine_similarity(
            &floats(field(i, "a")?)?,
            &floats(field(i, "b")?)?,
        )?),
        "ml.l2_distance" => num(ml::l2_distance(
            &floats(field(i, "a")?)?,
            &floats(field(i, "b")?)?,
        )?),
        "ml.l1_distance" => num(ml::l1_distance(
            &floats(field(i, "a")?)?,
            &floats(field(i, "b")?)?,
        )?),
        "ml.normalize" => nums(&ml::normalize(&floats(field(i, "v")?)?)),
        "ml.jaccard" => num(ml::jaccard_similarity(
            &strs(field(i, "a")?)?,
            &strs(field(i, "b")?)?,
        )),
        "ml.pearson" => num(ml::pearson(
            &floats(field(i, "a")?)?,
            &floats(field(i, "b")?)?,
        )?),
        "ml.batch_cosine" => Value::Arr(
            ml::batch_cosine(
                &floats(field(i, "query")?)?,
                &matrix(field(i, "candidates")?)?,
            )?
            .into_iter()
            .map(|r| Value::Arr(vec![usize_out(r.index), num(r.score)]))
            .collect(),
        ),
        "ml.kmeans" => {
            let opts = ml::KMeansOptions {
                max_iter: fld_int(i, "max_iter")?,
                tol: fld_f(i, "tol")?,
                seed: fld_int(i, "seed")?,
            };
            let r = ml::kmeans(&matrix(field(i, "points")?)?, fld_int(i, "k")?, opts)?;
            Value::obj([
                (
                    "centroids",
                    Value::Arr(r.centroids.iter().map(|c| nums(c)).collect()),
                ),
                ("labels", usizes(&r.labels)),
                ("iterations", usize_out(r.iterations)),
                ("inertia", num(r.inertia)),
            ])
        }

        // ── §13.2 geometry ──────────────────────────────────────────────────────────────
        "geometry.cross" => num(geo::cross(
            pt(field(i, "o")?)?,
            pt(field(i, "a")?)?,
            pt(field(i, "b")?)?,
        )),
        "geometry.convex_hull" => Value::Arr(
            geo::convex_hull(&pts(field(i, "points")?)?)
                .into_iter()
                .map(pt_out)
                .collect(),
        ),
        "geometry.closest_pair" => num(geo::closest_pair(&pts(field(i, "points")?)?)?.2),
        "geometry.point_in_polygon" => Value::Bool(geo::point_in_polygon(
            pt(field(i, "point")?)?,
            &pts(field(i, "polygon")?)?,
        )),
        "geometry.bezier" => pt_out(geo::bezier(&pts(field(i, "points")?)?, fld_f(i, "t")?)?),

        // ── §13.3 compression ───────────────────────────────────────────────────────────
        "compression.rle_encode" => Value::Str(to_hex(&rle_encode(&hex_in(i, "data")?))),
        "compression.rle_decode" => Value::Str(to_hex(&rle_decode(&hex_in(i, "data")?)?)),
        "compression.lz77_compress" => {
            let w = opt(i, "window").map_or(Ok(255), int)?;
            Value::Str(to_hex(&lz77_compress(&hex_in(i, "data")?, w)?))
        }
        "compression.lz77_decompress" => Value::Str(to_hex(&lz77_decompress(&hex_in(i, "data")?)?)),
        "compression.huffman" => {
            let r = huffman_encode(&hex_in(i, "data")?);
            Value::obj([
                ("encoded", Value::Str(to_hex(&r.encoded))),
                ("bit_length", usize_out(r.bit_length)),
                (
                    "codes",
                    Value::Arr(
                        r.codes
                            .into_iter()
                            .map(|(b, c)| Value::Arr(vec![int_out(b), Value::Str(c)]))
                            .collect(),
                    ),
                ),
            ])
        }

        other => return bug(format!("unknown vector group {other}")),
    })
}
