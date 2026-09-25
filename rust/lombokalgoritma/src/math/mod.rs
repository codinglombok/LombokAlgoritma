//! Number theory and (deprecated) SHA-256.
pub mod gcd;
pub mod modular;
pub mod sha256;

pub use gcd::{gcd, lcm, mod_inverse};
pub use modular::mod_pow;
#[allow(deprecated)]
pub use sha256::{sha256, sha256_hex};
