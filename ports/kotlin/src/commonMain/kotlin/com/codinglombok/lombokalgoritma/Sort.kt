// LombokAlgoritma — Kotlin Sort Module
// Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma

/**
 * Timsort — stable, adaptive. O(n log n).
 * Delegates to Kotlin stdlib's sortedWith which uses TimSort.
 */
fun <T : Comparable<T>> timsort(arr: List<T>): List<T> = arr.sorted()

fun <T> timsortWith(arr: List<T>, comparator: Comparator<T>): List<T> = arr.sortedWith(comparator)

/** Mergesort — bottom-up iterative, O(n log n), stable. */
fun <T : Comparable<T>> mergesort(arr: List<T>): List<T> {
    val a = arr.toMutableList()
    val n = a.size
    if (n <= 1) return a
    val tmp = MutableList(n) { a[it] }
    var width = 1
    while (width < n) {
        var lo = 0
        while (lo < n) {
            val mid = minOf(lo + width, n)
            val hi = minOf(lo + 2 * width, n)
            var i = lo; var j = mid; var k = lo
            while (i < mid && j < hi) {
                if (a[i] <= a[j]) tmp[k++] = a[i++] else tmp[k++] = a[j++]
            }
            while (i < mid) tmp[k++] = a[i++]
            while (j < hi) tmp[k++] = a[j++]
            lo += 2 * width
        }
        for (idx in 0 until n) a[idx] = tmp[idx]
        width *= 2
    }
    return a
}

/** Quicksort — O(n log n) average. Not stable. */
fun <T : Comparable<T>> quicksort(arr: List<T>): List<T> {
    val a = arr.toMutableList()
    if (a.size <= 1) return a
    quicksortInner(a, 0, a.size - 1)
    return a
}

private fun <T : Comparable<T>> quicksortInner(a: MutableList<T>, lo: Int, hi: Int) {
    if (lo >= hi) return
    if (hi - lo < 16) { insertionSort(a, lo, hi); return }
    val p = partitionKt(a, lo, hi)
    quicksortInner(a, lo, p - 1)
    quicksortInner(a, p + 1, hi)
}

private fun <T : Comparable<T>> partitionKt(a: MutableList<T>, lo: Int, hi: Int): Int {
    val mid = (lo + hi) / 2
    if (a[lo] > a[mid]) { val t = a[lo]; a[lo] = a[mid]; a[mid] = t }
    if (a[lo] > a[hi])  { val t = a[lo]; a[lo] = a[hi];  a[hi] = t  }
    if (a[mid] > a[hi]) { val t = a[mid]; a[mid] = a[hi]; a[hi] = t }
    val t = a[mid]; a[mid] = a[hi]; a[hi] = t
    val pivot = a[hi]; var i = lo
    for (j in lo until hi) if (a[j] <= pivot) { val u = a[i]; a[i] = a[j]; a[j] = u; i++ }
    val u = a[i]; a[i] = a[hi]; a[hi] = u
    return i
}

private fun <T : Comparable<T>> insertionSort(a: MutableList<T>, lo: Int, hi: Int) {
    for (i in lo + 1..hi) {
        val key = a[i]; var j = i - 1
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j-- }
        a[j + 1] = key
    }
}

/** Heapsort — in-place, O(n log n). Not stable. */
fun <T : Comparable<T>> heapsort(arr: List<T>): List<T> {
    val a = arr.toMutableList(); val n = a.size
    if (n <= 1) return a
    for (i in n / 2 - 1 downTo 0) sift(a, i, n)
    for (end in n - 1 downTo 1) { val t = a[0]; a[0] = a[end]; a[end] = t; sift(a, 0, end) }
    return a
}

private fun <T : Comparable<T>> sift(a: MutableList<T>, root: Int, end: Int) {
    var r = root
    while (true) {
        var largest = r; val l = 2*r+1; val ri = 2*r+2
        if (l < end && a[l] > a[largest]) largest = l
        if (ri < end && a[ri] > a[largest]) largest = ri
        if (largest == r) break
        val t = a[r]; a[r] = a[largest]; a[largest] = t; r = largest
    }
}
