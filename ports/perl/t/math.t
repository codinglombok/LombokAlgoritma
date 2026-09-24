#!/usr/bin/env perl
use strict; use warnings; use Test::More;
use LombokAlgoritma::Math qw(gcd lcm is_prime mod_pow sha256_hex);

is gcd(12,8), 4,  'gcd(12,8)=4';
is gcd(0,5),  5,  'gcd(0,5)=5';
is lcm(4,6),  12, 'lcm(4,6)=12';
ok  is_prime(2),   '2 is prime';
ok  is_prime(97),  '97 is prime';
ok !is_prime(100), '100 not prime';
ok  is_prime(2147483647), 'Mersenne prime';
ok  is_prime('2305843009213693951'), 'M61 (2^61-1) is prime';
ok !is_prime(3215031751), 'strong pseudoprime to bases 2,3,5,7 rejected';
is join(',', grep { is_prime($_) } 0..50), '2,3,5,7,11,13,17,19,23,29,31,37,41,43,47', 'primes < 50';
is mod_pow(2, 10, 1000), 24, 'mod_pow small';
is mod_pow(2, 64, '18446744073709551557'), 59, 'mod_pow 2^64 mod (2^64-59)';
is sha256_hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 abc';
done_testing;
