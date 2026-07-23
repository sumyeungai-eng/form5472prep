import AdminKit
import SwiftUI

@main
struct Form5472AdminApp: App {
    @StateObject private var authManager: AuthManager

    init() {
        let tokenStore = KeychainTokenStore(service: "com.form5472prep.admin.device-token")
        let client = APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: tokenStore
        )
        _authManager = StateObject(
            wrappedValue: AuthManager(
                client: client,
                tokenStore: tokenStore,
                deviceName: "iPhone"
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
