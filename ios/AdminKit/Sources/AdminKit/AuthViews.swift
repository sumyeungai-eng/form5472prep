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
            Form {
                Section("Email sign-in") {
                    emailField

                    Button {
                        requestLink()
                    } label: {
                        Label("Email me a sign-in link", systemImage: "envelope")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(isRequestingLink || email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                    if let confirmationMessage {
                        Label(confirmationMessage, systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    }
                }

                Section("Paste a sign-in link") {
                    pastedLinkField

                    Button {
                        exchangeToken()
                    } label: {
                        Label("Sign In", systemImage: "arrow.right.circle.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(isExchanging || pastedLink.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                            .accessibilityLabel("Sign-in error: \(errorMessage)")
                    }
                }
            }
            .navigationTitle("F5472 Admin")
            .disabled(isRequestingLink || isExchanging)
            .overlay {
                if isRequestingLink || isExchanging {
                    ProgressView()
                }
            }
        }
    }

    @ViewBuilder
    private var emailField: some View {
#if os(iOS)
        TextField("Admin email", text: $email)
            .textContentType(.emailAddress)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .keyboardType(.emailAddress)
#else
        TextField("Admin email", text: $email)
#endif
    }

    @ViewBuilder
    private var pastedLinkField: some View {
#if os(iOS)
        TextField("Link or token", text: $pastedLink, axis: .vertical)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
#else
        TextField("Link or token", text: $pastedLink)
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
            case .signedOut:
                SignInView(authManager: authManager)
            case .signedIn:
                AdminTabView(client: authManager.client, authManager: authManager)
            }
        }
        .safeAreaInset(edge: .bottom) {
            if let incomingLinkError {
                Text(incomingLinkError)
                    .font(.callout)
                    .foregroundStyle(.red)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.thinMaterial)
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
    }
}
