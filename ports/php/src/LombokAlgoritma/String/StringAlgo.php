<?php

// LombokAlgoritma — PHP String algorithms and non-cryptographic hashes
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\String;

/**
 * String search, edit distance and 32-bit non-cryptographic hashes.
 * Hashes operate on bytes and return unsigned 32-bit values as PHP int (64-bit builds).
 */
final class StringAlgo
{
    private const M32 = 0xFFFFFFFF;

    /**
     * All byte offsets of `$p` in `$t` (Knuth–Morris–Pratt).
     *
     * @return list<int>
     */
    public static function kmpSearch(string $t, string $p): array
    {
        if ($p === '') {
            return [];
        }
        $m = strlen($p);
        $f = array_fill(0, $m, 0);
        $k = 0;
        for ($i = 1; $i < $m; $i++) {
            while ($k > 0 && $p[$k] !== $p[$i]) {
                $k = $f[$k - 1];
            }
            if ($p[$k] === $p[$i]) {
                $k++;
            }
            $f[$i] = $k;
        }
        $res = [];
        $k = 0;
        $n = strlen($t);
        for ($i = 0; $i < $n; $i++) {
            while ($k > 0 && $p[$k] !== $t[$i]) {
                $k = $f[$k - 1];
            }
            if ($p[$k] === $t[$i]) {
                $k++;
            }
            if ($k === $m) {
                $res[] = $i - $m + 1;
                $k = $f[$k - 1];
            }
        }
        return $res;
    }

    /** Levenshtein distance over Unicode code points (UTF-8 input). */
    public static function levenshtein(string $a, string $b): int
    {
        if ($a === $b) {
            return 0;
        }
        $ca = mb_str_split($a, 1, 'UTF-8');
        $cb = mb_str_split($b, 1, 'UTF-8');
        if (count($ca) > count($cb)) {
            [$ca, $cb] = [$cb, $ca];
        }
        $la = count($ca);
        $prev = range(0, $la);
        foreach ($cb as $j => $chB) {
            $curr = [$j + 1];
            for ($i = 1; $i <= $la; $i++) {
                $cost = $ca[$i - 1] === $chB ? 0 : 1;
                $curr[$i] = min($curr[$i - 1] + 1, $prev[$i] + 1, $prev[$i - 1] + $cost);
            }
            $prev = $curr;
        }
        return $prev[$la];
    }

    /** FNV-1a 32-bit. */
    public static function fnv1a32(string $d): int
    {
        $h = 0x811c9dc5;
        $n = strlen($d);
        for ($i = 0; $i < $n; $i++) {
            $h ^= ord($d[$i]);
            $h = self::mul32($h, 0x01000193);
        }
        return $h;
    }

    /** MurmurHash3_x86_32. */
    public static function murmur3_32(string $d, int $seed = 0): int
    {
        $c1 = 0xcc9e2d51;
        $c2 = 0x1b873593;
        $h = $seed & self::M32;
        $n = strlen($d);
        $n4 = $n & ~3;
        for ($i = 0; $i < $n4; $i += 4) {
            $k = self::le32($d, $i);
            $k = self::mul32(self::rotl32(self::mul32($k, $c1), 15), $c2);
            $h ^= $k;
            $h = (self::mul32(self::rotl32($h, 13), 5) + 0xe6546b64) & self::M32;
        }
        $rem = $n - $n4;
        if ($rem > 0) {
            $k = 0;
            for ($i = 0; $i < $rem; $i++) {
                $k |= ord($d[$n4 + $i]) << (8 * $i);
            }
            $h ^= self::mul32(self::rotl32(self::mul32($k, $c1), 15), $c2);
        }
        return self::fmix32($h ^ $n);
    }

    /** MurmurHash3 32-bit finalizer. */
    public static function fmix32(int $h): int
    {
        $h &= self::M32;
        $h ^= $h >> 16;
        $h = self::mul32($h, 0x85ebca6b);
        $h ^= $h >> 13;
        $h = self::mul32($h, 0xc2b2ae35);
        return $h ^ ($h >> 16);
    }

    /** xxHash32 (XXH32) per the reference specification. */
    public static function xxhash32(string $d, int $seed = 0): int
    {
        $p1 = 0x9e3779b1;
        $p2 = 0x85ebca77;
        $p3 = 0xc2b2ae3d;
        $p4 = 0x27d4eb2f;
        $p5 = 0x165667b1;
        $s = $seed & self::M32;
        $n = strlen($d);
        $i = 0;
        if ($n >= 16) {
            $v = [($s + $p1 + $p2) & self::M32, ($s + $p2) & self::M32, $s, ($s - $p1) & self::M32];
            while ($i + 16 <= $n) {
                for ($lane = 0; $lane < 4; $lane++) {
                    $acc = ($v[$lane] + self::mul32(self::le32($d, $i + 4 * $lane), $p2)) & self::M32;
                    $v[$lane] = self::mul32(self::rotl32($acc, 13), $p1);
                }
                $i += 16;
            }
            $h = (self::rotl32($v[0], 1) + self::rotl32($v[1], 7) + self::rotl32($v[2], 12)
                + self::rotl32($v[3], 18)) & self::M32;
        } else {
            $h = ($s + $p5) & self::M32;
        }
        $h = ($h + $n) & self::M32;
        while ($i + 4 <= $n) {
            $h = ($h + self::mul32(self::le32($d, $i), $p3)) & self::M32;
            $h = self::mul32(self::rotl32($h, 17), $p4);
            $i += 4;
        }
        while ($i < $n) {
            $h = ($h + self::mul32(ord($d[$i]), $p5)) & self::M32;
            $h = self::mul32(self::rotl32($h, 11), $p1);
            $i++;
        }
        $h ^= $h >> 15;
        $h = self::mul32($h, $p2);
        $h ^= $h >> 13;
        $h = self::mul32($h, $p3);
        return $h ^ ($h >> 16);
    }

    /** 32×32→32-bit multiply without float overflow (split into 16-bit halves). */
    private static function mul32(int $a, int $b): int
    {
        $a &= self::M32;
        $b &= self::M32;
        $lo = ($a & 0xFFFF) * $b;
        $hi = (($a >> 16) * $b) & 0xFFFF;
        return ($lo + ($hi << 16)) & self::M32;
    }

    private static function rotl32(int $x, int $r): int
    {
        $x &= self::M32;
        return (($x << $r) | ($x >> (32 - $r))) & self::M32;
    }

    private static function le32(string $d, int $i): int
    {
        return ord($d[$i]) | (ord($d[$i + 1]) << 8) | (ord($d[$i + 2]) << 16) | (ord($d[$i + 3]) << 24);
    }
}
