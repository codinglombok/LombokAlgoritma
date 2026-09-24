// LombokAlgoritma — C++20 Search Module (header-only)
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
#pragma once
#include <vector>
#include <optional>
#include <functional>

namespace lombok {

/// Binary search — O(log n). Returns index or std::nullopt.
template<typename T, typename Compare = std::less<T>>
std::optional<std::size_t> binary_search(const std::vector<T>& arr, const T& target, Compare cmp = Compare{}) {
    std::size_t lo = 0, hi = arr.size();
    while (lo < hi) {
        const auto mid = lo + (hi - lo) / 2;
        if (!cmp(arr[mid], target) && !cmp(target, arr[mid])) return mid;
        if (cmp(arr[mid], target)) lo = mid + 1;
        else hi = mid;
    }
    return std::nullopt;
}

/// Lower bound — first position where arr[i] >= target.
template<typename T>
std::size_t lower_bound(const std::vector<T>& arr, const T& target) {
    std::size_t lo = 0, hi = arr.size();
    while (lo < hi) { const auto mid = lo + (hi - lo) / 2; if (arr[mid] < target) lo = mid + 1; else hi = mid; }
    return lo;
}

/// Linear search — O(n) baseline.
template<typename T>
std::optional<std::size_t> linear_search(const std::vector<T>& arr, const T& target) {
    for (std::size_t i = 0; i < arr.size(); i++) if (arr[i] == target) return i;
    return std::nullopt;
}

} // namespace lombok
