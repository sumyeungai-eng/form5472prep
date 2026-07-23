import Combine
import Foundation

#if canImport(UIKit)
import UIKit
import UserNotifications
#endif

public enum PushState: Sendable, Equatable {
    case unknown
    case denied
    case notRegistered
    case registered
}

public enum PushManagerError: LocalizedError, Sendable {
    case notConfigured

    public var errorDescription: String? {
        "Push notifications are not configured."
    }
}

@MainActor
public final class PushManager: ObservableObject {
    public static let shared = PushManager()

    @Published public private(set) var state: PushState = .unknown
    @Published public private(set) var lastErrorMessage: String?

    private var client: APIClient?

    public init(client: APIClient? = nil) {
        self.client = client
    }

    public func configure(client: APIClient) {
        self.client = client
    }

    public func refreshAuthorizationStatus() async {
#if canImport(UIKit)
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        switch settings.authorizationStatus {
        case .denied:
            state = .denied
        case .authorized, .provisional, .ephemeral:
            state = UIApplication.shared.isRegisteredForRemoteNotifications
                ? .registered
                : .notRegistered
        case .notDetermined:
            state = .notRegistered
        @unknown default:
            state = .unknown
        }
#endif
    }

    public func registerForRemoteNotificationsIfAuthorized() async {
#if canImport(UIKit)
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            if state != .registered {
                state = .notRegistered
            }
            UIApplication.shared.registerForRemoteNotifications()
        case .denied:
            state = .denied
        case .notDetermined:
            state = .notRegistered
        @unknown default:
            state = .unknown
        }
#endif
    }

    public func enable() async throws {
#if canImport(UIKit)
        lastErrorMessage = nil
        let granted = try await UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .badge, .sound]
        )
        guard granted else {
            state = .denied
            return
        }

        state = .notRegistered
        UIApplication.shared.registerForRemoteNotifications()
#endif
    }

    public func disable() async throws {
#if canImport(UIKit)
        guard let client else {
            throw PushManagerError.notConfigured
        }

        lastErrorMessage = nil
        try await client.unregisterAPNs()
        UIApplication.shared.unregisterForRemoteNotifications()
        state = .notRegistered
#endif
    }

    public func handleDeviceToken(_ deviceToken: Data) async {
#if canImport(UIKit)
        guard let client else {
            state = .notRegistered
            lastErrorMessage = PushManagerError.notConfigured.localizedDescription
            return
        }

        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        do {
            try await client.registerAPNs(
                token: token,
                environment: Self.apnsEnvironment
            )
            lastErrorMessage = nil
            state = .registered
        } catch {
            state = .notRegistered
            lastErrorMessage = AdminFormatting.errorMessage(for: error)
        }
#endif
    }

    public nonisolated static var apnsEnvironment: String {
        // TestFlight/archive builds use production APNs; local Debug builds use sandbox.
#if DEBUG
        "sandbox"
#else
        "production"
#endif
    }
}
