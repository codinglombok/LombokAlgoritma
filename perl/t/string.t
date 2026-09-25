#!/usr/bin/env perl
use strict; use warnings; use Test::More;
use LombokAlgoritma::String qw(kmp_search levenshtein fnv1a32);

is_deeply kmp_search('abcabcabc', 'abc'), [0, 3, 6], 'kmp all';
is_deeply kmp_search('aaaa', 'aa'), [0, 1, 2], 'kmp overlapping';
is_deeply kmp_search('abc', ''), [], 'kmp empty pattern';
is_deeply kmp_search('a0b', '0'), [1], 'kmp pattern "0" (falsy in Perl)';
is levenshtein('kitten', 'sitting'), 3, 'levenshtein';
is levenshtein('', 'abc'), 3, 'levenshtein empty';
is fnv1a32(''), 0x811c9dc5, 'fnv1a32 empty';
is fnv1a32('a'), 0xe40c292c, 'fnv1a32 a';
done_testing;
