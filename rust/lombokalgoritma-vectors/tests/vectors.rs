// LombokAlgoritma — shared vectors as a cargo test (SPEC §14)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Runs the whole vector file; also compares with the TypeScript runner output when present.
use lombokalgoritma_vectors::{default_vector_file, run_vectors};

#[test]
fn all_vectors_pass() {
    let text = std::fs::read_to_string(default_vector_file()).expect("vector file");
    let rep = run_vectors(&text).expect("valid vector file");
    assert!(rep.missing.is_empty(), "unknown groups: {:?}", rep.missing);
    assert!(
        rep.failures.is_empty(),
        "failures:\n{}",
        rep.failures.join("\n")
    );
    assert_eq!(rep.cases, rep.lines.len());
    assert!(rep.cases >= 1059);
    let ts = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../out/typescript.txt");
    if let Ok(reference) = std::fs::read_to_string(ts) {
        let mut mine = rep.lines.join("\n");
        mine.push('\n');
        assert!(mine == reference, "output differs from out/typescript.txt");
    }
}

#[test]
fn rejects_unknown_groups_and_mismatches() {
    let doc = r#"{"format":"lombokalgoritma-vectors","version":1,"groups":{
"nope.group":[{"id":"1","input":{},"expected":0}],
"math.gcd":[{"id":"1","input":{"a":4,"b":6},"expected":3},{"id":"2","input":{"a":"x","b":6},"expected":2},
{"id":"3","input":{"a":4,"b":6},"expected":2}],
"math.mod_pow":[{"id":"e","input":{"base":2,"exp":-1,"mod":5},"expected":{"error":"OUT_OF_RANGE"}}]}}"#;
    let rep = run_vectors(doc).unwrap();
    assert_eq!(rep.missing, ["nope.group"]);
    assert_eq!(rep.failures.len(), 2);
    assert!(!rep.ok());
    assert_eq!(rep.lines[2], "math.gcd\t3\t2");
    assert_eq!(
        rep.lines[3],
        "math.mod_pow\te\t{\"error\":\"OUT_OF_RANGE\"}"
    );
    assert!(run_vectors(r#"{"format":"x","version":1,"groups":{}}"#).is_err());
    assert!(run_vectors(r#"{"format":"lombokalgoritma-vectors","version":1}"#).is_err());
}
