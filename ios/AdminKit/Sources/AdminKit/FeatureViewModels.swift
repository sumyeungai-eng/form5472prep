import Combine
import Foundation

@MainActor
public final class DashboardViewModel: ObservableObject {
    @Published public var range = "30d"
    @Published public private(set) var summary: DashboardSummary?
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let client: APIClient
    private let authManager: AuthManager

    public init(client: APIClient, authManager: AuthManager) {
        self.client = client
        self.authManager = authManager
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        let requestedRange = range
        defer { isLoading = false }
        do {
            let response = try await client.dashboard(range: requestedRange)
            guard requestedRange == range else { return }
            summary = response
        } catch APIError.unauthorized {
            await authManager.signOut()
        } catch {
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }
}

@MainActor
public final class FilingsViewModel: ObservableObject {
    @Published public var searchQuery = ""
    @Published public var status = ""
    @Published public private(set) var items: [FilingSummary] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var isLoadingMore = false
    @Published public private(set) var hasLoaded = false
    @Published public private(set) var errorMessage: String?

    private let client: APIClient
    private let authManager: AuthManager
    private var pagination = CursorPagination<FilingSummary>()
    private let pageSize = 25

    public init(client: APIClient, authManager: AuthManager) {
        self.client = client
        self.authManager = authManager
    }

    public var hasMorePages: Bool { pagination.hasMorePages }

    public func load(reset: Bool = true) async {
        if reset {
            isLoading = true
            errorMessage = nil
        } else {
            guard pagination.shouldRequestNextPage(isLoading: isLoadingMore) else { return }
            isLoadingMore = true
        }
        defer {
            isLoading = false
            isLoadingMore = false
            hasLoaded = true
        }

        do {
            let page = try await client.filings(
                status: status,
                query: searchQuery.trimmingCharacters(in: .whitespacesAndNewlines),
                cursor: reset ? nil : pagination.nextCursor,
                limit: pageSize
            )
            if reset {
                pagination.replace(with: page.items, nextCursor: page.nextCursor)
            } else {
                pagination.append(page.items, nextCursor: page.nextCursor)
            }
            items = pagination.items
            errorMessage = nil
        } catch APIError.unauthorized {
            await authManager.signOut()
        } catch {
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }

    public func loadMoreIfNeeded(currentID: String) async {
        guard items.suffix(5).contains(where: { $0.id == currentID }) else { return }
        await load(reset: false)
    }

    public func dismissError() {
        errorMessage = nil
    }
}

@MainActor
public final class FilingDetailViewModel: ObservableObject {
    @Published public private(set) var detail: FilingDetail?
    @Published public private(set) var isLoading = false
    @Published public private(set) var hasLoaded = false
    @Published public private(set) var errorMessage: String?

    private let filingID: String
    private let client: APIClient
    private let authManager: AuthManager

    public init(filingID: String, client: APIClient, authManager: AuthManager) {
        self.filingID = filingID
        self.client = client
        self.authManager = authManager
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        defer {
            isLoading = false
            hasLoaded = true
        }
        do {
            detail = try await client.filingDetail(id: filingID)
        } catch APIError.unauthorized {
            await authManager.signOut()
        } catch {
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }
}

@MainActor
public final class ApplicationsViewModel: ObservableObject {
    @Published public var type = "ein"
    @Published public var status = ""
    @Published public private(set) var items: [ApplicationSummary] = []
    @Published public private(set) var isLoading = false
    @Published public private(set) var isLoadingMore = false
    @Published public private(set) var hasLoaded = false
    @Published public private(set) var errorMessage: String?

    private let client: APIClient
    private let authManager: AuthManager
    private var pagination = CursorPagination<ApplicationSummary>()
    private let pageSize = 25

    public init(client: APIClient, authManager: AuthManager) {
        self.client = client
        self.authManager = authManager
    }

    public var hasMorePages: Bool { pagination.hasMorePages }

    public func load(reset: Bool = true) async {
        if reset {
            isLoading = true
            errorMessage = nil
        } else {
            guard pagination.shouldRequestNextPage(isLoading: isLoadingMore) else { return }
            isLoadingMore = true
        }
        defer {
            isLoading = false
            isLoadingMore = false
            hasLoaded = true
        }

        do {
            let page = try await client.applications(
                type: type,
                status: status,
                cursor: reset ? nil : pagination.nextCursor,
                limit: pageSize
            )
            if reset {
                pagination.replace(with: page.items, nextCursor: page.nextCursor)
            } else {
                pagination.append(page.items, nextCursor: page.nextCursor)
            }
            items = pagination.items
            errorMessage = nil
        } catch APIError.unauthorized {
            await authManager.signOut()
        } catch {
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }

    public func loadMoreIfNeeded(currentID: String) async {
        guard items.suffix(5).contains(where: { $0.id == currentID }) else { return }
        await load(reset: false)
    }

    public func dismissError() {
        errorMessage = nil
    }
}

@MainActor
public final class AnalyticsViewModel: ObservableObject {
    @Published public var range = "30d"
    @Published public var bucket = "day"
    @Published public private(set) var bundle: AnalyticsBundle?
    @Published public private(set) var isLoading = false
    @Published public private(set) var errorMessage: String?

    private let client: APIClient
    private let authManager: AuthManager

    public init(client: APIClient, authManager: AuthManager) {
        self.client = client
        self.authManager = authManager
    }

    public func load() async {
        isLoading = true
        errorMessage = nil
        let requestedRange = range
        let requestedBucket = bucket
        defer { isLoading = false }
        do {
            let response = try await client.analytics(
                range: requestedRange,
                bucket: requestedBucket
            )
            guard requestedRange == range, requestedBucket == bucket else { return }
            bundle = response
        } catch APIError.unauthorized {
            await authManager.signOut()
        } catch {
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }
}
