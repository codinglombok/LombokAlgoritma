// LombokAlgoritma — C++20 Sort Module (header-only)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
#pragma once
#include <algorithm>
#include <vector>
#include <functional>
#include <cstddef>
#include <cstdint>
#include <stdexcept>

namespace lombok {

/// Timsort — stable, adaptive. Delegates to std::stable_sort (O(n log n)).
template<typename T, typename Compare = std::less<T>>
std::vector<T> timsort(const std::vector<T>& arr, Compare cmp = Compare{}) {
    auto result = arr;
    std::stable_sort(result.begin(), result.end(), cmp);
    return result;
}

/// Quicksort — delegates to std::sort (introsort: quicksort + heapsort fallback), not stable.
template<typename T, typename Compare = std::less<T>>
std::vector<T> quicksort(const std::vector<T>& arr, Compare cmp = Compare{}) {
    auto result = arr;
    std::sort(result.begin(), result.end(), cmp);
    return result;
}

/// Mergesort — bottom-up iterative, O(n log n), stable.
template<typename T, typename Compare = std::less<T>>
std::vector<T> mergesort(const std::vector<T>& input, Compare cmp = Compare{}) {
    auto a = input;
    const std::size_t n = a.size();
    if (n <= 1) return a;
    std::vector<T> tmp(n);
    for (std::size_t w = 1; w < n; w *= 2) {
        for (std::size_t lo = 0; lo < n; lo += 2 * w) {
            const auto mid = std::min(lo + w, n);
            const auto hi  = std::min(lo + 2 * w, n);
            std::size_t i = lo, j = mid, k = lo;
            while (i < mid && j < hi) {
                if (!cmp(a[j], a[i])) tmp[k++] = a[i++];
                else                   tmp[k++] = a[j++];
            }
            while (i < mid) tmp[k++] = a[i++];
            while (j < hi)  tmp[k++] = a[j++];
        }
        a = tmp;
    }
    return a;
}

/// Heapsort — in-place, O(n log n), not stable.
template<typename T, typename Compare = std::less<T>>
std::vector<T> heapsort(const std::vector<T>& input, Compare cmp = Compare{}) {
    auto a = input;
    std::make_heap(a.begin(), a.end(), cmp);
    std::sort_heap(a.begin(), a.end(), cmp);
    return a;
}

/// Counting sort for integers in [0, max_val].
inline std::vector<int> counting_sort(const std::vector<int>& arr, int max_val = -1) {
    if (arr.empty()) return {};
    const int k = max_val >= 0 ? max_val : *std::max_element(arr.begin(), arr.end());
    std::vector<int> count(static_cast<std::size_t>(k + 1), 0);
    for (int v : arr) {
        if (v < 0 || v > k) throw std::out_of_range("counting_sort: value outside [0, max_val]");
        count[static_cast<std::size_t>(v)]++;
    }
    std::vector<int> out;
    out.reserve(arr.size());
    for (int i = 0; i <= k; i++)
        for (int j = 0; j < count[static_cast<std::size_t>(i)]; j++) out.push_back(i);
    return out;
}

/// LSD Radix sort for uint32_t. O(nk).
inline std::vector<std::uint32_t> radix_sort_lsd(const std::vector<uint32_t>& input) {
    auto a = input;
    if (a.size() <= 1) return a;
    std::vector<std::uint32_t> tmp(a.size());
    for (std::uint32_t shift = 0; shift < 32; shift += 8) {
        std::size_t count[256] = {};
        for (auto v : a) count[(v >> shift) & 0xFF]++;
        for (int i = 1; i < 256; i++) count[i] += count[i-1];
        for (int k = static_cast<int>(a.size()) - 1; k >= 0; k--) {
            auto idx = (a[static_cast<std::size_t>(k)] >> shift) & 0xFF;
            tmp[--count[idx]] = a[static_cast<std::size_t>(k)];
        }
        a = tmp;
    }
    return a;
}

} // namespace lombok
