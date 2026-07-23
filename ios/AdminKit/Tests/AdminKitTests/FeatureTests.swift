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

    @Test func decodesFilingDetailWhenEveryNullableFieldIsNull() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            stubResponse(
                url: request.url!,
                status: 200,
                body: #"""
                {"data":{"filing":{
                  "id":"filing_draft","status":"DRAFT","tier":"basic","amountPaid":0,
                  "llcName":null,"llcEin":null,"llcAddress":null,"llcCity":null,
                  "llcState":null,"llcZip":null,"llcCountry":"USA",
                  "llcDateIncorporated":null,"llcBusinessActivity":null,
                  "llcBusinessCode":null,"ownerName":null,"ownerAddress":null,
                  "ownerCountryCitizenship":null,"ownerCountryTaxResidence":null,
                  "ownerCountryBusiness":null,"ownerFtin":null,"ownerItin":null,
                  "ownerReferenceId":null,"taxYears":[],"isDiirsp":false,
                  "reasonableCauseNarrative":null,"faxService":true,"faxStatus":null,
                  "faxedAt":null,"signedAt":null,"validationStatus":null,
                  "validationCheckedAt":null,"createdAt":"2026-07-24T01:00:00Z",
                  "updatedAt":"2026-07-24T01:00:00.125Z","partnerId":null,"user":null,
                  "yearData":[{"id":"year_draft","taxYear":2025,
                    "totalAssetsYearEnd":"0","contributions":"0","distributions":"0",
                    "reportableTransactions":[],"otherTransactionsNote":null}]
                },"messages":[
                  {"id":"message_unread","fromAdmin":false,"body":"Draft question",
                   "readAt":null,"createdAt":"2026-07-24T01:05:00Z"}
                ],"changeLog":[
                  {"id":"change_system","adminId":null,"source":"system","field":"status",
                   "beforeJson":null,"afterJson":null,"reason":null,
                   "changedAt":"2026-07-24T01:10:00Z"}
                ]}}
                """#
            )
        }
        defer { StubURLProtocol.reset() }

        let detail = try await client.filingDetail(id: "filing_draft")
        #expect(detail.filing.llcName == nil)
        #expect(detail.filing.llcEin == nil)
        #expect(detail.filing.llcDateIncorporated == nil)
        #expect(detail.filing.ownerName == nil)
        #expect(detail.filing.reasonableCauseNarrative == nil)
        #expect(detail.filing.faxStatus == nil)
        #expect(detail.filing.faxedAt == nil)
        #expect(detail.filing.signedAt == nil)
        #expect(detail.filing.validationStatus == nil)
        #expect(detail.filing.validationCheckedAt == nil)
        #expect(detail.filing.partnerId == nil)
        #expect(detail.filing.user == nil)
        #expect(detail.filing.yearData[0].otherTransactionsNote == nil)
        #expect(detail.messages[0].readAt == nil)
        #expect(detail.changeLog[0].adminId == nil)
        #expect(detail.changeLog[0].beforeJson == nil)
        #expect(detail.changeLog[0].afterJson == nil)
        #expect(detail.changeLog[0].reason == nil)
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

    @Test func decodesApplicationRowsWithNullableAndVariantFields() async throws {
        let client = makeFeatureClient()
        StubURLProtocol.install { request in
            let type = URLComponents(url: request.url!, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "type" })?.value
            let item = type == "ein"
                ? #"{"id":"ein_nulls","createdAt":"2026-07-24T02:00:00Z","updatedAt":"2026-07-24T02:01:00.100Z","fullName":"EIN Applicant","email":"ein.nulls@example.com","llcName":"Required Name LLC","status":"RECEIVED","ein":null,"phone":null,"llcState":null}"#
                : #"{"id":"itin_nulls","createdAt":"2026-07-24T03:00:00Z","updatedAt":"2026-07-24T03:01:00.200Z","fullName":"ITIN Applicant","email":"itin.nulls@example.com","phone":null,"itinReason":"Federal tax reporting","status":"RECEIVED","itin":null}"#
            return stubResponse(
                url: request.url!,
                status: 200,
                body: "{\"data\":{\"items\":[\(item)],\"nextCursor\":null}}"
            )
        }
        defer { StubURLProtocol.reset() }

        let ein = try await client.applications(
            type: "ein",
            status: nil,
            cursor: nil,
            limit: 25
        )
        let itin = try await client.applications(
            type: "itin",
            status: nil,
            cursor: nil,
            limit: 25
        )

        #expect(ein.items[0].phone == nil)
        #expect(ein.items[0].llcState == nil)
        #expect(ein.items[0].ein == nil)
        #expect(ein.items[0].itinReason == nil)
        #expect(ein.items[0].itin == nil)
        #expect(itin.items[0].phone == nil)
        #expect(itin.items[0].llcName == nil)
        #expect(itin.items[0].llcState == nil)
        #expect(itin.items[0].ein == nil)
        #expect(itin.items[0].itin == nil)
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
