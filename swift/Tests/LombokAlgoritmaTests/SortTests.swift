// LombokAlgoritma — Swift Sort Tests
// Apache-2.0 — @codinglombok
import XCTest
@testable import LombokAlgoritma

final class SortTests: XCTestCase {
    func testTimsortEmpty()    { XCTAssertEqual(Sort.timsort([Int]()), []) }
    func testTimsortReverse()  { XCTAssertEqual(Sort.timsort([5,4,3,2,1]), [1,2,3,4,5]) }
    func testTimsortDupes()    { XCTAssertEqual(Sort.timsort([3,1,2,1,3]), [1,1,2,3,3]) }
    func testTimsortNeg()      { XCTAssertEqual(Sort.timsort([-3,-1,0,2,-2]), [-3,-2,-1,0,2]) }
    func testMergesortBasic()  { XCTAssertEqual(Sort.mergesort([5,4,3,2,1]), [1,2,3,4,5]) }
    func testQuicksortBasic()  { XCTAssertEqual(Sort.quicksort([5,4,3,2,1]), [1,2,3,4,5]) }
    func testHeapsortBasic()   { XCTAssertEqual(Sort.heapsort([5,4,3,2,1]), [1,2,3,4,5]) }
    func testTimsortStrings()  { XCTAssertEqual(Sort.timsort(["banana","apple","cherry"]), ["apple","banana","cherry"]) }
}
