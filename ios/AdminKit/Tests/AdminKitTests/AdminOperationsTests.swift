import Foundation
import Testing
@testable import AdminKit

extension APIClientTests {
    @Test func decodesFilingDocumentAvailabilityBooleans() async throws {
        let client = makeOperationsClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"""
                {"data":{"filing":{
                  "id":"filing_docs","status":"SIGNED_UPLOADED","tier":"basic","amountPaid":0,
                  "llcName":null,"llcEin":null,"llcAddress":null,"llcCity":null,
                  "llcState":null,"llcZip":null,"llcCountry":"US","llcDateIncorporated":null,
                  "llcBusinessActivity":null,"llcBusinessCode":null,"ownerName":null,
                  "ownerAddress":null,"ownerCountryCitizenship":null,"ownerCountryTaxResidence":null,
                  "ownerCountryBusiness":null,"ownerFtin":null,"ownerItin":null,"ownerReferenceId":null,
                  "taxYears":[],"isDiirsp":false,"reasonableCauseNarrative":null,"faxService":true,
                  "faxStatus":null,"faxedAt":null,"signedAt":null,"validationStatus":null,
                  "validationCheckedAt":null,"createdAt":"2026-08-25T00:00:00Z",
                  "updatedAt":"2026-08-25T00:00:00Z","partnerId":null,"user":null,"yearData":[],
                  "hasGeneratedPdf":true,"hasSignedPdf":true,"hasFaxedPdf":false,
                  "hasCustomerSignature":true
                },"messages":[],"changeLog":[]}}
                """#
            )
        }
        defer { StubURLProtocol.reset() }

        let filing = try await client.filingDetail(id: "filing_docs").filing
        #expect(filing.hasGeneratedPdf == true)
        #expect(filing.hasSignedPdf == true)
        #expect(filing.hasFaxedPdf == false)
        #expect(filing.hasCustomerSignature == true)
    }

    @Test func decodesNullableApplicationAdminNotes() async throws {
        let client = makeOperationsClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"items":[{"id":"ein_notes","createdAt":"2026-08-25T00:00:00Z","updatedAt":"2026-08-25T00:00:00Z","fullName":"Notes Applicant","email":"notes@example.com","phone":null,"status":"IN_REVIEW","llcName":"Notes LLC","llcState":"WY","ein":null,"itinReason":null,"itin":null,"adminNotes":"Call customer Tuesday"}],"nextCursor":null}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let page = try await client.applications(
            type: "ein",
            status: nil,
            cursor: nil,
            limit: 25
        )
        #expect(page.items[0].adminNotes == "Call customer Tuesday")
    }

    @Test func filingActionIncludesGivenIdempotencyKey() async throws {
        struct Body: Decodable {
            let action: String
            let idempotencyKey: String
        }

        let client = makeOperationsClient()
        StubURLProtocol.install { request in
            #expect(request.url?.path == "/api/admin/v1/filings/filing_1/actions")
            #expect(request.httpMethod == "POST")
            let body = try JSONDecoder().decode(Body.self, from: requestBody(request))
            #expect(body.action == "retryFax")
            #expect(body.idempotencyKey == "intent-key-123")
            return stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"replayed":false}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let result = try await client.filingAction(
            id: "filing_1",
            action: "retryFax",
            idempotencyKey: "intent-key-123"
        )
        #expect(!result.replayed)
    }

    @Test func filingPdfReturnsRawBytesUnmodified() async throws {
        let client = makeOperationsClient()
        let expected = Data("%PDF-1.4\nfixture bytes".utf8)
        StubURLProtocol.install { request in
            #expect(request.url?.path == "/api/admin/v1/filings/filing_1/pdf")
            #expect(request.url?.query == "kind=signed")
            #expect(request.value(forHTTPHeaderField: "Accept") == "application/pdf")
            let response = HTTPURLResponse(
                url: request.url!,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields: ["Content-Type": "application/pdf"]
            )!
            return (response, expected)
        }
        defer { StubURLProtocol.reset() }

        let data = try await client.filingPdf(id: "filing_1", kind: "signed")
        #expect(data == expected)
    }

    @Test func filingPdfMaps404ToNotFound() async {
        let client = makeOperationsClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 404,
                body: #"{"error":{"code":"not_found","message":"PDF not found"}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        do {
            _ = try await client.filingPdf(id: "filing_1", kind: "faxed")
            Issue.record("Expected notFound")
        } catch APIError.notFound {
            // Expected.
        } catch {
            Issue.record("Unexpected error: \(error)")
        }
    }

    @Test func applicationsSendsSearchQuery() async throws {
        let client = makeOperationsClient()
        StubURLProtocol.install { request in
            let query = URLComponents(url: request.url!, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "q" })?.value
            #expect(query == "Ada LLC")
            return stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"items":[],"nextCursor":null}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        _ = try await client.applications(
            type: "ein",
            status: nil,
            query: "Ada LLC",
            cursor: nil,
            limit: 25
        )
    }

    private func makeOperationsClient() -> APIClient {
        APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: InMemoryTokenStore(initial: "device-token"),
            session: makeStubSession()
        )
    }
}
