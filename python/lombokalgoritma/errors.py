# LombokAlgoritma — error types (SPEC §2)
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
"""Every error LombokAlgoritma raises is an :class:`AlgoError` carrying a canonical ``code``.

Branch on ``err.code`` (identical in every port), never on the message text. ``AlgoError``
also subclasses :class:`ValueError`, so ``except ValueError`` keeps working.
"""

from __future__ import annotations

from typing import Literal

ErrorCode = Literal[
    "INVALID_INPUT",
    "OUT_OF_RANGE",
    "EMPTY_INPUT",
    "NEGATIVE_WEIGHT",
    "NO_INVERSE",
    "NOT_COPRIME",
    "OVERFLOW",
    "OUT_OF_BOUNDS",
    "UNSUPPORTED",
]


class AlgoError(ValueError):
    """Base error with a canonical SPEC §2 ``code``."""

    code: ErrorCode

    def __init__(self, code: ErrorCode, message: str) -> None:
        super().__init__(message)
        self.code = code

    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.code!r}, {str(self)!r})"


class InvalidInputError(AlgoError):
    """Malformed input: length mismatch, corrupt stream, wrong key size (``INVALID_INPUT``)."""

    def __init__(self, message: str) -> None:
        super().__init__("INVALID_INPUT", message)


class OutOfRangeError(AlgoError):
    """A parameter or element outside its permitted range (``OUT_OF_RANGE``)."""

    def __init__(self, message: str) -> None:
        super().__init__("OUT_OF_RANGE", message)


class EmptyInputError(AlgoError):
    """Too few elements for the operation (``EMPTY_INPUT``)."""

    def __init__(self, context: str) -> None:
        super().__init__("EMPTY_INPUT", f"not enough input elements for {context}")


class NegativeWeightError(AlgoError):
    """Negative edge weight / capacity where ≥ 0 is required (``NEGATIVE_WEIGHT``)."""

    def __init__(self, context: str) -> None:
        super().__init__("NEGATIVE_WEIGHT", f"{context}: negative edge weight")


class NoInverseError(AlgoError):
    """No modular inverse exists (``NO_INVERSE``)."""

    def __init__(self, message: str) -> None:
        super().__init__("NO_INVERSE", message)


class NotCoprimeError(AlgoError):
    """CRT moduli are not pairwise coprime (``NOT_COPRIME``)."""

    def __init__(self, message: str) -> None:
        super().__init__("NOT_COPRIME", message)
