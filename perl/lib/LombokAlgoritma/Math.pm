package LombokAlgoritma::Math;
# LombokAlgoritma — Perl Math Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use strict; use warnings; use Exporter 'import';
use Math::BigInt;
our @EXPORT_OK = qw(gcd lcm mod_pow is_prime);
our $VERSION = '0.2.0';

# SHA-256 was removed in 0.2.0 (ADR-016): use LombokEncryptDecrypt.

sub gcd { my ($x, $y) = @_; ($x, $y) = ($y, $x % $y) while $y; abs($x) }
sub lcm { my ($x, $y) = @_; ($x && $y) ? abs(int($x / gcd($x, $y)) * $y) : 0 }

# base^exp mod m by square-and-multiply (Math::BigInt::bmodpow). v0.1.0 computed the
# full power first, which is infeasible for large exponents.
sub mod_pow {
    my ($b, $e, $m) = @_;
    my $r = Math::BigInt->new($b)->bmodpow($e, $m);
    return $r->numify if $r->bcmp(Math::BigInt->new('9007199254740991')) <= 0;
    return $r;
}

# Deterministic Miller–Rabin for n < 3.3e24 (first 12 prime bases).
sub is_prime {
    my ($n) = @_;
    $n = Math::BigInt->new($n)->babs;
    return 0 if $n < 2;
    for my $p (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37) {
        return $n == $p ? 1 : 0 if $n % $p == 0;
    }
    my $nm1 = $n - 1;
    my ($d, $r) = ($nm1->copy, 0);
    while ($d->is_even) { $d->brsft(1); $r++ }
    BASE: for my $a (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37) {
        my $x = Math::BigInt->new($a)->bmodpow($d, $n);
        next BASE if $x == 1 || $x == $nm1;
        for (1 .. $r - 1) {
            $x = $x->bmul($x)->bmod($n);
            next BASE if $x == $nm1;
        }
        return 0;
    }
    return 1;
}
1;
