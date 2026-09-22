<?php
declare(strict_types=1);
namespace LombokAlgoritma\String;
final class StringAlgo {
    public static function kmpSearch(string $t, string $p): array {
        if($p==='')return [];
        $m=strlen($p);$f=array_fill(0,$m,0);$k=0;
        for($i=1;$i<$m;$i++){while($k>0&&$p[$k]!==$p[$i])$k=$f[$k-1];if($p[$k]===$p[$i])$k++;$f[$i]=$k;}
        $res=[];$k=0;
        for($i=0;$i<strlen($t);$i++){while($k>0&&$p[$k]!==$t[$i])$k=$f[$k-1];if($p[$k]===$t[$i])$k++;if($k===$m){$res[]=$i-$m+1;$k=$f[$k-1];}}
        return $res;
    }
    public static function levenshtein(string $a, string $b): int {
        if($a===$b)return 0;
        $la=mb_strlen($a);$lb=mb_strlen($b);
        if(!$la)return $lb;if(!$lb)return $la;
        if($la>$lb){[$a,$b,$la,$lb]=[$b,$a,$lb,$la];}
        $prev=range(0,$la);
        for($j=1;$j<=$lb;$j++){$curr=[$j];for($i=1;$i<=$la;$i++){$cost=mb_substr($a,$i-1,1)===mb_substr($b,$j-1,1)?0:1;$curr[$i]=min($curr[$i-1]+1,$prev[$i]+1,$prev[$i-1]+$cost);}$prev=$curr;}
        return $prev[$la];
    }
    public static function fnv1a32(string $d): int { $h=0x811c9dc5; for($i=0;$i<strlen($d);$i++){$h^=ord($d[$i]);$h=($h*0x01000193)&0xFFFFFFFF;} return $h; }
}
