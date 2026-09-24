// swift-tools-version: 5.9
// SPDX-License-Identifier: Apache-2.0 OR MIT
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "LombokAlgoritma",
    platforms: [
        .macOS(.v13),
        .iOS(.v16),
        .tvOS(.v16),
        .watchOS(.v9),
        .visionOS(.v1),
    ],
    products: [
        .library(
            name: "LombokAlgoritma",
            targets: ["LombokAlgoritma"]
        ),
        .library(
            name: "LombokAlgoritmaDynamic",
            type: .dynamic,
            targets: ["LombokAlgoritma"]
        ),
    ],
    // Zero external runtime dependencies.
    // Optional LombokECC dependency can be added for verified-output API.
    dependencies: [
        // Uncomment to enable ECC verified output:
        // .package(url: "https://github.com/codinglombok/LombokECC.git", from: "0.2.0"),
    ],
    targets: [
        .target(
            name: "LombokAlgoritma",
            path: "ports/swift/Sources/LombokAlgoritma",
            swiftSettings: [
                .enableExperimentalFeature("StrictConcurrency"),
                .enableUpcomingFeature("BareSlashRegexLiterals"),
                .enableUpcomingFeature("ConciseMagicFile"),
                .enableUpcomingFeature("ExistentialAny"),
                .enableUpcomingFeature("ForwardTrailingClosures"),
                .enableUpcomingFeature("ImportObjcForwardDeclarations"),
                .enableUpcomingFeature("DisableOutwardActorInference"),
            ]
        ),
        .testTarget(
            name: "LombokAlgoritmaTests",
            dependencies: ["LombokAlgoritma"],
            path: "ports/swift/Tests"
        ),
    ],
    swiftLanguageVersions: [.v5]
)
