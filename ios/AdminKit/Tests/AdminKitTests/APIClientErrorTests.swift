import Foundation
import Testing
@testable import AdminKit

@Suite("API client responses", .serialized)
struct APIClientTests {
    @Test func maps401ToUnauthorizedAndClearsToken() async throws {
        let store = InMemoryTokenStore(initial: "device-token")
        let client = APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: store,
            session: makeStubSession()
        )
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 401,
                body: #"{"error":{"code":"unauthorized","message":"Admin authentication required"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        do {
            _ = try await client.me()
            Issue.record("Expected unauthorized")
        } catch APIError.unauthorized {
            #expect(try store.read() == nil)
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }

    @Test func maps404ToNotFound() async {
        let client = makeClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 404,
                body: #"{"error":{"code":"not_found","message":"Missing"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        do {
            _ = try await client.me()
            Issue.record("Expected notFound")
        } catch APIError.notFound {
            // Expected.
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }

    @Test func propagatesServerCodeAndMessage() async {
        let client = makeClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 422,
                body: #"{"error":{"code":"invalid_range","message":"Range is invalid"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        do {
            _ = try await client.dashboard(range: "bad")
            Issue.record("Expected server error")
        } catch let APIError.server(code, message) {
            #expect(code == "invalid_range")
            #expect(message == "Range is invalid")
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }

    @Test func propagatesInvalidCredentialsFromLogin() async {
        let client = makeClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 401,
                body: #"{"error":{"code":"invalid_credentials","message":"Email or password is incorrect"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        do {
            _ = try await client.login(
                email: "admin@example.com",
                password: "incorrect",
                deviceName: "Admin’s iPhone"
            )
            Issue.record("Expected server error")
        } catch let APIError.server(code, message) {
            #expect(code == "invalid_credentials")
            #expect(message == "Email or password is incorrect")
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }

    private func makeClient() -> APIClient {
        APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: InMemoryTokenStore(initial: "device-token"),
            session: makeStubSession()
        )
    }
}
