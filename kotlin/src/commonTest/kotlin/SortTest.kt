// LombokAlgoritma — Kotlin Sort Tests
import com.codinglombok.lombokalgoritma.*
import kotlin.test.*

class SortTest {
    @Test fun timEmpty()    = assertEquals(emptyList(), timsort(emptyList<Int>()))
    @Test fun timReverse()  = assertEquals(listOf(1,2,3,4,5), timsort(listOf(5,4,3,2,1)))
    @Test fun timDupes()    = assertEquals(listOf(1,1,2,3,3), timsort(listOf(3,1,2,1,3)))
    @Test fun timNeg()      = assertEquals(listOf(-3,-2,-1,0,2), timsort(listOf(-3,-1,0,2,-2)))
    @Test fun mergeBasic()  = assertEquals(listOf(1,2,3,4,5), mergesort(listOf(5,4,3,2,1)))
    @Test fun quickBasic()  = assertEquals(listOf(1,2,3,4,5), quicksort(listOf(5,4,3,2,1)))
    @Test fun heapBasic()   = assertEquals(listOf(1,2,3,4,5), heapsort(listOf(5,4,3,2,1)))
}
