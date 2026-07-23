import Foundation

#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public enum FixtureMode {
    public static var isActive: Bool {
        ProcessInfo.processInfo.arguments.contains("-AdminFixtures")
    }

    public static func makeSession() -> URLSession {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [FixtureURLProtocol.self]
        return URLSession(configuration: configuration)
    }
}

final class FixtureURLProtocol: URLProtocol, @unchecked Sendable {
    override class func canInit(with request: URLRequest) -> Bool {
        FixtureMode.isActive
            && request.url?.path.hasPrefix("/api/admin/v1/") == true
    }

    override class func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        guard FixtureMode.isActive, let url = request.url else {
            client?.urlProtocol(self, didFailWithError: URLError(.unsupportedURL))
            return
        }

        let body = Self.fixtureBody(
            method: request.httpMethod ?? "GET",
            path: url.path
        )
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "application/json"]
        )!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: body)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}

    private static func fixtureBody(method: String, path: String) -> Data {
        switch (method, path) {
        case ("GET", "/api/admin/v1/me"):
            return data(adminProfileJSON)
        case ("GET", "/api/admin/v1/dashboard"):
            return data(dashboardJSON)
        case ("GET", "/api/admin/v1/filings"):
            return data(filingsJSON)
        case ("GET", let detailPath)
            where detailPath.hasPrefix("/api/admin/v1/filings/"):
            let id = String(detailPath.dropFirst("/api/admin/v1/filings/".count))
            return data(filingDetailJSON(id: id))
        case ("GET", "/api/admin/v1/applications"):
            return data(applicationsJSON)
        case ("GET", "/api/admin/v1/analytics"):
            return data(analyticsJSON)
        case ("GET", "/api/admin/v1/partners"):
            return data(partnersJSON)
        default:
            return data(#"{"data":{}}"#)
        }
    }

    private static func data(_ json: String) -> Data {
        Data(json.utf8)
    }

    private static let adminProfileJSON = #"""
    {
      "data": {
        "adminId": "admin_fixture_001",
        "email": "admin@example.com",
        "via": "bearer"
      }
    }
    """#

    private static let dashboardJSON = #"""
    {
      "data": {
        "revenueCents": {
          "period": 1284750,
          "previousPeriod": 920300,
          "changePct": 39.6
        },
        "orders": {
          "period": 87,
          "previousPeriod": 64,
          "changePct": 35.9
        },
        "filingsByStatus": [
          {"status": "DRAFT", "count": 9},
          {"status": "PAID", "count": 18},
          {"status": "PDF_GENERATED", "count": 12},
          {"status": "SIGNATURE_PENDING", "count": 7},
          {"status": "CONFIRMED", "count": 31},
          {"status": "FAILED", "count": 3}
        ],
        "applicationQueue": {
          "ein": {
            "RECEIVED": 6,
            "IN_REVIEW": 4
          },
          "itin": {
            "AWAITING_CUSTOMER": 3,
            "SUBMITTED": 5,
            "COMPLETED": 11
          }
        },
        "needsAttention": [
          {
            "kind": "fax_failed",
            "filingId": "fixture_filing_008",
            "llcName": "Extraordinarily Long Legal Company Name Holdings International LLC",
            "ageHours": 52
          },
          {
            "kind": "signature_pending",
            "filingId": "fixture_filing_004",
            "llcName": "Harbor & Pine Consulting LLC",
            "ageHours": 29
          },
          {
            "kind": "validation_failed",
            "filingId": "fixture_filing_003",
            "llcName": "Northstar Imports LLC",
            "ageHours": 18
          },
          {
            "kind": "stale_paid",
            "filingId": "fixture_filing_002",
            "llcName": "Blue Lantern Ventures LLC",
            "ageHours": 96
          }
        ]
      }
    }
    """#

    private static let filingsJSON = #"""
    {
      "data": {
        "items": [
          {
            "id": "fixture_filing_001",
            "llcName": "Atlas River Trading LLC",
            "status": "DRAFT",
            "taxYears": [2024],
            "amountPaid": 0,
            "updatedAt": "2026-07-20T10:20:30.123Z",
            "customerEmail": null
          },
          {
            "id": "fixture_filing_002",
            "llcName": "Blue Lantern Ventures LLC",
            "status": "PAID",
            "taxYears": [2024],
            "amountPaid": 14900,
            "updatedAt": "2026-07-20T09:15:14.123Z",
            "customerEmail": "marina.chen@example.com"
          },
          {
            "id": "fixture_filing_003",
            "llcName": "Northstar Imports LLC",
            "status": "PDF_GENERATED",
            "taxYears": [2023],
            "amountPaid": 19900,
            "updatedAt": "2026-07-19T18:42:08.123Z",
            "customerEmail": "diego@northstar-imports.example.com"
          },
          {
            "id": "fixture_filing_004",
            "llcName": "Harbor & Pine Consulting LLC",
            "status": "SIGNATURE_PENDING",
            "taxYears": [2022, 2023, 2024],
            "amountPaid": 29900,
            "updatedAt": "2026-07-19T15:33:21.123Z",
            "customerEmail": "an.extremely.long.customer.email.address.for.testing.layout@some-long-domain-name.example.com"
          },
          {
            "id": "fixture_filing_005",
            "llcName": "Cedar Peak Software LLC",
            "status": "SIGNED_UPLOADED",
            "taxYears": [2024],
            "amountPaid": 17900,
            "updatedAt": "2026-07-18T12:07:44.123Z",
            "customerEmail": "owner@cedarpeak.example.com"
          },
          {
            "id": "fixture_filing_006",
            "llcName": "Solstice Market Research LLC",
            "status": "CONFIRMED",
            "taxYears": [2023],
            "amountPaid": 24900,
            "updatedAt": "2026-07-17T16:55:02.123Z",
            "customerEmail": "aisha.khan@example.com"
          },
          {
            "id": "fixture_filing_007",
            "llcName": "Redwood Global Services LLC",
            "status": "FAXED",
            "taxYears": [2024],
            "amountPaid": 22800,
            "updatedAt": "2026-07-16T11:28:39.123Z",
            "customerEmail": "finance@redwoodglobal.example.com"
          },
          {
            "id": "fixture_filing_008",
            "llcName": "Extraordinarily Long Legal Company Name Holdings International LLC",
            "status": "FAILED",
            "taxYears": [2024],
            "amountPaid": 16900,
            "updatedAt": "2026-07-15T08:19:53.123Z",
            "customerEmail": "operations@ellcname.example.com"
          },
          {
            "id": "fixture_filing_009",
            "llcName": "Juniper Coast Media LLC",
            "status": "PAID",
            "taxYears": [2022],
            "amountPaid": 14900,
            "updatedAt": "2026-07-14T20:41:17.123Z",
            "customerEmail": "lucas@junipercoast.example.com"
          },
          {
            "id": "fixture_filing_010",
            "llcName": "Aurora Textile Studio LLC",
            "status": "CONFIRMED",
            "taxYears": [2023, 2024],
            "amountPaid": 27800,
            "updatedAt": "2026-07-13T14:12:36.123Z",
            "customerEmail": "mei.lin@example.com"
          },
          {
            "id": "fixture_filing_011",
            "llcName": "Silver Fern Commerce LLC",
            "status": "DRAFT",
            "taxYears": [2024],
            "amountPaid": 0,
            "updatedAt": "2026-07-12T10:05:05.123Z",
            "customerEmail": "nora@silverfern.example.com"
          },
          {
            "id": "fixture_filing_012",
            "llcName": "Mosaic Ridge Design LLC",
            "status": "SIGNATURE_PENDING",
            "taxYears": [2024],
            "amountPaid": 18900,
            "updatedAt": "2026-07-11T17:24:48.123Z",
            "customerEmail": "samir@mosaicridge.example.com"
          }
        ],
        "nextCursor": null
      }
    }
    """#

    private static let applicationsJSON = #"""
    {
      "data": {
        "items": [
          {
            "id": "fixture_application_ein_001",
            "createdAt": "2026-07-20T08:10:00.123Z",
            "updatedAt": "2026-07-20T09:45:00.123Z",
            "fullName": "Elena García",
            "email": "elena.garcia@example.com",
            "phone": "+34 612 345 678",
            "status": "RECEIVED",
            "llcName": "García Digital Products LLC",
            "llcState": "WY",
            "ein": null,
            "itinReason": null,
            "itin": null
          },
          {
            "id": "fixture_application_ein_002",
            "createdAt": "2026-07-18T13:22:11.123Z",
            "updatedAt": "2026-07-20T07:04:31.123Z",
            "fullName": "Omar Al-Farsi",
            "email": "omar.alfarsi@example.com",
            "phone": null,
            "status": "IN_REVIEW",
            "llcName": "Desert Bridge Commerce LLC",
            "llcState": "DE",
            "ein": null,
            "itinReason": null,
            "itin": null
          },
          {
            "id": "fixture_application_ein_003",
            "createdAt": "2026-07-10T16:40:42.123Z",
            "updatedAt": "2026-07-19T11:35:27.123Z",
            "fullName": "Priya Nair",
            "email": "priya.nair@example.com",
            "phone": "+91 98765 43210",
            "status": "COMPLETED",
            "llcName": "Coconut Grove Analytics LLC",
            "llcState": "NM",
            "ein": "88-7654321",
            "itinReason": null,
            "itin": null
          },
          {
            "id": "fixture_application_ein_004",
            "createdAt": "2026-07-06T07:05:39.123Z",
            "updatedAt": "2026-07-16T18:28:14.123Z",
            "fullName": "Martin Novak",
            "email": "martin.novak@example.com",
            "phone": "+420 777 123 456",
            "status": "CANCELLED",
            "llcName": null,
            "llcState": null,
            "ein": null,
            "itinReason": null,
            "itin": null
          },
          {
            "id": "fixture_application_itin_001",
            "createdAt": "2026-07-19T06:12:52.123Z",
            "updatedAt": "2026-07-20T10:02:17.123Z",
            "fullName": "Sofía Morales",
            "email": "sofia.morales@example.com",
            "phone": "+52 55 1234 5678",
            "status": "AWAITING_CUSTOMER",
            "llcName": null,
            "llcState": null,
            "ein": null,
            "itinReason": "Federal tax reporting for a U.S. single-member LLC",
            "itin": null
          },
          {
            "id": "fixture_application_itin_002",
            "createdAt": "2026-07-12T12:36:09.123Z",
            "updatedAt": "2026-07-18T14:51:44.123Z",
            "fullName": "Kenji Watanabe",
            "email": "kenji.watanabe@example.com",
            "phone": null,
            "status": "SUBMITTED",
            "llcName": null,
            "llcState": null,
            "ein": null,
            "itinReason": "Claiming a tax treaty benefit",
            "itin": null
          },
          {
            "id": "fixture_application_itin_003",
            "createdAt": "2026-06-28T19:24:50.123Z",
            "updatedAt": "2026-07-15T09:10:06.123Z",
            "fullName": "Amara Okafor",
            "email": "amara.okafor@example.com",
            "phone": "+234 803 555 0198",
            "status": "COMPLETED",
            "llcName": null,
            "llcState": null,
            "ein": null,
            "itinReason": "U.S. federal tax return filing",
            "itin": "912-70-4567"
          },
          {
            "id": "fixture_application_itin_004",
            "createdAt": "2026-06-20T05:42:18.123Z",
            "updatedAt": "2026-07-14T16:08:33.123Z",
            "fullName": "Léa Dubois",
            "email": "lea.dubois@example.com",
            "phone": "+33 6 12 34 56 78",
            "status": "IN_REVIEW",
            "llcName": null,
            "llcState": null,
            "ein": null,
            "itinReason": "Receiving U.S.-source partnership income",
            "itin": null
          }
        ],
        "nextCursor": null
      }
    }
    """#

    private static let analyticsJSON = #"""
    {
      "data": {
        "revenueSeries": [
          {"date": "2026-05-04", "revenueCents": 74500, "orders": 5},
          {"date": "2026-05-11", "revenueCents": 128300, "orders": 8},
          {"date": "2026-05-18", "revenueCents": 164200, "orders": 11},
          {"date": "2026-05-25", "revenueCents": 0, "orders": 0},
          {"date": "2026-06-01", "revenueCents": 209600, "orders": 13},
          {"date": "2026-06-08", "revenueCents": 187400, "orders": 12},
          {"date": "2026-06-15", "revenueCents": 243900, "orders": 16},
          {"date": "2026-06-22", "revenueCents": 0, "orders": 0},
          {"date": "2026-06-29", "revenueCents": 272500, "orders": 18},
          {"date": "2026-07-06", "revenueCents": 301800, "orders": 20},
          {"date": "2026-07-13", "revenueCents": 224700, "orders": 15},
          {"date": "2026-07-20", "revenueCents": 318600, "orders": 21}
        ],
        "sourceAttribution": [
          {
            "source": "organic",
            "started": 96,
            "paid": 41,
            "confirmed": 34,
            "revenueCents": 642300,
            "conversionRate": 42.7
          },
          {
            "source": "google_ads",
            "started": 78,
            "paid": 29,
            "confirmed": 21,
            "revenueCents": 431800,
            "conversionRate": 37.2
          },
          {
            "source": "referral",
            "started": 44,
            "paid": 25,
            "confirmed": 22,
            "revenueCents": 389500,
            "conversionRate": 56.8
          },
          {
            "source": "direct",
            "started": 33,
            "paid": 14,
            "confirmed": 10,
            "revenueCents": 218900,
            "conversionRate": 42.4
          }
        ],
        "partnerPerformance": [
          {
            "partnerId": "fixture_partner_001",
            "name": "Maya Patel",
            "email": "maya@globalfounders.example.com",
            "filings": 28,
            "paidFilings": 23,
            "revenueCents": 402700
          },
          {
            "partnerId": "fixture_partner_002",
            "name": "Daniel Sørensen",
            "email": "daniel@northbridge.example.com",
            "filings": 17,
            "paidFilings": 12,
            "revenueCents": 216800
          }
        ]
      }
    }
    """#

    private static let partnersJSON = #"""
    {
      "data": {
        "items": [
          {
            "id": "fixture_partner_001",
            "email": "maya@globalfounders.example.com",
            "name": "Maya Patel",
            "company": "Global Founders Advisory",
            "active": true,
            "createdAt": "2025-11-04T09:30:12.123Z",
            "filingCount": 28
          },
          {
            "id": "fixture_partner_002",
            "email": "daniel@northbridge.example.com",
            "name": "Daniel Sørensen",
            "company": null,
            "active": false,
            "createdAt": "2026-02-16T14:05:47.123Z",
            "filingCount": 17
          }
        ]
      }
    }
    """#

    private static func filingDetailJSON(id: String) -> String {
        let encodedIDData = try! JSONEncoder().encode(id)
        let encodedID = String(decoding: encodedIDData, as: UTF8.self)
        return #"""
        {
          "data": {
            "filing": {
              "id": \#(encodedID),
              "status": "SIGNATURE_PENDING",
              "tier": "PREMIUM",
              "amountPaid": 29900,
              "llcName": "Harbor & Pine Consulting LLC",
              "llcEin": "88-1234567",
              "llcAddress": "1200 Market Street, Suite 900",
              "llcCity": "Wilmington",
              "llcState": "DE",
              "llcZip": "19801",
              "llcCountry": "US",
              "llcDateIncorporated": "2022-03-14T00:00:00.123Z",
              "llcBusinessActivity": "Management consulting and market research",
              "llcBusinessCode": "541611",
              "ownerName": "Nadia Rahman",
              "ownerAddress": "18 Marina View, Singapore 018987",
              "ownerCountryCitizenship": "GB",
              "ownerCountryTaxResidence": "SG",
              "ownerCountryBusiness": "SG",
              "ownerFtin": "S1234567D",
              "ownerItin": null,
              "ownerReferenceId": "OWNER-NR-2024",
              "taxYears": [2023, 2024],
              "isDiirsp": false,
              "reasonableCauseNarrative": null,
              "faxService": true,
              "faxStatus": "QUEUED",
              "faxedAt": null,
              "signedAt": null,
              "validationStatus": "PASSED",
              "validationCheckedAt": "2026-07-19T14:20:10.123Z",
              "createdAt": "2026-07-02T08:11:32.123Z",
              "updatedAt": "2026-07-20T10:20:30.123Z",
              "partnerId": "fixture_partner_001",
              "user": {
                "id": "fixture_user_004",
                "email": "nadia.rahman@example.com"
              },
              "yearData": [
                {
                  "id": "fixture_year_2023",
                  "taxYear": 2023,
                  "totalAssetsYearEnd": "48500.00",
                  "contributions": "32000.00",
                  "distributions": "7500.00",
                  "reportableTransactions": {
                    "capitalContribution": 32000,
                    "managementFees": 4200,
                    "currency": "USD"
                  },
                  "otherTransactionsNote": "Owner paid formation and software costs personally."
                },
                {
                  "id": "fixture_year_2024",
                  "taxYear": 2024,
                  "totalAssetsYearEnd": "76250.00",
                  "contributions": "18000.00",
                  "distributions": "12000.00",
                  "reportableTransactions": {
                    "capitalContribution": 18000,
                    "reimbursementToOwner": 1850,
                    "currency": "USD"
                  },
                  "otherTransactionsNote": null
                }
              ]
            },
            "messages": [
              {
                "id": "fixture_message_001",
                "fromAdmin": false,
                "body": "I uploaded the signed authorization page. Please confirm that the signature is clear.",
                "readAt": "2026-07-19T16:40:00.123Z",
                "createdAt": "2026-07-19T16:32:18.123Z"
              },
              {
                "id": "fixture_message_002",
                "fromAdmin": true,
                "body": "The signature is legible. We are completing the final filing review now.",
                "readAt": null,
                "createdAt": "2026-07-20T09:05:44.123Z"
              }
            ],
            "changeLog": [
              {
                "id": "fixture_change_001",
                "adminId": "admin_fixture_001",
                "source": "admin",
                "field": "status",
                "beforeJson": {"status": "PAID"},
                "afterJson": {"status": "PDF_GENERATED"},
                "reason": "Generated forms after validation passed.",
                "changedAt": "2026-07-19T14:22:00.123Z"
              },
              {
                "id": "fixture_change_002",
                "adminId": "admin_fixture_001",
                "source": "admin",
                "field": "status",
                "beforeJson": {"status": "PDF_GENERATED"},
                "afterJson": {"status": "SIGNATURE_PENDING"},
                "reason": "Sent signature packet to customer.",
                "changedAt": "2026-07-19T14:30:12.123Z"
              }
            ]
          }
        }
        """#
    }
}
