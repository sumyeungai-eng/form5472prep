import Foundation

public enum JSONValue: Codable, Sendable, Equatable {
    case null
    case bool(Bool)
    case number(Double)
    case string(String)
    case array([JSONValue])
    case object([String: JSONValue])

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else if let value = try? container.decode([String: JSONValue].self) {
            self = .object(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unsupported JSON value"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .null:
            try container.encodeNil()
        case let .bool(value):
            try container.encode(value)
        case let .number(value):
            try container.encode(value)
        case let .string(value):
            try container.encode(value)
        case let .array(value):
            try container.encode(value)
        case let .object(value):
            try container.encode(value)
        }
    }

    public var displayString: String {
        switch self {
        case .null:
            return "null"
        case let .bool(value):
            return value ? "true" : "false"
        case let .number(value):
            return value.rounded() == value ? String(Int(value)) : String(value)
        case let .string(value):
            let escaped = value
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"")
                .replacingOccurrences(of: "\n", with: "\\n")
            return "\"\(escaped)\""
        case let .array(values):
            return "[\(values.map(\.displayString).joined(separator: ", "))]"
        case let .object(values):
            let pairs = values.keys.sorted().map { key in
                "\"\(key)\": \(values[key]?.displayString ?? "null")"
            }
            return "{\(pairs.joined(separator: ", "))}"
        }
    }
}

public struct FilingDetail: Codable, Sendable {
    public let filing: FilingRecord
    public let messages: [FilingMessage]
    public let changeLog: [FilingChange]

    public init(filing: FilingRecord, messages: [FilingMessage], changeLog: [FilingChange]) {
        self.filing = filing
        self.messages = messages
        self.changeLog = changeLog
    }
}

public struct FilingRecord: Codable, Sendable, Identifiable {
    public let id: String
    public let status: String
    public let tier: String
    public let amountPaid: Int
    public let llcName: String?
    public let llcEin: String?
    public let llcAddress: String?
    public let llcCity: String?
    public let llcState: String?
    public let llcZip: String?
    public let llcCountry: String
    public let llcDateIncorporated: Date?
    public let llcBusinessActivity: String?
    public let llcBusinessCode: String?
    public let ownerName: String?
    public let ownerAddress: String?
    public let ownerCountryCitizenship: String?
    public let ownerCountryTaxResidence: String?
    public let ownerCountryBusiness: String?
    public let ownerFtin: String?
    public let ownerItin: String?
    public let ownerReferenceId: String?
    public let taxYears: [Int]
    public let isDiirsp: Bool
    public let reasonableCauseNarrative: String?
    public let faxService: Bool
    public let faxStatus: String?
    public let faxedAt: Date?
    public let signedAt: Date?
    public let validationStatus: String?
    public let validationCheckedAt: Date?
    public let createdAt: Date
    public let updatedAt: Date
    public let partnerId: String?
    public let user: FilingUser?
    public let yearData: [FilingYearData]

    public init(
        id: String,
        status: String,
        tier: String,
        amountPaid: Int,
        llcName: String?,
        llcEin: String?,
        llcAddress: String?,
        llcCity: String?,
        llcState: String?,
        llcZip: String?,
        llcCountry: String,
        llcDateIncorporated: Date?,
        llcBusinessActivity: String?,
        llcBusinessCode: String?,
        ownerName: String?,
        ownerAddress: String?,
        ownerCountryCitizenship: String?,
        ownerCountryTaxResidence: String?,
        ownerCountryBusiness: String?,
        ownerFtin: String?,
        ownerItin: String?,
        ownerReferenceId: String?,
        taxYears: [Int],
        isDiirsp: Bool,
        reasonableCauseNarrative: String?,
        faxService: Bool,
        faxStatus: String?,
        faxedAt: Date?,
        signedAt: Date?,
        validationStatus: String?,
        validationCheckedAt: Date?,
        createdAt: Date,
        updatedAt: Date,
        partnerId: String?,
        user: FilingUser?,
        yearData: [FilingYearData]
    ) {
        self.id = id
        self.status = status
        self.tier = tier
        self.amountPaid = amountPaid
        self.llcName = llcName
        self.llcEin = llcEin
        self.llcAddress = llcAddress
        self.llcCity = llcCity
        self.llcState = llcState
        self.llcZip = llcZip
        self.llcCountry = llcCountry
        self.llcDateIncorporated = llcDateIncorporated
        self.llcBusinessActivity = llcBusinessActivity
        self.llcBusinessCode = llcBusinessCode
        self.ownerName = ownerName
        self.ownerAddress = ownerAddress
        self.ownerCountryCitizenship = ownerCountryCitizenship
        self.ownerCountryTaxResidence = ownerCountryTaxResidence
        self.ownerCountryBusiness = ownerCountryBusiness
        self.ownerFtin = ownerFtin
        self.ownerItin = ownerItin
        self.ownerReferenceId = ownerReferenceId
        self.taxYears = taxYears
        self.isDiirsp = isDiirsp
        self.reasonableCauseNarrative = reasonableCauseNarrative
        self.faxService = faxService
        self.faxStatus = faxStatus
        self.faxedAt = faxedAt
        self.signedAt = signedAt
        self.validationStatus = validationStatus
        self.validationCheckedAt = validationCheckedAt
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.partnerId = partnerId
        self.user = user
        self.yearData = yearData
    }
}

public struct FilingUser: Codable, Sendable, Identifiable {
    public let id: String
    public let email: String

