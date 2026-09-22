#!/usr/bin/env perl
use strict; use warnings; use Test::More;
use LombokAlgoritma::Sort qw(timsort mergesort heapsort);

is_deeply timsort([]),      [],           'empty';
is_deeply timsort([42]),    [42],         'single';
is_deeply timsort([5,4,3,2,1]), [1,2,3,4,5], 'reverse';
is_deeply timsort([3,1,2,1,3]), [1,1,2,3,3], 'duplicates';
is_deeply timsort([-3,-1,0,2,-2]), [-3,-2,-1,0,2], 'negatives';
is_deeply mergesort([5,4,3,2,1]), [1,2,3,4,5], 'mergesort';
is_deeply heapsort([5,4,3,2,1]),  [1,2,3,4,5], 'heapsort';
done_testing;
