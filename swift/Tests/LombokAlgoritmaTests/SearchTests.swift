import XCTest
@testable import LombokAlgoritma

final class SearchTests: XCTestCase {
    let arr = [1,3,5,7,9,11,13,15,17,19]
    func testBinarySearchHit()  { XCTAssertEqual(Search.binarySearch(arr, target: 7), 3) }
    func testBinarySearchFirst(){ XCTAssertEqual(Search.binarySearch(arr, target: 1), 0) }
    func testBinarySearchMiss() { XCTAssertNil(Search.binarySearch(arr, target: 4)) }
    func testLowerBound()       { XCTAssertEqual(Search.lowerBound([1,2,2,2,3], target: 2), 1) }
    func testUpperBound()       { XCTAssertEqual(Search.upperBound([1,2,2,2,3], target: 2), 4) }
}
