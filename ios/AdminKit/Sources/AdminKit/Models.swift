import Foundation

public struct AdminProfile: Codable, Sendable {
    public let adminId: String?
    public let email: String?
    public let via: String

    public init(adminId: String?, email: String?, via: String) {
        self.adminId = adminId
        self.email = email
        self.via = via
    }
}

public struct PeriodComparison: Codable, Sendable {
    public let period: Int
    public let previousPeriod: Int
    public let changePct: Double

    public init(period: Int, previousPeriod: Int, changePct: Double) {
        self.period = period
        self.previousPeriod = previousPeriod
        self.changePct = changePct
    }
}

public struct FilingStatusCount: Codable, Sendable {
    public let status: String
    public let count: Int

    public init(status: String, count: Int) {
        self.status = status
        self.count = count
    }
}

public struct ApplicationQueue: Codable, Sendable {
    public let ein: [String: Int]
    public let itin: [String: Int]

    public init(ein: [String: Int], itin: [String: Int]) {
        self.ein = ein
        self.itin = itin
    }
}

public struct AttentionItem: Codable, Sendable {
    public let kind: String
    public let filingId: String
    public let llcName: String?
    public let ageHours: Int

    public init(kind: String, filingId: String, llcName: String?, ageHours: Int) {
        self.kind = kind
        self.filingId = filingId
        self.llcName = llcName
        self.ageHours = ageHours
    }
}

public struct DashboardSummary: Codable, Sendable {
    public let revenueCents: PeriodComparison
    public let orders: PeriodComparison
    public let filingsByStatus: [FilingStatusCount]
    public let applicationQueue: ApplicationQueue
    public let needsAttention: [AttentionItem]

    public init(
        revenueCents: PeriodComparison,
        orders: PeriodComparison,
        filingsByStatus: [FilingStatusCount],
        applicationQueue: ApplicationQueue,
        needsAttention: [AttentionItem]
    ) {
        self.revenueCents = revenueCents
        self.orders = orders
        self.filingsByStatus = filingsByStatus
        self.applicationQueue = applicationQueue
        self.needsAttention = needsAttention
    }
}

public struct FilingSummary: Codable, Sendable, Identifiable {
    public let id: String
    public let llcName: String
    public let status: String
    public let taxYears: [Int]
    public let amountPaid: Int
    public let updatedAt: Date
    public let customerEmail: String?

    public init(
        id: String,
        llcName: String,
        status: String,
        taxYears: [Int],
        amountPaid: Int,
        updatedAt: Date,
        customerEmail: String?
    ) {
        self.id = id
        self.llcName = llcName
        self.status = status
        self.taxYears = taxYears
        self.amountPaid = amountPaid
        self.updatedAt = updatedAt
        self.customerEmail = customerEmail
    }
}
