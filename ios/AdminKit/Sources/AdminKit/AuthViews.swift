import SwiftUI

private extension Notification.Name {
    static let adminSignInAttemptDidStart = Notification.Name(
        "AdminKit.adminSignInAttemptDidStart"
    )
}

public struct SignInView: View {
    @ObservedObject private var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var errorMessage: String?
    @State private var isSigningIn = false
    @FocusState private var focusedField: Field?

    private enum Field {
        case email
        case password
    }

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
                        AdminTheme.accentFixed.opacity(0.52),
                        AdminTheme.accentFixed.opacity(0.12),
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
                    .ignoresSafeArea(.container, edges: .horizontal)

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
                    .padding(.top, 16)
                    .padding(.bottom, 32)
                    .frame(maxWidth: .infinity)
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .adminHiddenNavigationBar()
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
            .textContentType(.username)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .keyboardType(.emailAddress)
            .submitLabel(.next)
            .focused($focusedField, equals: .email)
            .onSubmit {
                focusedField = .password
            }
            .adminDarkField()
#else
        TextField(
            "",
            text: $email,
            prompt: Text("Admin email").foregroundStyle(AdminTheme.onDark.opacity(0.52))
        )
            .submitLabel(.next)
            .focused($focusedField, equals: .email)
            .onSubmit {
                focusedField = .password
            }
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
        .textContentType(.password)
        .submitLabel(.go)
        .focused($focusedField, equals: .password)
        .onSubmit {
            signIn()
        }
        .adminDarkField()
    }

    private func signIn() {
        guard
            !isSigningIn,
            !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
            !password.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        else { return }

        errorMessage = nil
        focusedField = nil
        isSigningIn = true
        NotificationCenter.default.post(name: .adminSignInAttemptDidStart, object: nil)
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
    @Environment(\.colorScheme) private var colorScheme

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
                HStack(spacing: 10) {
                    Label(incomingLinkError, systemImage: "exclamationmark.triangle.fill")
                        .font(.callout.weight(.medium))
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Button {
                        self.incomingLinkError = nil
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption.weight(.semibold))
                            .frame(width: 44, height: 44)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Dismiss sign-in link error")
                }
                    .foregroundStyle(
                        colorScheme == .dark ? AdminTheme.dangerOnDark : AdminTheme.danger
                    )
                    .padding(.leading, 16)
                    .padding(.trailing, 4)
                    .frame(minHeight: 52)
                    .frame(maxWidth: .infinity)
                    .background(AdminTheme.cardSurface)
                    .overlay(alignment: .top) {
                        Rectangle()
                            .fill(AdminTheme.danger.opacity(0.30))
                            .frame(height: 1)
                    }
            }
        }
        .onReceive(
            NotificationCenter.default.publisher(for: .adminSignInAttemptDidStart)
        ) { _ in
            incomingLinkError = nil
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

            NavigationStack {
                SettingsView(client: client, authManager: authManager)
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape.fill")
            }
        }
        .tint(AdminTheme.accent)
    }
}
