// LombokAlgoritma — number theory and linear algebra (SPEC §10)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
//! Exact integer algorithms (128-bit intermediates where needed) and matrix products.
//! `fft` (float, `sin`/`cos`) is TypeScript-only and not part of this port.
mod gcd;
mod karatsuba;
mod matrix;
mod modular;
mod ntt;
mod pollard_rho;
mod prime;
mod sieve;

pub use gcd::{extended_gcd, gcd, gcd_u64, lcm, mod_inverse, ExtendedGcd};
pub use karatsuba::karatsuba;
pub use matrix::{mat_mul, strassen_mul, Matrix};
pub use modular::{crt, mod_pow, mod_pow_u64};
pub use ntt::{intt, intt_with, ntt, ntt_with, poly_mul_ntt, NTT_MOD, NTT_ROOT};
pub use pollard_rho::{factorize, factorize_u64, pollard_rho};
pub use prime::{is_prime, next_prime};
pub use sieve::{segmented_sieve, sieve};
