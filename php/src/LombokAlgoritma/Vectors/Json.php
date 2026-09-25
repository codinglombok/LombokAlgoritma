<?php

// LombokAlgoritma — JSON reader and canonical JSON writer (SPEC §3)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Vectors;

use LombokAlgoritma\Core\BigInt;

/**
 * A small JSON parser that keeps what `json_decode` loses (the token `-0` becomes float −0.0;
 * integers beyond PHP_INT_MAX become floats), plus the canonical serialiser of SPEC §3:
 * ECMAScript Number::toString with −0 kept, NaN/±Infinity as strings, keys sorted, raw UTF-8.
 * Objects are read as associative arrays; `{}` and `[]` both read as an empty array.
 */
final class Json
{
    private const SAFE = 9007199254740991;

    private string $s;
    private int $pos = 0;
    private int $len;

    private function __construct(string $s)
    {
        $this->s = $s;
        $this->len = strlen($s);
    }

    /** @throws \JsonException on malformed input */
    public static function parse(string $text): mixed
    {
        $p = new self($text);
        $v = $p->value();
        $p->ws();
        if ($p->pos !== $p->len) {
            throw new \JsonException("trailing data at offset {$p->pos}");
        }
        return $v;
    }

    private function ws(): void
    {
        while ($this->pos < $this->len && str_contains(" \t\r\n", $this->s[$this->pos])) {
            $this->pos++;
        }
    }

    private function value(): mixed
    {
        $this->ws();
        if ($this->pos >= $this->len) {
            throw new \JsonException('unexpected end of JSON');
        }
        $c = $this->s[$this->pos];
        if ($c === '{') {
            return $this->object();
        }
        if ($c === '[') {
            return $this->list();
        }
        if ($c === '"') {
            return $this->string();
        }
        foreach (['true' => true, 'false' => false, 'null' => null] as $word => $v) {
            if (substr_compare($this->s, $word, $this->pos, strlen($word)) === 0) {
                $this->pos += strlen($word);
                return $v;
            }
        }
        return $this->number();
    }

    /** @return array<string, mixed> */
    private function object(): array
    {
        $this->pos++;
        $out = [];
        $this->ws();
        if ($this->peek() === '}') {
            $this->pos++;
            return $out;
        }
        while (true) {
            $this->ws();
            $key = $this->string();
            $this->ws();
            $this->expect(':');
            $out[$key] = $this->value();
            $this->ws();
            if ($this->peek() === ',') {
                $this->pos++;
                continue;
            }
            $this->expect('}');
            return $out;
        }
    }

    /** @return list<mixed> */
    private function list(): array
    {
        $this->pos++;
        $out = [];
        $this->ws();
        if ($this->peek() === ']') {
            $this->pos++;
            return $out;
        }
        while (true) {
            $out[] = $this->value();
            $this->ws();
            if ($this->peek() === ',') {
                $this->pos++;
                continue;
            }
            $this->expect(']');
            return $out;
        }
    }

    private function string(): string
    {
        $start = $this->pos;
        $this->expect('"');
        while ($this->pos < $this->len && $this->s[$this->pos] !== '"') {
            $this->pos += $this->s[$this->pos] === '\\' ? 2 : 1;
        }
        $this->expect('"');
        $v = json_decode(substr($this->s, $start, $this->pos - $start), false, 1, JSON_THROW_ON_ERROR);
        if (!is_string($v)) {
            throw new \JsonException("bad string at offset {$start}");
        }
        return $v;
    }

    private function number(): int|float
    {
        if (preg_match('/\G-?(?:0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/', $this->s, $m, 0, $this->pos) !== 1) {
            throw new \JsonException("unexpected character at offset {$this->pos}");
        }
        $tok = $m[0];
        $this->pos += strlen($tok);
        if (($m[1] ?? '') !== '' || ($m[2] ?? '') !== '') {
            return (float) $tok;
        }
        if ($tok === '-0') {
            return -0.0;
        }
        $i = filter_var($tok, FILTER_VALIDATE_INT);
        return $i === false ? (float) $tok : $i;
    }

