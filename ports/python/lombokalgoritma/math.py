# LombokAlgoritma — Python Math Module
# Apache-2.0 — @codinglombok
import struct, hashlib
from typing import Optional

def sha256(data: bytes | str) -> bytes:
    """SHA-256 (delegates to hashlib for Python — constant-time in C extension)."""
    if isinstance(data, str): data = data.encode()
    return hashlib.sha256(data).digest()

def sha256_hex(data: bytes | str) -> str:
    return sha256(data).hex()

def hmac_sha256(key: bytes, data: bytes) -> bytes:
    import hmac as _hmac
    return _hmac.new(key, data, hashlib.sha256).digest()

def hkdf(ikm: bytes, length: int, *, salt: Optional[bytes]=None, info: bytes=b"") -> bytes:
    salt = salt or bytes(32)
    prk = hmac_sha256(salt, ikm)
    okm = b""; prev = b""
    for i in range(1, -(-length // 32) + 1):
        block = prev + info + bytes([i])
        prev = hmac_sha256(prk, block)
        okm += prev
    return okm[:length]

def gcd(a: int, b: int) -> int:
    while b: a, b = b, a % b
    return abs(a)

def lcm(a: int, b: int) -> int:
    return abs(a * b) // gcd(a, b) if a and b else 0

def mod_pow(base: int, exp: int, m: int) -> int:
    return pow(base, exp, m)

def mod_inverse(a: int, m: int) -> Optional[int]:
    g, x, _ = _ext_gcd(a % m, m)
    return (x % m + m) % m if g == 1 else None

def _ext_gcd(a: int, b: int) -> tuple[int, int, int]:
    if b == 0: return a, 1, 0
    g, x1, y1 = _ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def is_prime(n: int) -> bool:
    if n < 2: return False
    if n in (2, 3, 5, 7): return True
    if n % 2 == 0 or n % 3 == 0: return False
    d, r = n - 1, 0
    while d % 2 == 0: d //= 2; r += 1
    for a in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]:
        if a >= n: continue
        x = pow(a, d, n)
        if x in (1, n - 1): continue
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1: break
        else: return False
    return True

def next_prime(n: int) -> int:
    if n <= 2: return 2
    candidate = n + 1 if n % 2 == 0 else n
    while not is_prime(candidate): candidate += 2
    return candidate
