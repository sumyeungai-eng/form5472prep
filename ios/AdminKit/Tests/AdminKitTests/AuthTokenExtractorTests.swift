import Testing
@testable import AdminKit

@Suite("Auth token extraction")
struct AuthTokenExtractorTests {
    @Test func extractsRawToken() {
        #expect(AuthTokenExtractor.extract(from: "admin:123.nonce.signature") == "admin:123.nonce.signature")
    }

    @Test func extractsCustomSchemeToken() {
        #expect(
            AuthTokenExtractor.extract(from: "form5472admin://auth/admin%3A123.nonce.signature")
                == "admin:123.nonce.signature"
        )
    }

    @Test func extractsWebLinkToken() {
        #expect(
            AuthTokenExtractor.extract(from: "https://www.form5472prep.com/admin/auth/admin%3A123.nonce.signature")
                == "admin:123.nonce.signature"
        )
    }

    @Test func percentDecodesRawToken() {
        #expect(AuthTokenExtractor.extract(from: "admin%3A123%2Enonce") == "admin:123.nonce")
    }

    @Test(arguments: [
        "",
        "   ",
        "https://example.com/admin/auth/token",
        "http://www.form5472prep.com/admin/auth/token",
        "form5472admin://wrong/token",
        "form5472admin://auth/",
        "https://www.form5472prep.com/admin/auth/token/extra",
        "not a token",
        "broken%ZZ",
    ])
    func rejectsMalformedInput(_ input: String) {
        #expect(AuthTokenExtractor.extract(from: input) == nil)
    }
}
