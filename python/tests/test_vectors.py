# LombokAlgoritma — shared-vector conformance (SPEC §1, §4) for the Python port
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import io
import json
import math
from pathlib import Path

import pytest

from lombokalgoritma import _vectors as v

REPO = Path(__file__).resolve().parent.parent.parent
VECTOR_FILE = REPO / "vectors" / "lombokalgoritma-vectors-v1.json"
TS_OUT = REPO / "out" / "typescript.txt"


def test_all_vectors_pass() -> None:
    rep = v.run_vectors(VECTOR_FILE)
    assert rep.missing == []
    assert rep.failures == []
    assert rep.cases == len(rep.lines) == 1059
    assert rep.ok


@pytest.mark.skipif(not TS_OUT.exists(), reason="TypeScript runner output not generated")
def test_output_byte_identical_to_typescript() -> None:
    rep = v.run_vectors(VECTOR_FILE)
    got = "".join(line + "\n" for line in rep.lines).encode("utf-8")
    assert got == TS_OUT.read_bytes()


def test_cli(
    tmp_path: Path, capsys: pytest.CaptureFixture[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    buf = io.BytesIO()

    class Out:
        buffer = buf

        def flush(self) -> None:
            pass

    monkeypatch.setattr(v.sys, "stdout", Out())
    assert v.main([str(VECTOR_FILE)]) == 0
    assert buf.getvalue().count(b"\n") == 1059
    assert v.main([]) == 2
    bad = tmp_path / "bad.json"
    bad.write_text(
        json.dumps(
            {
                "format": "lombokalgoritma-vectors",
                "version": 1,
                "groups": {
                    "nope.unknown": [],
                    "math.gcd": [{"id": "1", "input": {"a": 4, "b": 6}, "expected": 3}],
                },
            }
        ),
        encoding="utf-8",
    )
    assert v.main([str(bad)]) == 1
    err = capsys.readouterr().err
    assert "unknown group: nope.unknown" in err and "FAIL math.gcd/1" in err
    other = tmp_path / "other.json"
    other.write_text('{"format":"x","version":1,"groups":{}}', encoding="utf-8")
    with pytest.raises(ValueError):
        v.run_vectors(other)


@pytest.mark.parametrize(
    ("x", "want"),
    [
        (0.1, "0.1"),
        (0.1 + 0.2, "0.30000000000000004"),
        (1e20, "100000000000000000000"),
        (1e21, "1e+21"),
        (1e-7, "1e-7"),
        (1.23e-18, "1.23e-18"),
        (5e-324, "5e-324"),
        (1.7976931348623157e308, "1.7976931348623157e+308"),
        (9007199254740992.0, "9007199254740992"),
        (-0.0, "-0"),
        (0.0, "0"),
        (2.0, "2"),
        (-1.5, "-1.5"),
        (1234.5678, "1234.5678"),
        (0.000001234, "0.000001234"),
        (1.5e-7, "1.5e-7"),
        (123e-20, "1.23e-18"),
        (1e16, "10000000000000000"),
        (math.nan, '"NaN"'),
        (math.inf, '"Infinity"'),
        (-math.inf, '"-Infinity"'),
    ],
)
def test_format_number(x: float, want: str) -> None:
    assert v.format_number(x) == want


def test_canonical() -> None:
    assert v.canonical(None) == "null"
    assert v.canonical([True, False, 1, 2**60, 'a"\\\n\x01é😀\ud800']) == (
        '[true,false,1,1152921504606847000,"a\\"\\\\\\n\\u0001é😀\\ud800"]'
    )
    assert v.canonical({"b": 1, "a": (2, 3)}) == '{"a":[2,3],"b":1}'
    assert v.canonical(b"\x00\xff") == '"00ff"'
    assert v.canonical("\b\f\r\t") == '"\\b\\f\\r\\t"'
    with pytest.raises(TypeError):
        v.canonical(object())
    assert v.int_out(2**53) == "9007199254740992"
    assert v.int_out(-5) == -5
    assert v.hex64(-1) == "ffffffffffffffff"
    assert v.loads("[-0, 0, -1]") == [-0.0, 0, -1]
    assert math.copysign(1.0, v.loads("-0")) < 0


def test_big_and_run_case() -> None:
    assert v.big("-12") == -12 and v.big(3) == 3 and v.big(-0.0) == 0
    for bad in (True, 1.5, "x", None):
        with pytest.raises(TypeError):
            v.big(bad)
    with pytest.raises(KeyError):
        v.run_case("nope.nope", {})
    assert v.run_case("math.mod_inverse", {"a": 6, "m": 9}) == {"error": "NO_INVERSE"}
