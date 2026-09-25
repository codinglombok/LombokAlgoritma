// LombokAlgoritma — Java Sort Tests — Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma;
import com.codinglombok.lombokalgoritma.sort.Sort;
import org.junit.jupiter.api.*; import static org.junit.jupiter.api.Assertions.*;
class SortTest {
  @Test void mergesortReverse(){assertArrayEquals(new int[]{1,2,3,4,5},Sort.mergesort(new int[]{5,4,3,2,1}));}
  @Test void quicksortReverse(){assertArrayEquals(new int[]{1,2,3,4,5},Sort.quicksort(new int[]{5,4,3,2,1}));}
  @Test void heapsortReverse() {assertArrayEquals(new int[]{1,2,3,4,5},Sort.heapsort(new int[]{5,4,3,2,1}));}
  @Test void mergesortDupes()  {assertArrayEquals(new int[]{1,1,2,3,3},Sort.mergesort(new int[]{3,1,2,1,3}));}
  @Test void mergesortNeg()    {assertArrayEquals(new int[]{-3,-2,-1,0,2},Sort.mergesort(new int[]{-3,-1,0,2,-2}));}
  @Test void countingSort()    {assertArrayEquals(new int[]{0,1,1,2,3,3},Sort.countingSort(new int[]{3,1,2,1,3,0}));}
  @Test void timsortStrings()  {assertArrayEquals(new String[]{"apple","banana","cherry"},Sort.timsort(new String[]{"cherry","apple","banana"}));}
}
