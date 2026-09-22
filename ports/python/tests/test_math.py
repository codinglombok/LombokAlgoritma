# LombokAlgoritma — Python Math Tests
import pytest
from lombokalgoritma.math import sha256_hex, gcd, lcm, mod_pow, is_prime, mod_inverse, hkdf

def test_sha256_empty(): assert sha256_hex(b"") == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
def test_sha256_deterministic(): assert sha256_hex(b"test") == sha256_hex(b"test")
def test_sha256_different(): assert sha256_hex(b"a") != sha256_hex(b"b")
def test_sha256_len(): assert len(sha256_hex(b"hello")) == 64

def test_gcd(): assert gcd(12, 8) == 4; assert gcd(0, 5) == 5
def test_lcm(): assert lcm(4, 6) == 12
def test_mod_pow(): assert mod_pow(2, 10, 1000) == 24
def test_mod_inverse(): assert mod_inverse(3, 11) == 4
def test_is_prime():
    assert is_prime(2) and is_prime(97) and is_prime(2147483647)
    assert not is_prime(1) and not is_prime(4) and not is_prime(100)

def test_hkdf_length():
    okm = hkdf(bytes(22), 42)
    assert len(okm) == 42
def test_hkdf_deterministic():
    assert hkdf(bytes(16), 32) == hkdf(bytes(16), 32)
