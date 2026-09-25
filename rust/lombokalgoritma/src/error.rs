// LombokAlgoritma — error type
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! The crate-wide error type carrying the canonical codes of SPEC §2.
use ::core::fmt;

/// Error returned by every fallible LombokAlgoritma function.
///
/// Programs should branch on the variant (or on [`Error::code`]), never on the message text.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Error {
    /// Malformed input: length/shape mismatch, corrupt encoded stream, wrong key size.
    InvalidInput,
    /// A parameter or element lies outside its permitted range.
    OutOfRange,
    /// Too few elements for the operation.
    EmptyInput,
    /// A negative weight/capacity where the algorithm requires ≥ 0.
    NegativeWeight,
    /// No modular inverse exists (gcd ≠ 1).
    NoInverse,
    /// CRT moduli are not pairwise coprime.
    NotCoprime,
    /// Overflow in a checked arithmetic operation.
    Overflow,
    /// Index outside a container.
    OutOfBounds,
    /// Platform feature unavailable.
    Unsupported,
}

impl Error {
    /// Every variant, in SPEC §2 order.
    pub const ALL: [Error; 9] = [
        Error::InvalidInput,
        Error::OutOfRange,
        Error::EmptyInput,
        Error::NegativeWeight,
        Error::NoInverse,
        Error::NotCoprime,
        Error::Overflow,
        Error::OutOfBounds,
        Error::Unsupported,
    ];

    /// Canonical error code (SPEC §2), identical in every port — e.g. `"OUT_OF_RANGE"`.
    pub const fn code(self) -> &'static str {
        match self {
            Error::InvalidInput => "INVALID_INPUT",
            Error::OutOfRange => "OUT_OF_RANGE",
            Error::EmptyInput => "EMPTY_INPUT",
            Error::NegativeWeight => "NEGATIVE_WEIGHT",
            Error::NoInverse => "NO_INVERSE",
            Error::NotCoprime => "NOT_COPRIME",
            Error::Overflow => "OVERFLOW",
            Error::OutOfBounds => "OUT_OF_BOUNDS",
            Error::Unsupported => "UNSUPPORTED",
        }
    }

    /// Short human-readable description.
    pub const fn message(self) -> &'static str {
        match self {
            Error::InvalidInput => "malformed input",
            Error::OutOfRange => "parameter or element out of range",
            Error::EmptyInput => "not enough input elements",
            Error::NegativeWeight => "negative edge weight or capacity",
            Error::NoInverse => "modular inverse does not exist",
            Error::NotCoprime => "moduli are not pairwise coprime",
            Error::Overflow => "arithmetic overflow",
            Error::OutOfBounds => "index out of bounds",
            Error::Unsupported => "unsupported on this platform",
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.code(), self.message())
    }
}

#[cfg(feature = "std")]
impl std::error::Error for Error {}

/// `Result` alias using [`Error`].
pub type Result<T> = ::core::result::Result<T, Error>;

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::format;

    #[test]
    fn codes_are_canonical() {
        let codes: alloc::vec::Vec<&str> = Error::ALL.iter().map(|e| e.code()).collect();
        assert_eq!(
            codes,
            [
                "INVALID_INPUT",
                "OUT_OF_RANGE",
                "EMPTY_INPUT",
                "NEGATIVE_WEIGHT",
                "NO_INVERSE",
                "NOT_COPRIME",
                "OVERFLOW",
                "OUT_OF_BOUNDS",
                "UNSUPPORTED"
            ]
        );
        for e in Error::ALL {
            let s = format!("{e}");
            assert!(s.starts_with(e.code()));
            assert!(s.ends_with(e.message()));
        }
    }
}
