// LombokAlgoritma — C++ Tests (Catch2)
// Apache-2.0 — @codinglombok

#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include <lombokalgoritma/sort.hpp>
#include <lombokalgoritma/search.hpp>
#include <lombokalgoritma/string_algo.hpp>
#include <lombokalgoritma/ml.hpp>
using namespace lombok;
using Catch::Approx;

TEST_CASE("Sort algorithms", "[sort]") {
    SECTION("timsort empty")    { REQUIRE(timsort(std::vector<int>{}).empty()); }
    SECTION("timsort reverse")  { REQUIRE(timsort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5})); }
    SECTION("timsort dupes")    { REQUIRE(timsort(std::vector<int>{3,1,2,1,3}) == (std::vector<int>{1,1,2,3,3})); }
    SECTION("timsort negative") { REQUIRE(timsort(std::vector<int>{-3,-1,0,2,-2}) == (std::vector<int>{-3,-2,-1,0,2})); }
    SECTION("mergesort")        { REQUIRE(mergesort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5})); }
    SECTION("heapsort")         { REQUIRE(heapsort(std::vector<int>{5,4,3,2,1}) == (std::vector<int>{1,2,3,4,5})); }
    SECTION("counting_sort")    { REQUIRE(counting_sort(std::vector<int>{3,1,2,0}) == (std::vector<int>{0,1,2,3})); }
    SECTION("radix_sort_lsd")   { REQUIRE(radix_sort_lsd(std::vector<uint32_t>{170,45,75,2,66}) == (std::vector<uint32_t>{2,45,66,75,170})); }
}

TEST_CASE("Search algorithms", "[search]") {
    std::vector<int> arr = {1,3,5,7,9,11,13,15,17,19};
    SECTION("binary_search hit")  { REQUIRE(binary_search(arr,7).value()==3); }
    SECTION("binary_search miss") { REQUIRE(!binary_search(arr,4).has_value()); }
    SECTION("lower_bound")        { REQUIRE(lower_bound(std::vector<int>{1,2,2,2,3},2)==1); }
    SECTION("linear_search")      { REQUIRE(linear_search(arr,11).value()==5); }
}

TEST_CASE("String algorithms", "[string]") {
    SECTION("kmp found")    { REQUIRE(kmp_search("abcabcabc","abc") == (std::vector<std::size_t>{0,3,6})); }
    SECTION("kmp miss")     { REQUIRE(kmp_search("hello","xyz").empty()); }
    SECTION("levenshtein")  { REQUIRE(levenshtein("kitten","sitting")==3); REQUIRE(levenshtein("hello","hello")==0); }
    SECTION("fnv1a32 det")  { REQUIRE(fnv1a32("hello")==fnv1a32("hello")); }
    SECTION("fnv1a32 diff") { REQUIRE(fnv1a32("hello")!=fnv1a32("world")); }
}

TEST_CASE("ML / Vector operations", "[ml]") {
    SECTION("cosine identical") { REQUIRE(cosine_similarity({1,0,0},{1,0,0}) == Approx(1.0)); }
    SECTION("cosine orthogonal") { REQUIRE(cosine_similarity({1,0,0},{0,1,0}) == Approx(0.0).margin(1e-10)); }
    SECTION("cosine general")    { REQUIRE(cosine_similarity({1,2,3},{4,5,6}) == Approx(0.9746).margin(0.001)); }
    SECTION("l2_distance")       { REQUIRE(l2_distance({0,0},{3,4}) == Approx(5.0)); }
    SECTION("normalize unit")    {
        auto n = normalize({3,4});
        REQUIRE(l2_norm(n) == Approx(1.0).margin(1e-10));
    }
}

TEST_CASE("v0.1.1 regressions", "[regression]") {
    REQUIRE_THROWS_AS(counting_sort(std::vector<int>{1, -1}), std::out_of_range);
    REQUIRE_THROWS_AS(counting_sort(std::vector<int>{5, 1}, 3), std::out_of_range);
    REQUIRE(radix_sort_lsd(std::vector<std::uint32_t>{7}) == (std::vector<std::uint32_t>{7}));
    REQUIRE(fnv1a32("a") == 0xe40c292cu);
    REQUIRE(fnv1a64("a") == 0xaf63dc4c8601ec8cull);
}
