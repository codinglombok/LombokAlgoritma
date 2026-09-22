// LombokAlgoritma — Kotlin ML Module
// Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma
import kotlin.math.sqrt

fun dotProduct(a: DoubleArray, b: DoubleArray): Double = a.zip(b.asList()).sumOf { (x,y) -> x*y }
fun l2Norm(v: DoubleArray): Double = sqrt(v.sumOf { it*it })
fun cosineSimilarity(a: DoubleArray, b: DoubleArray): Double {
    val na = l2Norm(a); val nb = l2Norm(b)
    return if (na == 0.0 || nb == 0.0) 0.0 else dotProduct(a, b) / (na * nb)
}
fun l2Distance(a: DoubleArray, b: DoubleArray): Double = sqrt(a.zip(b.asList()).sumOf { (x,y) -> (x-y)*(x-y) })
fun normalize(v: DoubleArray): DoubleArray { val n=l2Norm(v); return if(n==0.0)DoubleArray(v.size) else DoubleArray(v.size){v[it]/n} }
