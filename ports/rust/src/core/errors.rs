#[cfg(feature = "no_std")]
use alloc::string::String;
#[cfg(not(feature = "no_std"))]
use std::string::String;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AlgoError {
    OutOfBounds { index: usize, length: usize },
    Overflow { operation: &'static str },
    InvalidInput(String),
    EmptyInput,
}
pub type AlgoResult<T> = Result<T, AlgoError>;