    public init(id: String, email: String) {
        self.id = id
        self.email = email
    }
}

public struct FilingYearData: Codable, Sendable, Identifiable {
    public let id: String
    public let taxYear: Int
    public let totalAssetsYearEnd: String
    public let contributions: String
    public let distributions: String
    public let reportableTransactions: JSONValue
    public let otherTransactionsNote: String?

    public init(
        id: String,
        taxYear: Int,
        totalAssetsYearEnd: String,
        contributions: String,
        distributions: String,
        reportableTransactions: JSONValue,
        otherTransactionsNote: String?
    ) {
        self.id = id
        self.taxYear = taxYear
        self.totalAssetsYearEnd = totalAssetsYearEnd
        self.contributions = contributions
        self.distributions = distributions
        self.reportableTransactions = reportableTransactions
        self.otherTransactionsNote = otherTransactionsNote
    }
}

public struct FilingMessage: Codable, Sendable, Identifiable {
    public let id: String
    public let fromAdmin: Bool
    public let body: String
    public let readAt: Date?
    public let createdAt: Date

    public init(id: String, fromAdmin: Bool, body: String, readAt: Date?, createdAt: Date) {
        self.id = id
        self.fromAdmin = fromAdmin
        self.body = body
        self.readAt = readAt
        self.createdAt = createdAt
    }
}

public struct FilingChange: Codable, Sendable, Identifiable {
    public let id: String
    public let adminId: String?
    public let source: String
    public let field: String
    public let beforeJson: JSONValue?
    public let afterJson: JSONValue?
    public let reason: String?
    public let changedAt: Date

    public init(
        id: String,
        adminId: String?,
        source: String,
        field: String,
        beforeJson: JSONValue?,
        afterJson: JSONValue?,
        reason: String?,
        changedAt: Date
    ) {
        self.id = id
        self.adminId = adminId
        self.source = source
        self.field = field
        self.beforeJson = beforeJson
        self.afterJson = afterJson
        self.reason = reason
        self.changedAt = changedAt
    }
}

public struct ApplicationSummary: Codable, Sendable, Identifiable {
    public let id: String
    public let createdAt: Date
    public let updatedAt: Date
    public let fullName: String
    public let email: String
    public let phone: String?
    public let status: String
    public let llcName: String?
    public let llcState: String?
    public let ein: String?
    public let itinReason: String?
    public let itin: String?

    public init(
        id: String,
        createdAt: Date,
        updatedAt: Date,
        fullName: String,
        email: String,
        phone: String?,
        status: String,
        llcName: String?,
        llcState: String?,
        ein: String?,
        itinReason: String?,
        itin: String?
    ) {
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.fullName = fullName
        self.email = email
        self.phone = phone
        self.status = status
        self.llcName = llcName
        self.llcState = llcState
        self.ein = ein
        self.itinReason = itinReason
        self.itin = itin
    }
}

public struct PartnerRow: Codable, Sendable, Identifiable {
    public let id: String
    public let email: String
    public let name: String
    public let company: String?
    public let active: Bool
    public let createdAt: Date
    public let filingCount: Int

    public init(
        id: String,
        email: String,
        name: String,
        company: String?,
        active: Bool,
        createdAt: Date,
        filingCount: Int
    ) {
        self.id = id
        self.email = email
        self.name = name
        self.company = company
        self.active = active
        self.createdAt = createdAt
        self.filingCount = filingCount
    }
}

public struct AnalyticsBundle: Codable, Sendable {
    public let revenueSeries: [RevenuePoint]
    public let sourceAttribution: [SourceAttributionRow]
    public let partnerPerformance: [PartnerPerformance]

    public init(
        revenueSeries: [RevenuePoint],
        sourceAttribution: [SourceAttributionRow],
        partnerPerformance: [PartnerPerformance]
    ) {
        self.revenueSeries = revenueSeries
        self.sourceAttribution = sourceAttribution
        self.partnerPerformance = partnerPerformance
    }
}

public struct RevenuePoint: Codable, Sendable, Identifiable {
    public var id: String { date }
    public let date: String
    public let revenueCents: Int
    public let orders: Int

    public init(date: String, revenueCents: Int, orders: Int) {
        self.date = date
        self.revenueCents = revenueCents
        self.orders = orders
    }
}

public struct SourceAttributionRow: Codable, Sendable, Identifiable {
    public var id: String { source }
    public let source: String
    public let started: Int
    public let paid: Int
    public let confirmed: Int
    public let revenueCents: Int
    public let conversionRate: Double

    public init(
        source: String,
        started: Int,
        paid: Int,
        confirmed: Int,
        revenueCents: Int,
        conversionRate: Double
    ) {
        self.source = source
        self.started = started
        self.paid = paid
        self.confirmed = confirmed
        self.revenueCents = revenueCents
        self.conversionRate = conversionRate
    }
}

public struct PartnerPerformance: Codable, Sendable, Identifiable {
    public var id: String { partnerId }
    public let partnerId: String
    public let name: String
    public let email: String
    public let filings: Int
    public let paidFilings: Int
    public let revenueCents: Int

    public init(
        partnerId: String,
        name: String,
        email: String,
        filings: Int,
        paidFilings: Int,
        revenueCents: Int
    ) {
        self.partnerId = partnerId
        self.name = name
        self.email = email
        self.filings = filings
        self.paidFilings = paidFilings
        self.revenueCents = revenueCents
    }
}
