<?php

// LombokAlgoritma — typed accessors for untyped vector inputs
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\Vectors;

use LombokAlgoritma\Geometry\Point;
use LombokAlgoritma\Graph\Graph;

/**
 * Narrowing helpers for decoded vector JSON. A shape mismatch is a bug in the vector file or the
 * runner, so it throws \UnexpectedValueException (never an AlgoException).
 */
final class Input
{
    /** @return array<array-key, mixed> */
    public static function obj(mixed $v): array
    {
        if (!is_array($v)) {
            throw new \UnexpectedValueException('expected an object, got ' . get_debug_type($v));
        }
        return $v;
    }

    /** @param array<array-key, mixed> $o */
    public static function get(array $o, string $key): mixed
    {
        if (!array_key_exists($key, $o)) {
            throw new \UnexpectedValueException("missing input field {$key}");
        }
        return $o[$key];
    }

    public static function int(mixed $v): int
    {
        if (is_float($v) && floor($v) === $v && abs($v) <= 9007199254740991) {
            return (int) $v;
        }
        if (!is_int($v)) {
            throw new \UnexpectedValueException('expected an integer, got ' . get_debug_type($v));
        }
        return $v;
    }

    public static function num(mixed $v): int|float
    {
        if (!is_int($v) && !is_float($v)) {
            throw new \UnexpectedValueException('expected a number, got ' . get_debug_type($v));
        }
        return $v;
    }

    public static function str(mixed $v): string
    {
        if (!is_string($v)) {
            throw new \UnexpectedValueException('expected a string, got ' . get_debug_type($v));
        }
        return $v;
    }

    public static function bool(mixed $v): bool
    {
        if (!is_bool($v)) {
            throw new \UnexpectedValueException('expected a boolean, got ' . get_debug_type($v));
        }
        return $v;
    }

    /** Integer as a JSON number or a decimal string (SPEC §3.1). */
    public static function big(mixed $v): int|string
    {
        if (is_string($v) && preg_match('/^-?\d+$/', $v) === 1) {
            return $v;
        }
        return self::int($v);
    }

    /** Lowercase hex → bytes. */
    public static function bytes(mixed $v): string
    {
        $h = self::str($v);
        if (strlen($h) % 2 !== 0 || preg_match('/[^0-9a-f]/', $h) === 1) {
            throw new \UnexpectedValueException("bad hex: {$h}");
        }
        return (string) hex2bin($h);
    }

    /** @return list<mixed> */
    public static function list(mixed $v): array
    {
        if (!is_array($v) || !array_is_list($v)) {
            throw new \UnexpectedValueException('expected an array, got ' . get_debug_type($v));
        }
        return $v;
    }

    /** @return list<int|float> */
    public static function nums(mixed $v): array
    {
        return array_map(self::num(...), self::list($v));
    }

    /** @return list<int> */
    public static function ints(mixed $v): array
    {
        return array_map(self::int(...), self::list($v));
    }

    /** @return list<int|string> */
    public static function bigs(mixed $v): array
    {
        return array_map(self::big(...), self::list($v));
    }

    /** @return list<string> */
    public static function strs(mixed $v): array
    {
        return array_map(self::str(...), self::list($v));
    }

    /** @return list<list<int|float>> */
    public static function matrix(mixed $v): array
    {
        return array_map(self::nums(...), self::list($v));
    }

    public static function point(mixed $v): Point
    {
        $xy = self::nums($v);
        if (count($xy) !== 2) {
            throw new \UnexpectedValueException('expected a point [x, y]');
        }
        return new Point($xy[0], $xy[1]);
    }

    /** @return list<Point> */
    public static function points(mixed $v): array
    {
        return array_map(self::point(...), self::list($v));
    }

    /** `{nodes, edges: [[from, to, weight], …]}`; may throw AlgoException from Graph validation. */
    public static function graph(mixed $v): Graph
    {
        $o = self::obj($v);
        $edges = [];
        foreach (self::list(self::get($o, 'edges')) as $e) {
            $t = self::list($e);
            if (count($t) !== 3) {
                throw new \UnexpectedValueException('expected an edge [from, to, weight]');
            }
            $edges[] = [self::int($t[0]), self::int($t[1]), self::num($t[2])];
        }
        return new Graph(self::int(self::get($o, 'nodes')), $edges);
    }
}