    private function peek(): string
    {
        return $this->pos < $this->len ? $this->s[$this->pos] : '';
    }

    private function expect(string $c): void
    {
        if ($this->peek() !== $c) {
            throw new \JsonException("expected '{$c}' at offset {$this->pos}");
        }
        $this->pos++;
    }

    /** Canonical JSON of a value (SPEC §3). */
    public static function canonical(mixed $v): string
    {
        if ($v === null) {
            return 'null';
        }
        if (is_bool($v)) {
            return $v ? 'true' : 'false';
        }
        if (is_int($v)) {
            return $v >= -self::SAFE && $v <= self::SAFE ? (string) $v : self::formatNumber((float) $v);
        }
        if (is_float($v)) {
            return self::formatNumber($v);
        }
        if (is_string($v)) {
            return self::quote($v);
        }
        if ($v instanceof \GMP) {
            return self::canonical(BigInt::out($v)); // SPEC §3.1: |v| > 2^53 − 1 → decimal string
        }
        if (is_array($v)) {
            if (array_is_list($v)) {
                return '[' . implode(',', array_map(self::canonical(...), $v)) . ']';
            }
            $parts = [];
            foreach ($v as $k => $x) {
                $parts[(string) $k] = self::quote((string) $k) . ':' . self::canonical($x);
            }
            ksort($parts, SORT_STRING);
            return '{' . implode(',', $parts) . '}';
        }
        throw new \InvalidArgumentException('canonical: unsupported value of type ' . get_debug_type($v));
    }

    /** JSON string literal: short escapes, other C0 controls as \u00xx, everything else raw UTF-8. */
    public static function quote(string $s): string
    {
        return json_encode(
            $s,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_LINE_TERMINATORS | JSON_THROW_ON_ERROR,
        );
    }

    /** ECMAScript Number::toString(x), except −0 → "-0"; NaN / ±Infinity as JSON strings (SPEC §3.2). */
    public static function formatNumber(float $x): string
    {
        if (is_nan($x)) {
            return '"NaN"';
        }
        if (is_infinite($x)) {
            return $x > 0 ? '"Infinity"' : '"-Infinity"';
        }
        if ($x == 0) {
            return fdiv(1.0, $x) < 0 ? '-0' : '0';
        }
        if ($x < 0) {
            return '-' . self::formatNumber(-$x);
        }
        [$digits, $n] = self::shortest($x);
        $k = strlen($digits);
        if ($k <= $n && $n <= 21) {
            return $digits . str_repeat('0', $n - $k);
        }
        if (0 < $n && $n <= 21) {
            return substr($digits, 0, $n) . '.' . substr($digits, $n);
        }
        if (-6 < $n && $n <= 0) {
            return '0.' . str_repeat('0', -$n) . $digits;
        }
        $e = $n - 1;
        $mant = $k === 1 ? $digits : $digits[0] . '.' . substr($digits, 1);
        return $mant . 'e' . ($e < 0 ? '-' : '+') . abs($e);
    }

    /**
     * Shortest round-trip decimal digits d₁…d_k (no trailing zeros) and exponent n with
     * x = 0.d₁…d_k × 10ⁿ; among the shortest, the correctly rounded (closest) one.
     *
     * @return array{string, int}
     */
    private static function shortest(float $x): array
    {
        $s = '';
        for ($p = 0; $p <= 16; $p++) {
            $s = sprintf("%.{$p}e", $x);
            if ((float) $s === $x) {
                break;
            }
        }
        [$mant, $exp] = explode('e', $s);
        $digits = rtrim(str_replace('.', '', $mant), '0');
        return [$digits === '' ? '0' : $digits, (int) $exp + 1];
    }
}
