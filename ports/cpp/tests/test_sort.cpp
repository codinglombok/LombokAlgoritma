// LombokAlgoritma — C++ Sort Tests
// Apache-2.0 — @codinglombok
#define CATCH_CONFIG_MAIN
#include <catch2/catch_test_macros.hpp>
#include <lombokalgoritma/sort.hpp>
#include <lombokalgoritma/search.hpp>
#include <lombokalgoritma/string_algo.hpp>
#include <lombokalgoritma/ml.hpp>
#include <vector>
#include <cmath>

using namespace lombok;

TEST_CASE("timsort", "[sort]") {
    REQUIRE(timsort(std::vector<int>{}) == std::vector<int>{});
    REQUIRE(timsort(std::vector<int>{42}) == std::vector<int>{42});
    REQUIRE(timsort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5}));
    REQUIRE(timsort(std::vector<int>{3,1,2,1,3}) == (std::vector<int>{1,1,2,3,3}));
    REQUIRE(timsort(std::vector<int>{-3,-1,0,2,-2}) == (std::vector<int>{-3,-2,-1,0,2}));
}

TEST_CASE("mergesort", "[sort]") {
    REQUIRE(mergesort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5}));
    REQUIRE(mergesort(std::vector<int>{3,1,2,1,3}) == (std::vector<int>{1,1,2,3,3}));
}

TEST_CASE("heapsort", "[sort]") {
    REQUIRE(heapsort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5}));
}

TEST_CASE("counting_sort", "[sort]") {
    REQUIRE(counting_sort(std::vector<int>{3,1,2,1,3,0}) == (std::vector<int>{0,1,1,2,3,3}));
}

TEST_CASE("radix_sort_lsd", "[sort]") {
    REQUIRE(radix_sort_lsd(std::vector<uint32_t>{170,45,75,90,802,24,2,66}) ==
            (std::vector<uint32_t>{2,24,45,66,75,90,170,802}));
}

TEST_CASE("binary_search", "[search]") {
    std::vector<int> arr = {1,3,5,7,9,11,13,15,17,19};
    REQUIRE(binary_search(arr, 7).value() == 3);
    REQUIRE(binary_search(arr, 1).value() == 0);
    REQUIRE(!binary_search(arr, 4).has_value());
}

TEST_CASE("kmp_search", "[string]") {
    auto r = kmp_search("abcabcabc", "abc");
    REQUIRE(r == (std::vector<std::size_t>{0,3,6}));
    REQUIRE(kmp_search("hello", "xyz").empty());
}

TEST_CASE("levenshtein", "[string]") {
    REQUIRE(levenshtein("kitten", "sitting") == 3);
    REQUIRE(levenshtein("hello", "hello") == 0);
    REQUIRE(levenshtein("", "abc") == 3);
}

TEST_CASE("fnv1a32", "[string]") {
    REQUIRE(fnv1a32("hello") == fnv1a32("hello"));
    REQUIRE(fnv1a32("hello") != fnv1a32("world"));
}

TEST_CASE("cosine_similarity", "[ml]") {
    auto sim = cosine_similarity({1,2,3}, {4,5,6});
    REQUIRE(std::abs(sim - 0.9746) < 0.001);
    REQUIRE(cosine_similarity({1,0,0}, {1,0,0}) == 1.0);
    REQUIRE(std::abs(cosine_similarity({1,0,0}, {0,1,0})) < 1e-10);
}

TEST_CASE("l2_distance", "[ml]") {
    REQUIRE(std::abs(l2_distance({0,0}, {3,4}) - 5.0) < 1e-10);
    REQUIRE(l2_distance({1,2,3}, {1,2,3}) == 0.0);
}
