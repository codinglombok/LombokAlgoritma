// LombokAlgoritma — C++20 ML Module (header-only)
// DIPAKAI oleh LombokVector (C++ port)
// Apache-2.0 — @codinglombok
#pragma once
#include <vector>
#include <cmath>
#include <stdexcept>

namespace lombok {

double dot_product(const std::vector<double>& a, const std::vector<double>& b) {
    double s = 0; for (std::size_t i = 0; i < a.size(); i++) s += a[i] * b[i]; return s;
}

double l2_norm(const std::vector<double>& v) {
    double s = 0; for (auto x : v) s += x * x; return std::sqrt(s);
}

double cosine_similarity(const std::vector<double>& a, const std::vector<double>& b) {
    const auto na = l2_norm(a), nb = l2_norm(b);
    return (na == 0 || nb == 0) ? 0.0 : dot_product(a, b) / (na * nb);
}

double l2_distance(const std::vector<double>& a, const std::vector<double>& b) {
    double s = 0;
    for (std::size_t i = 0; i < a.size(); i++) { auto d = a[i]-b[i]; s += d*d; }
    return std::sqrt(s);
}

std::vector<double> normalize(const std::vector<double>& v) {
    const auto n = l2_norm(v);
    if (n == 0) return std::vector<double>(v.size(), 0.0);
    std::vector<double> out(v.size());
    for (std::size_t i = 0; i < v.size(); i++) out[i] = v[i] / n;
    return out;
}

} // namespace lombok
