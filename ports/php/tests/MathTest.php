<?php
declare(strict_types=1);
use PHPUnit\Framework\TestCase;
use LombokAlgoritma\Math\{SHA256,Hkdf,NumberTheory};
class MathTest extends TestCase {
    public function testSha256Empty(): void { $this->assertSame('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',SHA256::hex('')); }
    public function testSha256Det(): void { $this->assertSame(SHA256::hex('test'),SHA256::hex('test')); }
    public function testGcd(): void { $this->assertSame(4,NumberTheory::gcd(12,8)); $this->assertSame(5,NumberTheory::gcd(0,5)); }
    public function testLcm(): void { $this->assertSame(12,NumberTheory::lcm(4,6)); }
    public function testModPow(): void { $this->assertSame('24',gmp_strval(NumberTheory::modPow(gmp_init(2),gmp_init(10),gmp_init(1000)))); }
    public function testIsPrime(): void { $this->assertTrue(NumberTheory::isPrime(gmp_init(97))); $this->assertFalse(NumberTheory::isPrime(gmp_init(100))); }
    public function testHkdf(): void { $this->assertSame(42,strlen(Hkdf::derive(str_repeat("\x00",22),42))); }
}
