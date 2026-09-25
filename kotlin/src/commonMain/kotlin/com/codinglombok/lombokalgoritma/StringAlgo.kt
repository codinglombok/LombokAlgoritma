// LombokAlgoritma — Kotlin String Algorithms
// Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma

fun kmpSearch(text: String, pattern: String): List<Int> {
    if (pattern.isEmpty()) return emptyList()
    val m = pattern.length; val f = IntArray(m); var k = 0
    for (i in 1 until m) {
        while (k > 0 && pattern[k] != pattern[i]) k = f[k-1]
        if (pattern[k] == pattern[i]) k++
        f[i] = k
    }
    val results = mutableListOf<Int>(); k = 0
    for (i in text.indices) {
        while (k > 0 && pattern[k] != text[i]) k = f[k-1]
        if (pattern[k] == text[i]) k++
        if (k == m) { results += i - m + 1; k = f[k-1] }
    }
    return results
}

fun levenshtein(a: String, b: String): Int {
    if (a == b) return 0
    val la = a.length; val lb = b.length
    if (la == 0) return lb; if (lb == 0) return la
    val (s, t) = if (la <= lb) Pair(a, b) else Pair(b, a)
    val ls = s.length; val lt = t.length
    var prev = IntArray(ls + 1) { it }
    for (j in 1..lt) {
        val curr = IntArray(ls + 1) { if (it == 0) j else 0 }
        for (i in 1..ls) {
            val cost = if (s[i-1] == t[j-1]) 0 else 1
            curr[i] = minOf(curr[i-1]+1, prev[i]+1, prev[i-1]+cost)
        }
        prev = curr
    }
    return prev[ls]
}

fun fnv1a32(data: ByteArray): UInt {
    var h = 0x811c9dc5u
    for (b in data) { h = h xor b.toUByte().toUInt(); h *= 0x01000193u }
    return h
}
fun fnv1a32(s: String): UInt = fnv1a32(s.encodeToByteArray())
