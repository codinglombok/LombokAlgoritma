// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
using CodingLombok.LombokAlgoritma.Hash;
using Xunit;

public class HashTests
{
    [Fact] public void Fnv1a32_Reference() {
        Assert.Equal(0x811c9dc5u, Fnv1a.Hash32(System.Array.Empty<byte>()));
        Assert.Equal(0xe40c292cu, Fnv1a.Hash32("a"));
    }
    [Fact] public void Fnv1a64_Reference() =>
        Assert.Equal(0xaf63dc4c8601ec8cUL, Fnv1a.Hash64(new byte[] { 0x61 }));
}
