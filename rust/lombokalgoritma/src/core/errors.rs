//! Shared error type.
use alloc::string::String;

/// Error returned by fallible algorithms.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AlgoError {
    /// Index outside `0..length`.
    OutOfBounds {
        /// Offending index.
        index: usize,
        /// Collection length.
        length: usize,
    },
    /// Arithmetic overflow in the named operation.
    Overflow {
        /// Operation name.
        operation: &'static str,
    },
    /// Input rejected with a reason.
    InvalidInput(String),
    /// Input was empty.
    EmptyInput,
}

/// `Result` alias for [`AlgoError`].
pub type AlgoResult<T> = Result<T, AlgoError>;
