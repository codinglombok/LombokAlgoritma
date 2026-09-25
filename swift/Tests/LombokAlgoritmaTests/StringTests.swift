import XCTest
@testable import LombokAlgoritma

final class StringTests: XCTestCase {
    func testKmpFound()     { XCTAssertEqual(StringAlgo.kmpSearch("abcabcabc", pattern: "abc"), [0,3,6]) }
    func testKmpMiss()      { XCTAssertEqual(StringAlgo.kmpSearch("hello", pattern: "xyz"), []) }
    func testLevenshtein()  { XCTAssertEqual(StringAlgo.levenshtein("kitten","sitting"), 3) }
    func testLevSame()      { XCTAssertEqual(StringAlgo.levenshtein("hello","hello"), 0) }
    func testFnvDet()       { XCTAssertEqual(StringAlgo.fnv1a32("hello"), StringAlgo.fnv1a32("hello")) }
    func testFnvDiff()      { XCTAssertNotEqual(StringAlgo.fnv1a32("hello"), StringAlgo.fnv1a32("world")) }
    func testJaroWinklerSame() { XCTAssertEqual(StringAlgo.jaroWinkler("hello","hello"), 1.0, accuracy: 1e-9) }
}
