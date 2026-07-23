import AdminKit
import SwiftUI

#if canImport(UIKit)
import UIKit
#endif

@main
struct Form5472AdminApp: App {
    @StateObject private var authManager: AuthManager

    init() {
#if canImport(UIKit)
        let deviceName = UIDevice.current.name
#else
        let deviceName = "Apple device"
#endif
        let tokenStore = KeychainTokenStore(service: "com.form5472prep.admin.device-token")
        let client = APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: tokenStore
        )
        _authManager = StateObject(
            wrappedValue: AuthManager(
                client: client,
                tokenStore: tokenStore,
                deviceName: deviceName
            )
        )
    }

    var body: some Scene {
        WindowGroup {
            RootView(authManager: authManager)
                .task {
                    await authManager.restore()
                }
        }
    }
}
