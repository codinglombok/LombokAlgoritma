# LombokAlgoritma — shared typing helpers
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
from __future__ import annotations

from typing import Any, Protocol, TypeVar


class Comparable(Protocol):
    """Anything ordered by ``<`` (all algorithms here only use ``<`` and ``==``)."""

    def __lt__(self, other: Any, /) -> bool: ...


CT = TypeVar("CT", bound=Comparable)
