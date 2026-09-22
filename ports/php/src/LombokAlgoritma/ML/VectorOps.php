<?php
declare(strict_types=1);
namespace LombokAlgoritma\ML;
final class VectorOps {
    public static function dot(array $a, array $b): float { return array_sum(array_map(fn($x,$y)=>$x*$y,$a,$b)); }
    public static function norm(array $v): float { return sqrt(array_sum(array_map(fn($x)=>$x*$x,$v))); }
    public static function cosine(array $a, array $b): float { $na=self::norm($a);$nb=self::norm($b); return($na&&$nb)?self::dot($a,$b)/($na*$nb):0.0; }
    public static function l2(array $a, array $b): float { return sqrt(array_sum(array_map(fn($x,$y)=>($x-$y)**2,$a,$b))); }
    public static function normalize(array $v): array { $n=self::norm($v); return $n?array_map(fn($x)=>$x/$n,$v):array_fill(0,count($v),0.0); }
}
