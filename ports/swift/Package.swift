// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LombokAlgoritma",
    platforms: [
        .macOS(.v13), .iOS(.v16), .tvOS(.v16), .watchOS(.v9), .visionOS(.v1),
    ],
    products: [
        .library(name: "LombokAlgoritma", targets: ["LombokAlgoritma"]),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "LombokAlgoritma",
            path: "Sources/LombokAlgoritma",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("BareSlashRegexLiterals"),
            ]
        ),
        .testTarget(
            name: "LombokAlgoritmaTests",
            dependencies: ["LombokAlgoritma"],
            path: "Tests/LombokAlgoritmaTests",
            resources: [.copy("../../tests/vectors")]
        ),
    ],
    swiftLanguageVersions: [.v5]
)
