import SwiftUI

public struct SignInView: View {
    @ObservedObject private var authManager: AuthManager
    @State private var email = ""
    @State private var pastedLink = ""
    @State private var confirmationMessage: String?
    @State private var errorMessage: String?
    @State private var isRequestingLink = false
    @State private var isExchanging = false

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
                            eyebrow: "EMAIL SIGN-IN",
                            description: "We’ll send a secure, single-use link to your admin address."
                        ) {
                            emailField

                            Button {
                                requestLink()
                            } label: {
                                Label("Email me a sign-in link", systemImage: "envelope")
                            }
                            .buttonStyle(AdminPrimaryButtonStyle())
                            .disabled(
                                isRequestingLink
                                    || email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                            )

                            if let confirmationMessage {
                                Label(confirmationMessage, systemImage: "checkmark.circle.fill")
                                    .font(.footnote)
                                    .foregroundStyle(AdminTheme.successOnDark)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }

                        signInSection(
                            eyebrow: "HAVE A LINK?",
                            description: "Paste the full sign-in link or token below."
                        ) {
                            pastedLinkField

                            Button {
                                exchangeToken()
                            } label: {
                                Label("Sign In", systemImage: "arrow.right.circle.fill")
                            }
                            .buttonStyle(AdminPrimaryButtonStyle())
                            .disabled(
                                isExchanging
                                    || pastedLink.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
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
            .disabled(isRequestingLink || isExchanging)
            .overlay {
                if isRequestingLink || isExchanging {
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
    private var pastedLinkField: some View {
#if os(iOS)
        TextField(
            "",
            text: $pastedLink,
            prompt: Text("Link or token").foregroundStyle(AdminTheme.onDark.opacity(0.52)),
            axis: .vertical
        )
            .lineLimit(2 ... 4)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .adminDarkField()
#else
        TextField(
            "",
            text: $pastedLink,
            prompt: Text("Link or token").foregroundStyle(AdminTheme.onDark.opacity(0.52))
        )
            .adminDarkField()
#endif
    }

    private func requestLink() {
        errorMessage = nil
        confirmationMessage = nil
        isRequestingLink = true
        let submittedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        Task {
            defer { isRequestingLink = false }
            do {
                try await authManager.requestLink(email: submittedEmail)
                confirmationMessage = "If that address is eligible, a sign-in link is on its way."
            } catch {
                errorMessage = Self.message(for: error)
            }
        }
    }

    private func exchangeToken() {
        errorMessage = nil
        isExchanging = true
        let submittedLink = pastedLink
        Task {
            defer { isExchanging = false }
            do {
                try await authManager.exchange(pastedLinkOrToken: submittedLink)
            } catch {
                errorMessage = Self.message(for: error)
            }
        }
    }

    private static func message(for error: Error) -> String {
        if case APIError.unauthorized = error {
            return "That sign-in link is invalid or has expired."
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
