import SwiftUI

public struct SignInView: View {
    @ObservedObject private var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var isSigningIn = false

    public init(authManager: AuthManager) {
        self.authManager = authManager
    }

    public var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                AdminTheme.ink
                    .ignoresSafeArea()

                RadialGradient(
                    colors: [
                        AdminTheme.accent.opacity(0.52),
                        AdminTheme.accent.opacity(0.12),
                        .clear,
                    ],
                    center: UnitPoint(x: 0.12, y: 0.04),
                    startRadius: 8,
                    endRadius: 430
                )
                .ignoresSafeArea()

                Rectangle()
                    .fill(AdminTheme.seal.opacity(0.50))
                    .frame(height: 1)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 28) {
                        VStack(alignment: .leading, spacing: 8) {
                            AdminEyebrow("ADMIN", color: AdminTheme.seal)
                            Text("Form 5472 Prep")
                                .font(.largeTitle.weight(.semibold))
                                .fontDesign(.serif)
                                .foregroundStyle(AdminTheme.onDark)
                                .accessibilityAddTraits(.isHeader)
                            Text("Secure access to filings and operations.")
                                .font(.subheadline)
                                .foregroundStyle(AdminTheme.onDark.opacity(0.68))
                        }

                        signInSection(
                            eyebrow: "SIGN IN",
                            description: "Sign in with your admin email and password."
                        ) {
                            emailField
                            passwordField

                            Button {
                                signIn()
                            } label: {
                                Label("Sign In", systemImage: "arrow.right.circle.fill")
                            }
                            .buttonStyle(AdminPrimaryButtonStyle())
                            .disabled(
                                isSigningIn
                                    || email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                    || password.trimmingCharacters(in: .whitespacesAndNewlines)
                                        .isEmpty
                            )
                        }

                        if let errorMessage {
                            Label {
                                Text(errorMessage)
                                    .fixedSize(horizontal: false, vertical: true)
                            } icon: {
                                Image(systemName: "exclamationmark.triangle.fill")
                            }
                            .font(.footnote)
                            .foregroundStyle(AdminTheme.dangerOnDark)
                            .padding(14)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                AdminTheme.danger.opacity(0.14),
                                in: RoundedRectangle(cornerRadius: 10, style: .continuous)
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(AdminTheme.danger.opacity(0.30), lineWidth: 1)
                            )
                            .accessibilityLabel("Sign-in error: \(errorMessage)")
                        }
                    }
                    .frame(maxWidth: 520)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 44)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .navigationTitle("")
            .disabled(isSigningIn)
            .overlay {
                if isSigningIn {
                    ProgressView()
                        .tint(AdminTheme.onDark)
                        .padding(18)
                        .background(
                            AdminTheme.ink800.opacity(0.92),
                            in: RoundedRectangle(cornerRadius: 10, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(AdminTheme.onDark.opacity(0.15), lineWidth: 1)
                        )
                }
            }
        }
    }

    private func signInSection<Content: View>(
        eyebrow: String,
        description: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            VStack(alignment: .leading, spacing: 5) {
                AdminEyebrow(eyebrow, color: AdminTheme.onDark.opacity(0.72))
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(AdminTheme.onDark.opacity(0.62))
                    .fixedSize(horizontal: false, vertical: true)
            }

            content()
        }
        .padding(.vertical, 20)
        .overlay(alignment: .top) {
            Rectangle()
                .fill(AdminTheme.onDark.opacity(0.14))
                .frame(height: 1)
        }
    }

    @ViewBuilder
    private var emailField: some View {
#if os(iOS)
        TextField(
            "",
            text: $email,
            prompt: Text("Admin email").foregroundStyle(AdminTheme.onDark.opacity(0.52))
        )
            .textContentType(.emailAddress)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .keyboardType(.emailAddress)
            .adminDarkField()
#else
        TextField(
            "",
            text: $email,
            prompt: Text("Admin email").foregroundStyle(AdminTheme.onDark.opacity(0.52))
        )
            .adminDarkField()
#endif
    }

    @ViewBuilder
    private var passwordField: some View {
        SecureField(
            "",
            text: $password,
            prompt: Text("Password").foregroundStyle(AdminTheme.onDark.opacity(0.52))
        )
        .adminDarkField()
    }

    private func signIn() {
        errorMessage = nil
        isSigningIn = true
        let submittedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let submittedPassword = password
        Task {
            defer { isSigningIn = false }
            do {
                try await authManager.signIn(
                    email: submittedEmail,
                    password: submittedPassword
                )
            } catch {
                errorMessage = Self.message(for: error)
            }
        }
    }

    private static func message(for error: Error) -> String {
        if case let APIError.server(code, _) = error {
            switch code {
            case "invalid_credentials":
                return "Email or password is incorrect."
            case "rate_limited":
                return "Too many attempts. Please wait a moment and try again."
            default:
                break
            }
        }
        if case APIError.transport = error {
            return "Network error. Check your connection and try again."
        }
        return AdminFormatting.errorMessage(for: error)
    }
}

public struct RootView: View {
    @ObservedObject private var authManager: AuthManager
    @State private var incomingLinkError: String?

    public init(authManager: AuthManager) {
        self.authManager = authManager
    }

    public var body: some View {
        Group {
            switch authManager.state {
            case .unknown:
                ProgressView("Checking sign-in…")
                    .foregroundStyle(AdminTheme.primaryText)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(AdminTheme.screenBackground)
            case .signedOut:
                SignInView(authManager: authManager)
            case .signedIn:
                AdminTabView(client: authManager.client, authManager: authManager)
            }
        }
        .safeAreaInset(edge: .bottom) {
            if let incomingLinkError {
                Label(incomingLinkError, systemImage: "exclamationmark.triangle.fill")
                    .font(.callout.weight(.medium))
                    .foregroundStyle(AdminTheme.danger)
                    .padding(.horizontal, 16)
                    .frame(minHeight: 44)
                    .frame(maxWidth: .infinity)
                    .background(AdminTheme.cardSurface)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(AdminTheme.danger.opacity(0.30))
                            .frame(height: 1)
                    }
            }
        }
        .onOpenURL { url in
            incomingLinkError = nil
            Task {
                do {
                    try await authManager.handle(url: url)
                } catch {
                    incomingLinkError = "The sign-in link is invalid or has expired."
                }
            }
        }
        .tint(AdminTheme.accent)
    }
}

@MainActor
private struct AdminTabView: View {
    let client: APIClient
    @ObservedObject var authManager: AuthManager

    var body: some View {
        TabView {
            NavigationStack {
                DashboardView(client: client, authManager: authManager)
            }
            .tabItem {
                Label("Dashboard", systemImage: "chart.bar.fill")
            }

            NavigationStack {
                FilingsView(client: client, authManager: authManager)
            }
            .tabItem {
                Label("Filings", systemImage: "doc.text.fill")
            }

            NavigationStack {
                ApplicationsView(client: client, authManager: authManager)
            }
            .tabItem {
                Label("Applications", systemImage: "person.text.rectangle.fill")
            }

            NavigationStack {
                AnalyticsView(client: client, authManager: authManager)
            }
            .tabItem {
                Label("Analytics", systemImage: "chart.xyaxis.line")
            }
        }
        .tint(AdminTheme.accent)
    }
}
