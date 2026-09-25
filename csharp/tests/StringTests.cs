using CodingLombok.LombokAlgoritma.StringAlgo;
using Xunit;

public class StringTests
{
    [Fact] public void Kmp_Found()   => Assert.Equal([0,3,6], StringAlgorithms.KmpSearch("abcabcabc","abc"));
    [Fact] public void Kmp_Miss()    => Assert.Empty(StringAlgorithms.KmpSearch("hello","xyz"));
    [Fact] public void Lev_Kitten() => Assert.Equal(3, StringAlgorithms.Levenshtein("kitten","sitting"));
    [Fact] public void Lev_Same()   => Assert.Equal(0, StringAlgorithms.Levenshtein("hello","hello"));
    [Fact] public void Fnv_Det()    => Assert.Equal(StringAlgorithms.Fnv1a32("hello"), StringAlgorithms.Fnv1a32("hello"));
}
