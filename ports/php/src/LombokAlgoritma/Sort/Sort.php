<?php
declare(strict_types=1);
namespace LombokAlgoritma\Sort;
final class Sort {
    public static function timsort(array $a, ?callable $c=null): array { $r=$a; $c?usort($r,$c):sort($r); return $r; }
    public static function quicksort(array $a): array { $a=array_values($a); $n=count($a); if($n<=1)return $a; self::qs($a,0,$n-1); return $a; }
    private static function qs(array &$a, int $lo, int $hi): void { if($lo>=$hi)return; if($hi-$lo<16){self::is($a,$lo,$hi);return;} $p=self::part($a,$lo,$hi); self::qs($a,$lo,$p-1); self::qs($a,$p+1,$hi); }
    private static function part(array &$a, int $lo, int $hi): int { $mid=intdiv($lo+$hi,2); if($a[$lo]>$a[$mid])[$a[$lo],$a[$mid]]=[$a[$mid],$a[$lo]]; if($a[$lo]>$a[$hi])[$a[$lo],$a[$hi]]=[$a[$hi],$a[$lo]]; if($a[$mid]>$a[$hi])[$a[$mid],$a[$hi]]=[$a[$hi],$a[$mid]]; [$a[$mid],$a[$hi]]=[$a[$hi],$a[$mid]]; $pv=$a[$hi]; $i=$lo; for($j=$lo;$j<$hi;$j++){if($a[$j]<=$pv){[$a[$i],$a[$j]]=[$a[$j],$a[$i]];$i++;}} [$a[$i],$a[$hi]]=[$a[$hi],$a[$i]]; return $i; }
    private static function is(array &$a, int $lo, int $hi): void { for($i=$lo+1;$i<=$hi;$i++){$k=$a[$i];$j=$i-1;while($j>=$lo&&$a[$j]>$k){$a[$j+1]=$a[$j];$j--;}$a[$j+1]=$k;} }
    public static function mergesort(array $a): array { $a=array_values($a); $n=count($a); if($n<=1)return $a; $t=$a; for($w=1;$w<$n;$w*=2){for($lo=0;$lo<$n;$lo+=2*$w){$mid=min($lo+$w,$n);$hi=min($lo+2*$w,$n);$i=$lo;$j=$mid;$k=$lo;while($i<$mid&&$j<$hi){if($a[$i]<=$a[$j])$t[$k++]=$a[$i++];else $t[$k++]=$a[$j++];}while($i<$mid)$t[$k++]=$a[$i++];while($j<$hi)$t[$k++]=$a[$j++];}}$a=$t;$w*=2;} return $a; }
    public static function heapsort(array $a): array { $a=array_values($a); $n=count($a); for($i=intdiv($n,2)-1;$i>=0;$i--)self::sift($a,$i,$n); for($e=$n-1;$e>0;$e--){[$a[0],$a[$e]]=[$a[$e],$a[0]];self::sift($a,0,$e);} return $a; }
    private static function sift(array &$a, int $r, int $e): void { while(true){$lg=$r;$l=2*$r+1;$ri=2*$r+2; if($l<$e&&$a[$l]>$a[$lg])$lg=$l; if($ri<$e&&$a[$ri]>$a[$lg])$lg=$ri; if($lg===$r)break; [$a[$r],$a[$lg]]=[$a[$lg],$a[$r]]; $r=$lg;} }
    public static function countingSort(array $a, ?int $m=null): array { if(empty($a))return []; $k=$m??max($a); $cnt=array_fill(0,$k+1,0); foreach($a as $v)$cnt[$v]++; $out=[]; for($i=0;$i<=$k;$i++)for($j=0;$j<$cnt[$i];$j++)$out[]=$i; return $out; }
}
