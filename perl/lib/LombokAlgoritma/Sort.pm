package LombokAlgoritma::Sort;
# LombokAlgoritma — Perl Sort Module
# SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
use strict; use warnings; use Exporter 'import';
our @EXPORT_OK = qw(timsort quicksort mergesort heapsort);
our $VERSION = '0.2.0';

sub timsort  { [sort { $a <=> $b } @{$_[0]}] }
# Median-of-three quicksort (insertion sort below 16 items). Not stable.
# v0.1.0 only delegated to Perl's sort.
sub quicksort {
    my @a = @{ $_[0] };
    _qs(\@a, 0, $#a);
    return \@a;
}

sub _qs {
    my ($a, $lo, $hi) = @_;
    while ($lo < $hi) {
        if ($hi - $lo < 16) { _ins($a, $lo, $hi); return }
        my $p = _part($a, $lo, $hi);
        if ($p - $lo < $hi - $p) { _qs($a, $lo, $p - 1); $lo = $p + 1 }
        else                     { _qs($a, $p + 1, $hi); $hi = $p - 1 }
    }
}

sub _ins {
    my ($a, $lo, $hi) = @_;
    for my $i ($lo + 1 .. $hi) {
        my $k = $a->[$i]; my $j = $i - 1;
        while ($j >= $lo && $a->[$j] > $k) { $a->[$j + 1] = $a->[$j]; $j-- }
        $a->[$j + 1] = $k;
    }
}

sub _part {
    my ($a, $lo, $hi) = @_;
    my $mid = int(($lo + $hi) / 2);
    @{$a}[$lo, $mid] = @{$a}[$mid, $lo] if $a->[$mid] < $a->[$lo];
    @{$a}[$lo, $hi]  = @{$a}[$hi, $lo]  if $a->[$hi]  < $a->[$lo];
    @{$a}[$mid, $hi] = @{$a}[$hi, $mid] if $a->[$hi]  < $a->[$mid];
    @{$a}[$mid, $hi] = @{$a}[$hi, $mid];
    my $pv = $a->[$hi]; my $i = $lo;
    for my $j ($lo .. $hi - 1) {
        if ($a->[$j] <= $pv) { @{$a}[$i, $j] = @{$a}[$j, $i]; $i++ }
    }
    @{$a}[$i, $hi] = @{$a}[$hi, $i];
    return $i;
}

sub mergesort {
    my ($arr) = @_; my @a = @$arr; my $n = @a; return \@a if $n <= 1;
    my @tmp = @a;
    for (my $w=1; $w<$n; $w*=2) {
        for (my $lo=0; $lo<$n; $lo+=2*$w) {
            my $mid = $lo+$w < $n ? $lo+$w : $n;
            my $hi  = $lo+2*$w < $n ? $lo+2*$w : $n;
            my ($i,$j,$k) = ($lo,$mid,$lo);
            while ($i<$mid && $j<$hi) { $tmp[$k++]=$a[$i]<=$a[$j]?$a[$i++]:$a[$j++]; }
            while ($i<$mid){$tmp[$k++]=$a[$i++];}while($j<$hi){$tmp[$k++]=$a[$j++];}
        }
        @a=@tmp;
    }
    \@a
}

sub heapsort {
    my ($arr) = @_; my @a = @$arr; my $n = @a;
    for (my $i=int($n/2)-1;$i>=0;$i--) { _sift(\@a,$i,$n); }
    for (my $e=$n-1;$e>0;$e--) { @a[0,$e]=@a[$e,0]; _sift(\@a,0,$e); }
    \@a
}

sub _sift {
    my ($a,$r,$e)=@_;
    while(1) {
        my $lg=$r; my $l=2*$r+1; my $ri=2*$r+2;
        $lg=$l if $l<$e&&$a->[$l]>$a->[$lg];
        $lg=$ri if $ri<$e&&$a->[$ri]>$a->[$lg];
        last if $lg==$r;
        @{$a}[$r,$lg]=@{$a}[$lg,$r]; $r=$lg;
    }
}
1;
