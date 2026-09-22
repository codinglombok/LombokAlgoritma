package LombokAlgoritma::Math;
# LombokAlgoritma — Perl Math Module
# Apache-2.0 — @codinglombok
use strict; use warnings; use Exporter 'import';
use Digest::SHA qw(sha256_hex);
our @EXPORT_OK = qw(sha256_hex gcd lcm mod_pow is_prime);
our $VERSION = '0.1.0';

sub gcd { my($a,$b)=@_; while($b){($a,$b)=($b,$a%$b)} abs($a) }
sub lcm { my($a,$b)=@_; ($a&&$b)?abs($a/gcd($a,$b)*$b):0 }
sub mod_pow { use bigint; my($b,$e,$m)=@_; $b**$e % $m }

sub is_prime {
    my ($n) = @_; $n=abs($n);
    return 0 if $n<2; return 1 if $n==2||$n==3;
    return 0 if $n%2==0||$n%3==0;
    my($d,$r)=($n-1,0); while($d%2==0){$d/=2;$r++;}
    for my $a (2,3,5,7,11,13,17,19,23,29,31,37) {
        next if $a>=$n;
        use bigint; my $x=$a**$d%$n;
        next if $x==1||$x==$n-1;
        my $comp=1;
        for (1..$r-1){$x=$x*$x%$n; if($x==$n-1){$comp=0;last;}}
        return 0 if $comp;
    }
    1
}
1;
