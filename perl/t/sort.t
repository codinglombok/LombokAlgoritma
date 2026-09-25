#!/usr/bin/env perl
use strict; use warnings; use Test::More;
use LombokAlgoritma::Sort qw(timsort quicksort mergesort heapsort);

is_deeply timsort([]),      [],           'empty';
is_deeply timsort([42]),    [42],         'single';
is_deeply timsort([5,4,3,2,1]), [1,2,3,4,5], 'reverse';
is_deeply timsort([3,1,2,1,3]), [1,1,2,3,3], 'duplicates';
is_deeply timsort([-3,-1,0,2,-2]), [-3,-2,-1,0,2], 'negatives';
is_deeply mergesort([5,4,3,2,1]), [1,2,3,4,5], 'mergesort';
is_deeply heapsort([5,4,3,2,1]),  [1,2,3,4,5], 'heapsort';
srand(1);
for my $n (0, 1, 15, 16, 17, 100, 1000) {
    my @d = map { int(rand(100)) - 50 } 1 .. $n;
    my @w = sort { $a <=> $b } @d;
    is_deeply quicksort(\@d), \@w, "quicksort n=$n";
    is_deeply mergesort(\@d), \@w, "mergesort n=$n";
    is_deeply heapsort(\@d),  \@w, "heapsort n=$n";
}
done_testing;
