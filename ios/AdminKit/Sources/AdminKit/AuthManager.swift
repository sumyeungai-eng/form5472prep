import Combine
import Foundation

public enum AuthTokenExtractor {
    public static func extract(from input: String) -> String? {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }

        if trimmed.contains("://") {
            guard let components = URLComponents(string: trimmed) else { return nil }
            let encodedParts = components.percentEncodedPath
                .split(separator: "/", omittingEmptySubsequences: true)
                .map(String.init)

            let encodedToken: String
            switch components.scheme?.lowercased() {
            case "form5472admin":
                guard components.host?.lowercased() == "auth", encodedParts.count == 1 else {
                    return nil
                }
                encodedToken = encodedParts[0]
            case "https":
                guard
                    components.host?.lowercased() == "www.form5472prep.com",
                    encodedParts.count == 3,
                    encodedParts[0] == "admin",
                    encodedParts[1] == "auth"
                else {
                    return nil
                }
                encodedToken = encodedParts[2]
            default:
                return nil
            }
            return validatedPercentDecodedToken(encodedToken)
        }

        guard !trimmed.contains("/") else { return nil }
        return validatedPercentDecodedToken(trimmed)
    }

    private static func validatedPercentDecodedToken(_ encodedToken: String) -> String? {
        guard let token = encodedToken.removingPercentEncoding, !token.isEmpty else {
            return nil
        }
        guard token.unicodeScalars.allSatisfy({
            !CharacterSet.whitespacesAndNewlines.contains($0)
                && !CharacterSet.controlCharacters.contains($0)
        }) else {
            return nil
        }
        return token
    }
}

@MainActor
public final class AuthManager: ObservableObject {
    public enum State: Sendable {
        case unknown
        case signedOut
        case signedIn(AdminProfile)
    }

    @Published public private(set) var state: State

    public let client: APIClient
    private let tokenStore: any TokenStore
    private let deviceName: String

    public init(
        client: APIClient,
        tokenStore: any TokenStore,
        deviceName: String = "iPhone"
    ) {
        self.client = client
        self.tokenStore = tokenStore
        self.deviceName = deviceName
        state = .unknown
    }

    public func restore() async {
        do {
            guard let token = try tokenStore.read(), !token.isEmpty else {
                state = .signedOut
                return
            }
            let profile = try await client.me()
            state = .signedIn(profile)
        } catch APIError.unauthorized {
            try? tokenStore.clear()
            state = .signedOut
        } catch {
            state = .signedOut
        }
    }

    public func requestLink(email: String) async throws {
        try await client.requestLink(email: email)
    }

    public func signIn(email: String, password: String) async throws {
        let profile = try await client.login(
            email: email,
            password: password,
            deviceName: deviceName
        )
        state = .signedIn(profile)
    }

    public func handle(url: URL) async throws {
        guard let token = AuthTokenExtractor.extract(from: url.absoluteString) else {
            throw AuthInputError.malformedSignInToken
        }
        try await exchange(token: token)
    }

    public func exchange(pastedLinkOrToken: String) async throws {
        guard let token = AuthTokenExtractor.extract(from: pastedLinkOrToken) else {
            throw AuthInputError.malformedSignInToken
        }
        try await exchange(token: token)
    }

    public func signOut() async {
        try? tokenStore.clear()
        state = .signedOut
    }

    private func exchange(token: String) async throws {
        let profile = try await client.exchange(token: token, deviceName: deviceName)
        state = .signedIn(profile)
    }
}

public enum AuthInputError: LocalizedError, Sendable {
    case malformedSignInToken

    public var errorDescription: String? {
        "Enter a valid Form5472 Prep sign-in link or token."
    }
}
