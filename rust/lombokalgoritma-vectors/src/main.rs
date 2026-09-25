// LombokAlgoritma — shared-vector runner CLI (Rust port), SPEC §4.3 / §14
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! `cargo run -q -p lombokalgoritma-vectors -- ../vectors/lombokalgoritma-vectors-v1.json > ../out/rust.txt`
//!
//! Writes `group<TAB>id<TAB>canonical(actual)` per case to stdout; failures go to stderr and the
//! exit status is non-zero on any mismatch, runner error or unknown group.
use std::io::Write as _;
use std::process::ExitCode;

fn main() -> ExitCode {
    let path = std::env::args_os().nth(1).map_or_else(
        lombokalgoritma_vectors::default_vector_file,
        std::path::PathBuf::from,
    );
    let text = match std::fs::read_to_string(&path) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("cannot read {}: {e}", path.display());
            return ExitCode::from(2);
        }
    };
    let rep = match lombokalgoritma_vectors::run_vectors(&text) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("{e}");
            return ExitCode::from(2);
        }
    };
    let stdout = std::io::stdout();
    let mut out = std::io::BufWriter::new(stdout.lock());
    for line in &rep.lines {
        if writeln!(out, "{line}").is_err() {
            return ExitCode::from(2);
        }
    }
    if out.flush().is_err() {
        return ExitCode::from(2);
    }
    for g in &rep.missing {
        eprintln!("unknown vector group: {g}");
    }
    for f in &rep.failures {
        eprintln!("FAIL {f}");
    }
    eprintln!(
        "{} cases, {} failures, {} unknown groups",
        rep.cases,
        rep.failures.len(),
        rep.missing.len()
    );
    if rep.ok() {
        ExitCode::SUCCESS
    } else {
        ExitCode::FAILURE
    }
}
