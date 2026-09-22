<?php
declare(strict_types=1);
namespace LombokAlgoritma\Math;
final class SHA256 {
    public static function hash(string $d): string { return hash('sha256',$d,true); }
    public static function hex(string $d): string { return hash('sha256',$d); }
    public static function hmac(string $key, string $d): string { return hash_hmac('sha256',$d,$key,true); }
}
