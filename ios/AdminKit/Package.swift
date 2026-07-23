// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "AdminKit",
    platforms: [
        .iOS(.v17),
        // macOS 14 is the host floor: `swift test` builds the SwiftUI views for
        // the host, and onChange(of:initial:) is iOS 17 / macOS 14.
        .macOS(.v14),
    ],
    products: [
        .library(name: "AdminKit", targets: ["AdminKit"]),
    ],
    targets: [
        .target(name: "AdminKit"),
        .testTarget(name: "AdminKitTests", dependencies: ["AdminKit"]),
    ]
)
