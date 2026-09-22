<?php
declare(strict_types=1);
namespace LombokAlgoritma\Math;
final class NumberTheory {
    public static function gcd(int $a, int $b): int { $a=abs($a);$b=abs($b); while($b){[$a,$b]=[$b,$a%$b];} return $a; }
    public static function lcm(int $a, int $b): int { if(!$a||!$b)return 0; return abs(intdiv($a,self::gcd($a,$b))*$b); }
    public static function modPow(\GMP $b, \GMP $e, \GMP $m): \GMP { return gmp_powm($b,$e,$m); }
    public static function modInverse(\GMP $a, \GMP $m): ?\GMP { $r=gmp_invert($a,$m); return $r!==false?$r:null; }
    public static function isPrime(\GMP $n): bool { return gmp_prob_prime($n,20)>0; }
}
