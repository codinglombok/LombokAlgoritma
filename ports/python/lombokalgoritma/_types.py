# LombokAlgoritma — shared typing helpers
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from typing import Any, Protocol, TypeVar


class Comparable(Protocol):
    """Anything ordered by comparison operators used by the algorithms."""

    def __lt__(self, other: Any, /) -> bool: ...

    def __le__(self, other: Any, /) -> bool: ...

    def __ge__(self, other: Any, /) -> bool: ...

    def __eq__(self, other: Any, /) -> bool: ...


CT = TypeVar("CT", bound=Comparable)
