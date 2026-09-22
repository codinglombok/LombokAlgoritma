<?php
declare(strict_types=1);
namespace LombokAlgoritma\Math;
final class Hkdf {
    public static function derive(string $ikm, int $len, ?string $salt=null, string $info=''): string {
        $salt??=str_repeat("\x00",32);
        $prk=hash_hmac('sha256',$ikm,$salt,true);
        $okm='';$prev='';
        for($i=1;strlen($okm)<$len;$i++){$block=$prev.$info.chr($i);$prev=hash_hmac('sha256',$block,$prk,true);$okm.=$prev;}
        return substr($okm,0,$len);
    }
}
