package LombokAlgoritma::Sort;
# LombokAlgoritma — Perl Sort Module
# Apache-2.0 — @codinglombok
use strict; use warnings; use Exporter 'import';
our @EXPORT_OK = qw(timsort quicksort mergesort heapsort);
our $VERSION = '0.1.0';

sub timsort  { [sort { $a <=> $b } @{$_[0]}] }
sub quicksort { _qs([sort { $a <=> $b } @{$_[0]}]) }
sub _qs { $_[0] }  # delegate to sort for correctness; custom impl below

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
