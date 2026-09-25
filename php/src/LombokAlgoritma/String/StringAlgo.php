<?php

// LombokAlgoritma — string algorithms over Unicode code points (SPEC §11)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok

declare(strict_types=1);

namespace LombokAlgoritma\String;

/**
 * String search, edit distances and similarity. Input strings are UTF-8; every length, index and
 * offset is in Unicode code points (SPEC §0.3), never bytes.
 */
final class StringAlgo
{
    /**
     * Code points of a UTF-8 string.
     *
     * @return list<string>
     */
    public static function codePoints(string $s): array
    {
        return mb_str_split($s, 1, 'UTF-8');
    }

    /**
     * All (possibly overlapping) start offsets of `$pattern` in `$text` (Knuth–Morris–Pratt);
     * `[]` for an empty pattern.
     *
     * @return list<int>
     */
    public static function kmpSearch(string $text, string $pattern): array
    {
        $p = self::codePoints($pattern);
        $m = count($p);
        if ($m === 0) {
            return [];
        }
        $t = self::codePoints($text);
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
        foreach ($t as $i => $ch) {
            while ($k > 0 && $p[$k] !== $ch) {
                $k = $f[$k - 1];
            }
            if ($p[$k] === $ch) {
                $k++;
            }
            if ($k === $m) {
                $res[] = $i - $m + 1;
                $k = $f[$k - 1];
            }
        }
        return $res;
    }

    /** Levenshtein distance (insert / delete / substitute cost 1), O(min(m, n)) space. */
    public static function levenshtein(string $sa, string $sb): int
    {
        if ($sa === $sb) {
            return 0;
        }
        $a = self::codePoints($sa);
        $b = self::codePoints($sb);
        if (count($a) > count($b)) {
            [$a, $b] = [$b, $a];
        }
        $la = count($a);
        $prev = range(0, $la);
        foreach ($b as $j => $chB) {
            $cur = [$j + 1];
            for ($i = 1; $i <= $la; $i++) {
                $cost = $a[$i - 1] === $chB ? 0 : 1;
                $cur[$i] = min($cur[$i - 1] + 1, $prev[$i] + 1, $prev[$i - 1] + $cost);
            }
            $prev = $cur;
        }
        return $prev[$la];
    }

    /** Unrestricted Damerau–Levenshtein distance (Lowrance–Wagner). */
    public static function damerauLevenshtein(string $sa, string $sb): int
    {
        $a = self::codePoints($sa);
        $b = self::codePoints($sb);
        $m = count($a);
        $n = count($b);
        if ($m === 0) {
            return $n;
        }
        if ($n === 0) {
            return $m;
        }
        $max = $m + $n;
        $d = array_fill(0, $m + 2, array_fill(0, $n + 2, 0));
        $d[0][0] = $max;
        for ($i = 0; $i <= $m; $i++) {
            $d[$i + 1][0] = $max;
            $d[$i + 1][1] = $i;
        }
        for ($j = 0; $j <= $n; $j++) {
            $d[0][$j + 1] = $max;
            $d[1][$j + 1] = $j;
        }
        /** @var array<string, int> $da */
        $da = [];
        for ($i = 1; $i <= $m; $i++) {
            $db = 0;
            for ($j = 1; $j <= $n; $j++) {
                $i1 = $da['c' . $b[$j - 1]] ?? 0;
                $j1 = $db;
                $cost = $a[$i - 1] === $b[$j - 1] ? 0 : 1;
                if ($cost === 0) {
                    $db = $j;
                }
                $d[$i + 1][$j + 1] = min(
                    $d[$i][$j] + $cost,
                    $d[$i + 1][$j] + 1,
                    $d[$i][$j + 1] + 1,
                    $d[$i1][$j1] + ($i - $i1 - 1) + 1 + ($j - $j1 - 1),
                );
            }
            $da['c' . $a[$i - 1]] = $i;
        }
        return $d[$m + 1][$n + 1];
    }

    /** Jaro similarity in [0, 1]: ((m/|a| + m/|b|) + (m − t/2)/m) / 3. */
    public static function jaro(string $sa, string $sb): float
    {
        if ($sa === $sb) {
            return 1.0;
        }
        $a = self::codePoints($sa);
        $b = self::codePoints($sb);
        $la = count($a);
        $lb = count($b);
        $md = intdiv(max($la, $lb), 2) - 1;
        if ($md < 0) {
            return 0.0;
        }
        $aM = array_fill(0, $la, false);
        $bM = array_fill(0, $lb, false);
        $matches = 0;
        for ($i = 0; $i < $la; $i++) {
            $hi = min($i + $md + 1, $lb);
            for ($j = max(0, $i - $md); $j < $hi; $j++) {
                if ($bM[$j] || $a[$i] !== $b[$j]) {
                    continue;
                }
                $aM[$i] = true;
                $bM[$j] = true;
                $matches++;
                break;
            }
        }
        if ($matches === 0) {
            return 0.0;
        }
        $t = 0;
        $k = 0;
        for ($i = 0; $i < $la; $i++) {
            if (!$aM[$i]) {
                continue;
            }
            while (!$bM[$k]) {
                $k++;
            }
            if ($a[$i] !== $b[$k]) {
                $t++;
            }
            $k++;
        }
        $m = (float) $matches;
        return (($m / $la + $m / $lb) + ($m - $t / 2) / $m) / 3;
    }

    /** Jaro–Winkler: j + ((ℓ·p)·(1 − j)) with ℓ = common prefix length ≤ 4. */
    public static function jaroWinkler(string $sa, string $sb, float $p = 0.1): float
    {
        $j = self::jaro($sa, $sb);
        $a = self::codePoints($sa);
        $b = self::codePoints($sb);
        $lim = min(4, count($a), count($b));
        $prefix = 0;
        for ($i = 0; $i < $lim; $i++) {
            if ($a[$i] !== $b[$i]) {
                break;
            }
            $prefix++;
        }
        return $j + (($prefix * $p) * (1 - $j));
    }

    /**
     * Polynomial rolling hash by Horner's rule over (code point − 96), reduced into [0, mod)
     * after every step: h = ((h·base + (cp − 96)) mod m + m) mod m.
     */
    public static function polynomialHash(string $s, int $base = 31, int $mod = 1_000_000_007): int
    {
        $h = 0;
        foreach (self::codePoints($s) as $ch) {
            $h = ((($h * $base + (mb_ord($ch, 'UTF-8') - 96)) % $mod) + $mod) % $mod;
        }
        return $h;
    }
}
