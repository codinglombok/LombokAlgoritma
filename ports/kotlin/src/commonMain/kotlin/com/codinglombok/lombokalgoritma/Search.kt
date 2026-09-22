// LombokAlgoritma — Kotlin Search Module
// Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma

fun <T : Comparable<T>> binarySearch(arr: List<T>, target: T): Int {
    var lo = 0; var hi = arr.size - 1
    while (lo <= hi) {
        val mid = (lo + hi) ushr 1
        when { arr[mid] == target -> return mid; arr[mid] < target -> lo = mid + 1; else -> hi = mid - 1 }
    }
    return -1
}

fun <T : Comparable<T>> lowerBound(arr: List<T>, target: T): Int {
    var lo = 0; var hi = arr.size
    while (lo < hi) { val mid = (lo + hi) ushr 1; if (arr[mid] < target) lo = mid + 1 else hi = mid }
    return lo
}

fun <T : Comparable<T>> upperBound(arr: List<T>, target: T): Int {
    var lo = 0; var hi = arr.size
    while (lo < hi) { val mid = (lo + hi) ushr 1; if (arr[mid] <= target) lo = mid + 1 else hi = mid }
    return lo
}

fun <T> linearSearch(arr: List<T>, target: T): Int = arr.indexOf(target)
