import Foundation
import Testing
@testable import AdminKit

extension APIClientTests {
    @Test func decodesFilingDetailWithArbitraryJSON() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            // URL.path decodes escapes, so read the raw path via URLComponents
            // to prove the id was percent-encoded into the path.
            let encodedPath = request.url
                .flatMap { URLComponents(url: $0, resolvingAgainstBaseURL: false) }?
                .percentEncodedPath
            #expect(encodedPath?.hasSuffix("/filing%2Fspecial") == true)
            return stubResponse(
                url: request.url!,
                status: 200,
                body: #"""
                {"data":{"filing":{
                  "id":"filing/special","status":"PAID","tier":"pro","amountPaid":24900,
                  "llcName":"Example LLC","llcEin":"12-3456789","llcAddress":"1 Main St",
                  "llcCity":"Cheyenne","llcState":"WY","llcZip":"82001","llcCountry":"US",
                  "llcDateIncorporated":"2024-01-15T00:00:00.000Z",
                  "llcBusinessActivity":"Consulting","llcBusinessCode":"541611",
                  "ownerName":"Ada Owner","ownerAddress":"2 Queen Rd",
                  "ownerCountryCitizenship":"GB","ownerCountryTaxResidence":"HK",
                  "ownerCountryBusiness":"HK","ownerFtin":"FT-123","ownerItin":null,
                  "ownerReferenceId":"REF-ADA","taxYears":[2024],"isDiirsp":true,
                  "reasonableCauseNarrative":"Filed under the procedure.","faxService":true,
                  "faxStatus":"PENDING","faxedAt":null,"signedAt":"2026-07-20T10:00:00Z",
                  "validationStatus":"PASSED","validationCheckedAt":"2026-07-20T10:01:00.125Z",
                  "createdAt":"2026-07-01T09:00:00Z","updatedAt":"2026-07-21T11:30:00.500Z",
                  "partnerId":"partner_1","user":{"id":"user_1","email":"owner@example.com"},
                  "yearData":[{"id":"year_1","taxYear":2024,
                    "totalAssetsYearEnd":"12345.67","contributions":"5000.25","distributions":"100.00",
                    "reportableTransactions":[
                      {"type":"contribution","amount":"5000.25","verified":true},
                      {"type":"fees","amounts":[25,12.5],"metadata":{"source":"bank","note":null}}
                    ],
                    "otherTransactionsNote":"Bank fees reimbursed"
                  }]
                },"messages":[
                  {"id":"message_1","fromAdmin":false,"body":"Please review.","readAt":null,
                   "createdAt":"2026-07-19T08:00:00Z"},
                  {"id":"message_2","fromAdmin":true,"body":"Reviewed.",
                   "readAt":"2026-07-19T09:05:00.250Z","createdAt":"2026-07-19T09:00:00Z"}
                ],"changeLog":[
                  {"id":"change_1","adminId":"admin_1","source":"ADMIN","field":"status",
                   "beforeJson":{"status":"DRAFT","attempts":1},
                   "afterJson":{"status":"PAID","attempts":2},
                   "reason":"Payment received","changedAt":"2026-07-18T07:00:00Z"}
                ]}}
                """#
            )
        }
        defer { StubURLProtocol.reset() }

        let detail = try await client.filingDetail(id: "filing/special")
        #expect(detail.filing.amountPaid == 24_900)
        #expect(detail.filing.yearData[0].totalAssetsYearEnd == "12345.67")
        #expect(detail.messages.map(\.id) == ["message_1", "message_2"])
        #expect(detail.changeLog[0].beforeJson != nil)
        guard case let .array(transactions) = detail.filing.yearData[0].reportableTransactions else {
            Issue.record("Expected reportable transaction array")
            return
        }
        #expect(transactions.count == 2)
    }

    @Test func decodesEINAndITINApplicationShapes() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            let type = URLComponents(url: request.url!, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "type" })?.value
            let item: String
            if type == "ein" {
                item = #"{"id":"ein_1","createdAt":"2026-07-01T00:00:00Z","updatedAt":"2026-07-02T00:00:00.100Z","fullName":"Ein Person","email":"ein@example.com","llcName":"Ein LLC","status":"RECEIVED","ein":null,"phone":"+1 555 0100","llcState":"WY"}"#
            } else {
                item = #"{"id":"itin_1","createdAt":"2026-07-03T00:00:00Z","updatedAt":"2026-07-04T00:00:00.200Z","fullName":"Itin Person","email":"itin@example.com","phone":null,"itinReason":"Treaty benefit","status":"IN_REVIEW","itin":"900-70-0000"}"#
            }
            return stubResponse(
                url: request.url!,
                status: 200,
                body: "{\"data\":{\"items\":[\(item)],\"nextCursor\":null}}"
            )
        }
        defer { StubURLProtocol.reset() }

        let ein = try await client.applications(type: "ein", status: nil, cursor: nil, limit: 25)
        let itin = try await client.applications(type: "itin", status: "", cursor: nil, limit: 25)
        #expect(ein.items[0].llcName == "Ein LLC")
        #expect(ein.items[0].itinReason == nil)
        #expect(itin.items[0].itinReason == "Treaty benefit")
        #expect(itin.items[0].llcName == nil)
    }

    @Test func decodesPartnerRows() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"{"data":{"items":[{"id":"partner_1","email":"partner@example.com","name":"Pat Partner","company":"Partner Co","active":true,"createdAt":"2026-01-01T12:00:00Z","filingCount":42}]}}"#
            )
        }
        defer { StubURLProtocol.reset() }

        let partners = try await client.partners()
        #expect(partners.count == 1)
        #expect(partners[0].company == "Partner Co")
        #expect(partners[0].filingCount == 42)
    }

    @Test func decodesAnalyticsBundle() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"""
                {"data":{
                  "revenueSeries":[{"date":"2026-07-20","revenueCents":12500,"orders":3}],
                  "sourceAttribution":[{"source":"organic_search","started":10,"paid":4,"confirmed":3,"revenueCents":50000,"conversionRate":0.4}],
                  "partnerPerformance":[{"partnerId":"partner_1","name":"Pat Partner","email":"partner@example.com","filings":8,"paidFilings":6,"revenueCents":75000}]
                }}
                """#
            )
        }
        defer { StubURLProtocol.reset() }

        let analytics = try await client.analytics(range: "30d", bucket: "day")
        #expect(analytics.revenueSeries[0].revenueCents == 12_500)
        #expect(analytics.sourceAttribution[0].conversionRate == 0.4)
        #expect(analytics.partnerPerformance[0].paidFilings == 6)
    }

    private func makeFeatureClient() -> APIClient {
        APIClient(
            baseURL: URL(string: "https://www.form5472prep.com")!,
            tokenStore: InMemoryTokenStore(initial: "device-token"),
            session: makeStubSession()
        )
    }
}

@Suite("Admin formatting")
struct AdminFormattingTests {
    @Test(arguments: [
        (0, "$0.00"),
        (1, "$0.01"),
        (99, "$0.99"),
        (100, "$1.00"),
        (123_456_789, "$1,234,567.89"),
    ])
    func formatsUSCurrency(_ cents: Int, _ expected: String) {
        #expect(AdminFormatting.usd(cents: cents) == expected)
    }
}

@Suite("Cursor pagination")
struct CursorPaginationTests {
    @Test func appendsPagesInOrder() {
        var pagination = CursorPagination(items: ["first", "second"], nextCursor: "page-2")
        pagination.append(["third", "fourth"], nextCursor: nil)
        #expect(pagination.items == ["first", "second", "third", "fourth"])
    }

    @Test func nilCursorStopsFurtherRequests() {
        let pagination = CursorPagination(items: ["only"], nextCursor: nil)
        #expect(!pagination.hasMorePages)
        #expect(!pagination.shouldRequestNextPage(isLoading: false))
    }
}
