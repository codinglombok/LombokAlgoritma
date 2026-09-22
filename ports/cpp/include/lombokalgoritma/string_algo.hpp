// LombokAlgoritma — C++20 String Algorithms (header-only)
// Apache-2.0 — @codinglombok
#pragma once
#include <string>
#include <string_view>
#include <vector>
#include <cstdint>
#include <algorithm>
#include <cmath>

namespace lombok {

/// KMP search — O(n+m). Returns all start indices.
std::vector<std::size_t> kmp_search(std::string_view text, std::string_view pattern) {
    std::vector<std::size_t> results;
    if (pattern.empty()) return results;
    const auto m = pattern.size();
    std::vector<std::size_t> f(m, 0);
    for (std::size_t i = 1, k = 0; i < m; i++) {
        while (k > 0 && pattern[k] != pattern[i]) k = f[k-1];
        if (pattern[k] == pattern[i]) k++;
        f[i] = k;
    }
    for (std::size_t i = 0, k = 0; i < text.size(); i++) {
        while (k > 0 && pattern[k] != text[i]) k = f[k-1];
        if (pattern[k] == text[i]) k++;
        if (k == m) { results.push_back(i - m + 1); k = f[k-1]; }
    }
    return results;
}

/// Levenshtein distance — O(mn) time, O(min(m,n)) space.
std::size_t levenshtein(std::string_view a, std::string_view b) {
    if (a == b) return 0;
    if (a.size() > b.size()) std::swap(a, b);
    std::vector<std::size_t> prev(a.size() + 1), curr(a.size() + 1);
    for (std::size_t i = 0; i <= a.size(); i++) prev[i] = i;
    for (std::size_t j = 1; j <= b.size(); j++) {
        curr[0] = j;
        for (std::size_t i = 1; i <= a.size(); i++) {
            const auto cost = a[i-1] == b[j-1] ? 0u : 1u;
            curr[i] = std::min({curr[i-1]+1, prev[i]+1, prev[i-1]+cost});
        }
        std::swap(prev, curr);
    }
    return prev[a.size()];
}

/// FNV-1a 32-bit hash.
uint32_t fnv1a32(std::string_view s) noexcept {
    uint32_t h = 0x811c9dc5u;
    for (unsigned char c : s) { h ^= c; h *= 0x01000193u; }
    return h;
}

/// FNV-1a 64-bit hash.
uint64_t fnv1a64(std::string_view s) noexcept {
    uint64_t h = 0xcbf29ce484222325ull;
    for (unsigned char c : s) { h ^= c; h *= 0x00000100000001b3ull; }
    return h;
}

} // namespace lombok
