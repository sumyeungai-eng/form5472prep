import Foundation
import Testing
@testable import AdminKit

extension APIClientTests {
    @Test func decodesAdminProfileEnvelope() async throws {
        let client = makeDecodingClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"adminId":"admin_123","email":"admin@example.com","via":"bearer"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let profile = try await client.me()
        #expect(profile.adminId == "admin_123")
        #expect(profile.email == "admin@example.com")
        #expect(profile.via == "bearer")
    }

    @Test func decodesLoginEnvelopeAndStoresDeviceToken() async throws {
        let store = InMemoryTokenStore(initial: nil)
        let client = makeDecodingClient(tokenStore: store)
        StubURLProtocol.install { request in
            #expect(request.url?.path == "/api/admin/v1/auth/login")
            #expect(request.httpMethod == "POST")
            #expect(request.value(forHTTPHeaderField: "Authorization") == nil)
            return stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"deviceToken":"device-token-from-login","expiresAt":"2026-08-22T10:20:30.123Z","admin":{"id":"admin_456","email":"admin@example.com","name":"Admin User"}}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let profile = try await client.login(
            email: "admin@example.com",
            password: "correct horse battery staple",
            deviceName: "Admin’s iPhone"
        )
        #expect(profile.adminId == "admin_456")
        #expect(profile.email == "admin@example.com")
        #expect(profile.via == "bearer")
        #expect(try store.read() == "device-token-from-login")
    }

    @Test func decodesDashboardEnvelope() async throws {
        let client = makeDecodingClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"revenueCents":{"period":12500,"previousPeriod":10000,"changePct":25.0},"orders":{"period":5,"previousPeriod":4,"changePct":25.0},"filingsByStatus":[{"status":"PAID","count":3}],"applicationQueue":{"ein":{"NEW":2},"itin":{"REVIEW":1}},"needsAttention":[{"kind":"fax_failed","filingId":"filing_1","llcName":null,"ageHours":27.5}]}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let dashboard = try await client.dashboard(range: "30d")
        #expect(dashboard.revenueCents.period == 12_500)
        #expect(dashboard.orders.period == 5)
        #expect(dashboard.filingsByStatus.first?.status == "PAID")
        #expect(dashboard.applicationQueue.ein["NEW"] == 2)
        #expect(dashboard.needsAttention.first?.filingId == "filing_1")
        #expect(dashboard.needsAttention.first?.llcName == nil)
        #expect(dashboard.needsAttention.first?.ageHours == 27.5)
    }

    @Test func decodesFilingPageEnvelope() async throws {
        let client = makeDecodingClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"items":[{"id":"filing_1","llcName":"Example LLC","status":"PAID","taxYears":[2024,2025],"amountPaid":14900,"updatedAt":"2026-07-23T10:20:30.123Z","customerEmail":"owner@example.com"}],"nextCursor":"next_page"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let page = try await client.filings(
            status: "PAID",
            query: "Example",
            cursor: nil,
            limit: 25
        )
        #expect(page.items.count == 1)
        #expect(page.items[0].amountPaid == 14_900)
        #expect(page.items[0].taxYears == [2024, 2025])
        #expect(page.items[0].customerEmail == "owner@example.com")
        #expect(page.nextCursor == "next_page")
    }

    @Test func decodesDraftFilingPageRowWithNullableFields() async throws {
        let client = makeDecodingClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"items":[{"id":"filing_draft","llcName":null,"status":"DRAFT","taxYears":[],"amountPaid":0,"updatedAt":"2026-07-24T08:15:30.250Z","customerEmail":null}],"nextCursor":null}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let page = try await client.filings(
            status: nil,
            query: nil,
            cursor: nil,
            limit: 25
        )
        #expect(page.items.count == 1)
        #expect(page.items[0].id == "filing_draft")
        #expect(page.items[0].llcName == nil)
        #expect(page.items[0].customerEmail == nil)
        #expect(page.items[0].taxYears.isEmpty)
        #expect(page.items[0].amountPaid == 0)
        #expect(page.nextCursor == nil)
    }

    private func makeDecodingClient(
        tokenStore: any TokenStore = InMemoryTokenStore(initial: "device-token")
    ) -> APIClient {
        APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: tokenStore,
            session: makeStubSession()
        )
    }
}
