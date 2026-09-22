import XCTest
@testable import LombokAlgoritma

final class MLTests: XCTestCase {
    func testCosineIdentical()  { XCTAssertEqual(VectorOps.cosineSimilarity([1,0,0],[1,0,0]), 1.0, accuracy: 1e-10) }
    func testCosineOrthogonal() { XCTAssertEqual(VectorOps.cosineSimilarity([1,0,0],[0,1,0]), 0.0, accuracy: 1e-10) }
    func testCosineGeneral()    { XCTAssertEqual(VectorOps.cosineSimilarity([1,2,3],[4,5,6]), 0.9746, accuracy: 0.001) }
    func testL2Distance()       { XCTAssertEqual(VectorOps.l2Distance([0,0],[3,4]), 5.0, accuracy: 1e-10) }
    func testNormalize()        { let n = VectorOps.normalize([3,4]); XCTAssertEqual(VectorOps.l2Norm(n), 1.0, accuracy: 1e-10) }
    func testDotProduct()       { XCTAssertEqual(VectorOps.dotProduct([1,2,3],[4,5,6]), 32.0, accuracy: 1e-10) }
}
