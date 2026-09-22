using CodingLombok.LombokAlgoritma.Math;
using Xunit;

public class MathTests
{
    [Fact] public void Sha256_Empty() =>
        Assert.Equal("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            HashFunctions.Sha256Hex(""));
    [Fact] public void Sha256_Deterministic() =>
        Assert.Equal(HashFunctions.Sha256Hex("test"), HashFunctions.Sha256Hex("test"));
}
