# LombokAlgoritma — shared typing helpers
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from typing import Any, Protocol, TypeVar


class Comparable(Protocol):
    """Anything ordered by comparison operators used by the algorithms."""

    def __lt__(self, other: Any, /) -> bool:
        pass

    def __le__(self, other: Any, /) -> bool:
        pass

    def __ge__(self, other: Any, /) -> bool:
        pass

    def __eq__(self, other: Any, /) -> bool:
        pass


CT = TypeVar("CT", bound=Comparable)
