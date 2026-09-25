// LombokAlgoritma — shared-vector runner (Rust port), SPEC §4
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Runs `vectors/lombokalgoritma-vectors-v1.json` against the `lombokalgoritma` crate and emits
//! `group<TAB>id<TAB>canonical(actual)` lines (groups sorted, cases in file order), which must be
//! byte-identical to the TypeScript reference runner's output.
pub mod dispatch;
pub mod json;

use json::{canonical, Value};

/// Outcome of a full run.
#[derive(Debug, Default)]
pub struct RunReport {
    /// One output line per case (without the trailing newline).
    pub lines: Vec<String>,
    /// Mismatches vs `expected` and runner bugs.
    pub failures: Vec<String>,
    /// Groups of the file that the dispatch table does not know.
    pub missing: Vec<String>,
    /// Number of cases run.
    pub cases: usize,
}

impl RunReport {
    /// `true` when every group was known and every case matched.
    pub fn ok(&self) -> bool {
        self.failures.is_empty() && self.missing.is_empty()
    }
}

/// Default vector file, relative to this crate.
pub fn default_vector_file() -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../vectors/lombokalgoritma-vectors-v1.json")
}

/// Run every case of the vector document `text`.
///
/// # Errors
/// A message when the document is not a valid version-1 vector file.
pub fn run_vectors(text: &str) -> Result<RunReport, String> {
    let doc = json::parse(text)?;
    if doc.get("format") != Some(&Value::Str("lombokalgoritma-vectors".into()))
        || doc.get("version") != Some(&Value::Num(1.0))
    {
        return Err("unsupported vector file".into());
    }
    let Some(Value::Obj(groups)) = doc.get("groups") else {
        return Err("vector file has no groups".into());
    };
    let mut groups: Vec<&(String, Value)> = groups.iter().collect();
    groups.sort_by(|a, b| a.0.encode_utf16().cmp(b.0.encode_utf16()));
    let mut rep = RunReport::default();
    for (group, cases) in groups {
        if !dispatch::GROUPS.contains(&group.as_str()) {
            rep.missing.push(group.clone());
            continue;
        }
        let Value::Arr(cases) = cases else {
            return Err(format!("group {group} is not an array"));
        };
        for c in cases {
            rep.cases += 1;
            let id = match c.get("id") {
                Some(Value::Str(s)) => s.clone(),
                _ => return Err(format!("case without id in {group}")),
            };
            let input = c.get("input").unwrap_or(&Value::Null);
            let want = canonical(c.get("expected").unwrap_or(&Value::Null));
            match dispatch::run_case(group, input) {
                Ok(v) => {
                    let got = canonical(&v);
                    if got != want {
                        rep.failures
                            .push(format!("{group}/{id}: expected {want}, got {got}"));
                    }
                    rep.lines.push(format!("{group}\t{id}\t{got}"));
                }
                Err(e) => {
                    rep.failures.push(format!("{group}/{id}: {e}"));
                    rep.lines.push(format!("{group}\t{id}\t<runner error>"));
                }
            }
        }
    }
    Ok(rep)
}
