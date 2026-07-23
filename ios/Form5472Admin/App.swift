import AdminKit
import OSLog
import SwiftUI

#if canImport(UIKit)
import UIKit

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        Task { @MainActor in
            await PushManager.shared.handleDeviceToken(deviceToken)
        }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        Logger(
            subsystem: "com.form5472prep.admin",
            category: "PushNotifications"
        ).error("Remote notification registration failed: \(error.localizedDescription, privacy: .public)")
    }
}
#endif

@main
@MainActor
struct Form5472AdminApp: App {
    @StateObject private var authManager: AuthManager

#if canImport(UIKit)
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
#endif

    init() {
#if canImport(UIKit)
        let deviceName = UIDevice.current.name
#else
        let deviceName = "Apple device"
#endif
        if FixtureMode.isActive {
            let tokenStore = InMemoryTokenStore(initial: "fixture-token")
            let client = APIClient(
                baseURL: URL(string: "https://www.form5472prep.com")!,
                tokenStore: tokenStore,
                session: FixtureMode.makeSession()
            )
            PushManager.shared.configure(client: client)
            _authManager = StateObject(
                wrappedValue: AuthManager(
                    client: client,
                    tokenStore: tokenStore,
                    deviceName: deviceName
                )
            )
            return
        }

        let tokenStore = KeychainTokenStore(service: "com.form5472prep.admin.device-token")
        let client = APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: tokenStore
        )
        PushManager.shared.configure(client: client)
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
                    if case .signedIn = authManager.state {
                        await PushManager.shared
                            .registerForRemoteNotificationsIfAuthorized()
                    }
                }
        }
    }
}
