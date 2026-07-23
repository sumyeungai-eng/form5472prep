import SwiftUI

@MainActor
public struct SettingsView: View {
    private let client: APIClient
    @ObservedObject private var authManager: AuthManager
    @ObservedObject private var pushManager: PushManager

    @Environment(\.colorScheme) private var colorScheme
    @State private var isConfirmingSignOut = false
    @State private var isUpdatingNotifications = false
    @State private var notificationsEnabled = false
    @State private var feedbackMessage: String?
    @State private var feedbackIsError = false
    @State private var serverHost = "—"

    public init(
        client: APIClient,
        authManager: AuthManager,
        pushManager: PushManager = .shared
    ) {
        self.client = client
        self.authManager = authManager
        self.pushManager = pushManager
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                AdminScreenHeader("Settings", eyebrow: "ACCOUNT") {
                    AdminAccountMenu(
                        email: profile?.email,
                        isConfirmingSignOut: $isConfirmingSignOut
                    )
                }

                accountCard
                notificationsCard
                aboutCard
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
        }
        .background(AdminTheme.screenBackground)
        .adminHiddenNavigationBar()
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
        .confirmationDialog(
            "Sign out of Form 5472 Prep?",
            isPresented: $isConfirmingSignOut,
            titleVisibility: .visible
        ) {
            Button("Sign Out", role: .destructive) {
                Task { await authManager.signOut() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You will need to sign in again to access admin data.")
        }
        .task {
            serverHost = await client.baseURLHost()
            await pushManager.refreshAuthorizationStatus()
            notificationsEnabled = pushManager.state == .registered
        }
        .onChange(of: pushManager.state) { _, newState in
            switch newState {
            case .registered:
                notificationsEnabled = true
                feedbackMessage = "Notifications are enabled."
                feedbackIsError = false
            case .denied:
                notificationsEnabled = false
            case .unknown, .notRegistered:
                break
            }
        }
        .onChange(of: pushManager.lastErrorMessage) { _, message in
            guard let message else { return }
            notificationsEnabled = false
            feedbackMessage = message
            feedbackIsError = true
        }
    }

    private var profile: AdminProfile? {
        guard case let .signedIn(profile) = authManager.state else { return nil }
        return profile
    }

    private var accountCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardHeading("Signed-in account", eyebrow: "ACCOUNT")
            infoRow(
                label: "Email",
                value: profile?.email ?? "Unavailable",
                systemImage: "envelope"
            )
            Divider().overlay(AdminTheme.cardBorder)
            infoRow(
                label: "Authentication",
                value: "Signed in via \(profile?.via.capitalized ?? "Unknown")",
                systemImage: "checkmark.shield"
            )
        }
        .card()
    }

    private var notificationsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardHeading("Push notifications", eyebrow: "ALERTS")

            Toggle(
                "Order & status alerts",
                isOn: Binding(
                    get: { notificationsEnabled },
                    set: { enabled in
                        updateNotifications(enabled)
                    }
                )
            )
            .font(.body.weight(.semibold))
            .disabled(isUpdatingNotifications || pushManager.state == .denied)
            .accessibilityHint("Controls alerts for order and filing status changes")

            if isUpdatingNotifications {
                Label("Updating notification settings…", systemImage: "arrow.triangle.2.circlepath")
                    .font(.footnote)
                    .foregroundStyle(AdminTheme.secondaryText)
            } else if pushManager.state == .denied {
                Label(
                    "Enable notifications in iOS Settings",
                    systemImage: "gearshape"
                )
                .font(.footnote)
                .foregroundStyle(AdminTheme.secondaryText)
                .fixedSize(horizontal: false, vertical: true)
            } else if let feedbackMessage {
                Label(
                    feedbackMessage,
                    systemImage: feedbackIsError
                        ? "exclamationmark.triangle.fill"
                        : "checkmark.circle.fill"
                )
                .font(.footnote)
                .foregroundStyle(feedbackColor)
                .fixedSize(horizontal: false, vertical: true)
            }
        }
        .card()
    }

    private var aboutCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            cardHeading("Application details", eyebrow: "ABOUT")
            infoRow(label: "App", value: appName, systemImage: "app")
            Divider().overlay(AdminTheme.cardBorder)
            infoRow(
                label: "Version",
                value: "\(version) (\(build))",
                systemImage: "number"
            )
            Divider().overlay(AdminTheme.cardBorder)
            infoRow(
                label: "Environment",
                value: "\(PushManager.apnsEnvironment.capitalized) · \(serverHost)",
                systemImage: "network"
            )
        }
        .card()
    }

    private func cardHeading(_ title: String, eyebrow: String) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            AdminEyebrow(eyebrow)
            Text(title)
                .font(.title3.weight(.semibold))
                .fontDesign(.serif)
        }
    }

    private func infoRow(label: String, value: String, systemImage: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: systemImage)
                .foregroundStyle(AdminTheme.accent)
                .frame(width: 24, height: 24)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 3) {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(AdminTheme.secondaryText)
                Text(value)
                    .font(.body)
                    .foregroundStyle(AdminTheme.primaryText)
                    .textSelection(.enabled)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .accessibilityElement(children: .combine)
    }

    private func updateNotifications(_ enabled: Bool) {
        notificationsEnabled = enabled
        feedbackMessage = nil
        feedbackIsError = false
        isUpdatingNotifications = true

        Task {
            defer { isUpdatingNotifications = false }
            do {
                if enabled {
                    try await pushManager.enable()
                    if pushManager.state == .denied {
                        notificationsEnabled = false
                    } else if pushManager.state != .registered {
                        feedbackMessage = "Waiting for iOS to finish registration…"
                    }
                } else {
                    try await pushManager.disable()
                    notificationsEnabled = false
                    feedbackMessage = "Notifications are off."
                }
            } catch {
                notificationsEnabled = !enabled
                feedbackMessage = AdminFormatting.errorMessage(for: error)
                feedbackIsError = true
            }
        }
    }

    private var feedbackColor: Color {
        if feedbackIsError {
            return colorScheme == .dark ? AdminTheme.dangerOnDark : AdminTheme.danger
        }
        return colorScheme == .dark ? AdminTheme.successOnDark : AdminTheme.success
    }

    private var appName: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String
            ?? Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String
            ?? "Form 5472 Prep"
    }

    private var version: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String
            ?? "—"
    }

    private var build: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String
            ?? "—"
    }
}
