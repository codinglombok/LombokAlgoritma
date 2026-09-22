import com.codinglombok.lombokalgoritma.*
import kotlin.test.*
class SearchTest {
    val arr = listOf(1,3,5,7,9,11,13,15,17,19)
    @Test fun bsFound()   = assertEquals(3, binarySearch(arr, 7))
    @Test fun bsMiss()    = assertEquals(-1, binarySearch(arr, 4))
    @Test fun lbBound()   = assertEquals(1, lowerBound(listOf(1,2,2,2,3), 2))
    @Test fun ubBound()   = assertEquals(4, upperBound(listOf(1,2,2,2,3), 2))
}
