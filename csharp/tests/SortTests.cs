// LombokAlgoritma — C# Sort Tests
using CodingLombok.LombokAlgoritma.Sort;
using Xunit;

public class SortTests
{
    [Fact] public void Timsort_Empty()   => Assert.Equal(Array.Empty<int>(), Sorting.Timsort<int>([]));
    [Fact] public void Timsort_Reverse() => Assert.Equal(new[]{1,2,3,4,5}, Sorting.Timsort([5,4,3,2,1]));
    [Fact] public void Timsort_Dupes()   => Assert.Equal(new[]{1,1,2,3,3}, Sorting.Timsort([3,1,2,1,3]));
    [Fact] public void Timsort_Neg()     => Assert.Equal(new[]{-3,-2,-1,0,2}, Sorting.Timsort([-3,-1,0,2,-2]));
    [Fact] public void Mergesort_Basic() => Assert.Equal(new[]{1,2,3,4,5}, Sorting.Mergesort([5,4,3,2,1]));
    [Fact] public void Heapsort_Basic()  => Assert.Equal(new[]{1,2,3,4,5}, Sorting.Heapsort([5,4,3,2,1]));
    [Fact] public void Quicksort_Basic() => Assert.Equal(new[]{1,2,3,4,5}, Sorting.Quicksort([5,4,3,2,1]));
}
