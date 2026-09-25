<?php

// SPDX-License-Identifier: Apache-2.0 OR MIT

declare(strict_types=1);

namespace LombokAlgoritma\Tests;

use LombokAlgoritma\Math\Hkdf;
use LombokAlgoritma\Math\NumberTheory;
use LombokAlgoritma\Math\SHA256;
use PHPUnit\Framework\Attributes\RequiresPhpExtension;
use PHPUnit\Framework\TestCase;

final class MathTest extends TestCase
{
    public function testSha256Fips180_4(): void
    {
        $this->assertSame('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', SHA256::hex(''));
        $this->assertSame('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', SHA256::hex('abc'));
        $this->assertSame(
            '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
            SHA256::hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
        );
        $this->assertSame(
            'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0',
            SHA256::hex(str_repeat('a', 1_000_000)),
        );
        $this->assertSame(32, strlen(SHA256::hash('x')));
        $this->assertSame(
            '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
            bin2hex(SHA256::hmac('Jefe', 'what do ya want for nothing?')),
        );
    }

    public function testHkdfRfc5869Case1(): void
    {
        $okm = Hkdf::derive(
            (string) hex2bin(str_repeat('0b', 22)),
            42,
            (string) hex2bin('000102030405060708090a0b0c'),
            (string) hex2bin('f0f1f2f3f4f5f6f7f8f9'),
        );
        $this->assertSame(
            '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865',
            bin2hex($okm),
        );
        $this->assertSame(42, strlen(Hkdf::derive(str_repeat("\x00", 22), 42)));
    }

    public function testHkdfRejectsOversizedLength(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Hkdf::derive('x', 255 * 32 + 1);
    }

    public function testGcdLcm(): void
    {
        $this->assertSame(4, NumberTheory::gcd(12, 8));
        $this->assertSame(5, NumberTheory::gcd(0, 5));
        $this->assertSame(12, NumberTheory::lcm(4, 6));
        $this->assertSame(12, NumberTheory::lcm(-4, 6));
        $this->assertSame(0, NumberTheory::lcm(0, 6));
    }

    #[RequiresPhpExtension('gmp')]
    public function testGmpBackedFunctions(): void
    {
        $this->assertSame('24', gmp_strval(NumberTheory::modPow(gmp_init(2), gmp_init(10), gmp_init(1000))));
        $this->assertTrue(NumberTheory::isPrime(gmp_init(97)));
        $this->assertFalse(NumberTheory::isPrime(gmp_init(100)));
        $inv = NumberTheory::modInverse(gmp_init(3), gmp_init(11));
        $this->assertNotNull($inv);
        $this->assertSame('4', gmp_strval($inv));
        $this->assertNull(NumberTheory::modInverse(gmp_init(2), gmp_init(4)));
        $this->assertSame('23', gmp_strval(NumberTheory::crt([2, 3, 2], [3, 5, 7])));
        $this->assertSame('366', gmp_strval(NumberTheory::crt([1, 2, 3], [5, 7, 11])));
    }

    #[RequiresPhpExtension('gmp')]
    public function testCrtRejectsNonCoprime(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        NumberTheory::crt([1, 1], [4, 6]);
    }
}
