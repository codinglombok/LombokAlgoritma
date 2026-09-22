package LombokAlgoritma::String;
# LombokAlgoritma — Perl String Module
# Apache-2.0 — @codinglombok
use strict; use warnings; use Exporter 'import';
our @EXPORT_OK = qw(kmp_search levenshtein fnv1a32);
our $VERSION = '0.1.0';

sub kmp_search {
    my($text,$pat)=@_; return [] unless $pat;
    my $m=length($pat); my @f=(0)x$m; my $k=0;
    for my $i(1..$m-1){while($k>0&&substr($pat,$k,1)ne substr($pat,$i,1)){$k=$f[$k-1];}$k++ if substr($pat,$k,1)eq substr($pat,$i,1);$f[$i]=$k;}
    my @res; $k=0;
    for my $i(0..length($text)-1){while($k>0&&substr($pat,$k,1)ne substr($text,$i,1)){$k=$f[$k-1];}$k++ if substr($pat,$k,1)eq substr($text,$i,1);if($k==$m){push@res,$i-$m+1;$k=$f[$k-1];}}
    \@res
}

sub levenshtein {
    my($a,$b)=@_; return 0 if $a eq $b;
    ($a,$b)=($b,$a) if length($a)>length($b);
    my @prev=0..length($a); my @curr;
    for my $j(1..length($b)){
        @curr=($j); for my $i(1..length($a)){my$c=substr($a,$i-1,1)eq substr($b,$j-1,1)?0:1;$curr[$i]=_min($curr[$i-1]+1,$prev[$i]+1,$prev[$i-1]+$c);}
        @prev=@curr;
    }
    $prev[length($a)]
}
sub _min{my$m=shift;$m=$_<$m?$_:$m for@_;$m}

sub fnv1a32 {
    my($s)=@_; my $h=0x811c9dc5;
    for my $b(unpack'C*',$s){$h=($h^$b)*0x01000193&0xFFFFFFFF;}
    $h
}
1;
