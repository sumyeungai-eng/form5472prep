import SwiftUI

@MainActor
public struct FilingsView: View {
    @StateObject private var viewModel: FilingsViewModel
    private let client: APIClient
    private let authManager: AuthManager

    private let statuses = [
        "", "DRAFT", "PAID", "PDF_GENERATED", "SIGNATURE_PENDING",
        "SIGNED_UPLOADED", "CONFIRMED", "FAXED", "FAILED",
    ]

    public init(client: APIClient, authManager: AuthManager) {
        self.client = client
        self.authManager = authManager
        _viewModel = StateObject(
            wrappedValue: FilingsViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        VStack(spacing: 0) {
            filterBar
            content
        }
        .navigationTitle("Filings")
        .searchable(text: $viewModel.searchQuery, prompt: "LLC or customer")
        .onSubmit(of: .search) {
            Task { await viewModel.load() }
        }
        .onChange(of: viewModel.status) { _ in
            Task { await viewModel.load() }
        }
        .task {
            if !viewModel.hasLoaded {
                await viewModel.load()
            }
        }
    }

    private var filterBar: some View {
        HStack {
            Label("Status", systemImage: "line.3.horizontal.decrease.circle")
                .font(.subheadline.weight(.semibold))
            Spacer()
            Picker("Status", selection: $viewModel.status) {
                ForEach(statuses, id: \.self) { status in
                    Text(status.isEmpty ? "All statuses" : status.replacingOccurrences(of: "_", with: " "))
                        .tag(status)
                }
            }
            .pickerStyle(.menu)
        }
        .padding(.horizontal)
        .frame(minHeight: 48)
        .background(.bar)
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading, viewModel.items.isEmpty {
            LoadingStateView(title: "Loading filings…")
        } else if let errorMessage = viewModel.errorMessage, viewModel.items.isEmpty {
            ErrorStateView(message: errorMessage) {
                Task { await viewModel.load() }
            }
        } else if viewModel.hasLoaded, viewModel.items.isEmpty {
            EmptyStateView(
                title: "No Filings",
                message: "Try another search or status filter.",
                systemImage: "doc.text.magnifyingglass"
            )
        } else {
            List(viewModel.items) { filing in
                NavigationLink {
                    FilingDetailView(
                        filingID: filing.id,
                        client: client,
                        authManager: authManager
                    )
                } label: {
                    FilingRow(filing: filing)
                }
                .task {
                    await viewModel.loadMoreIfNeeded(currentID: filing.id)
                }
            }
            .listStyle(.plain)
            .refreshable { await viewModel.load() }
            .overlay(alignment: .bottom) {
                if viewModel.isLoadingMore {
                    ProgressView()
                        .padding(10)
                        .background(.regularMaterial, in: Capsule())
                        .padding()
                }
            }
        }
    }
}

private struct FilingRow: View {
    let filing: FilingSummary

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text(filing.llcName)
                    .font(.headline)
                    .lineLimit(2)
                Spacer(minLength: 8)
                Text(AdminFormatting.usd(cents: filing.amountPaid))
                    .font(.subheadline.weight(.semibold))
                    .adminTabularNumbers()
            }
            HStack(spacing: 10) {
                StatusBadge(status: filing.status)
                if !filing.taxYears.isEmpty {
                    Label(
                        filing.taxYears.map(String.init).joined(separator: ", "),
                        systemImage: "calendar"
                    )
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.vertical, 5)
    }
}

@MainActor
public struct FilingDetailView: View {
    @StateObject private var viewModel: FilingDetailViewModel

    public init(filingID: String, client: APIClient, authManager: AuthManager) {
        _viewModel = StateObject(
            wrappedValue: FilingDetailViewModel(
                filingID: filingID,
                client: client,
                authManager: authManager
            )
        )
    }

    public var body: some View {
        Group {
            if viewModel.isLoading, viewModel.detail == nil {
                LoadingStateView(title: "Loading filing…")
            } else if let errorMessage = viewModel.errorMessage, viewModel.detail == nil {
                ErrorStateView(message: errorMessage) {
                    Task { await viewModel.load() }
                }
            } else if let detail = viewModel.detail {
                detailContent(detail)
            } else if viewModel.hasLoaded {
                EmptyStateView(
                    title: "No Filing Detail",
                    message: "This filing has no detail to display.",
                    systemImage: "doc.text"
                )
            } else {
                LoadingStateView(title: "Loading filing…")
            }
        }
        .navigationTitle(viewModel.detail?.filing.llcName ?? "Filing")
        .task {
            if !viewModel.hasLoaded {
                await viewModel.load()
            }
        }
    }

    private func detailContent(_ detail: FilingDetail) -> some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                filingHeader(detail.filing)
                entitySection(detail.filing)
                ownerSection(detail.filing)
                yearDataSection(detail.filing.yearData)
                messagesSection(detail.messages)
                changeLogSection(detail.changeLog)
            }
            .padding()
        }
        .background(Color.secondary.opacity(0.06))
        .refreshable { await viewModel.load() }
    }

    private func filingHeader(_ filing: FilingRecord) -> some View {
        AdminCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(filing.llcName ?? "Unknown LLC")
                            .font(.title2.weight(.bold))
                        Text(filing.tier)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    StatusBadge(status: filing.status)
                }
                Divider()
                DetailInfoRow(label: "Amount paid", value: AdminFormatting.usd(cents: filing.amountPaid))
                DetailInfoRow(label: "Tax years", value: filing.taxYears.map(String.init).joined(separator: ", "))
                DetailInfoRow(label: "DIIRSP", value: filing.isDiirsp ? "Yes" : "No")
                DetailInfoRow(label: "Fax service", value: filing.faxService ? "Yes" : "No")
                DetailInfoRow(label: "Fax status", value: filing.faxStatus)
                DetailInfoRow(label: "Validation", value: filing.validationStatus)
                DetailInfoRow(label: "Created", value: formatted(filing.createdAt))
                DetailInfoRow(label: "Updated", value: formatted(filing.updatedAt))
            }
        }
    }

    private func entitySection(_ filing: FilingRecord) -> some View {
        detailCard(title: "Entity", icon: "building.2") {
            DetailInfoRow(label: "Legal name", value: filing.llcName)
            DetailInfoRow(label: "EIN", value: filing.llcEin)
            DetailInfoRow(label: "Address", value: entityAddress(filing))
            DetailInfoRow(label: "Incorporated", value: filing.llcDateIncorporated.map { formatted($0, dateOnly: true) })
            DetailInfoRow(label: "Business activity", value: filing.llcBusinessActivity)
            DetailInfoRow(label: "Business code", value: filing.llcBusinessCode)
            DetailInfoRow(label: "Customer", value: filing.user?.email)
            DetailInfoRow(label: "Partner ID", value: filing.partnerId)
        }
    }

    private func ownerSection(_ filing: FilingRecord) -> some View {
        detailCard(title: "Owner", icon: "person.crop.circle") {
            DetailInfoRow(label: "Name", value: filing.ownerName)
            DetailInfoRow(label: "Address", value: filing.ownerAddress)
            DetailInfoRow(label: "Citizenship", value: filing.ownerCountryCitizenship)
            DetailInfoRow(label: "Tax residence", value: filing.ownerCountryTaxResidence)
            DetailInfoRow(label: "Business country", value: filing.ownerCountryBusiness)
            DetailInfoRow(label: "FTIN", value: filing.ownerFtin)
            DetailInfoRow(label: "ITIN", value: filing.ownerItin)
            DetailInfoRow(label: "Reference ID", value: filing.ownerReferenceId)
            if let narrative = filing.reasonableCauseNarrative, !narrative.isEmpty {
                Divider()
                Text("Reasonable cause narrative")
                    .font(.subheadline.weight(.semibold))
                Text(narrative)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func yearDataSection(_ years: [FilingYearData]) -> some View {
        detailCard(title: "Year data", icon: "calendar.badge.clock") {
            if years.isEmpty {
                Text("No year data")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(years.enumerated()), id: \.element.id) { index, year in
                    if index > 0 { Divider() }
                    Text(String(year.taxYear))
                        .font(.headline)
                    DetailInfoRow(
                        label: "Total assets, year end",
                        value: AdminFormatting.usd(decimalString: year.totalAssetsYearEnd)
                    )
                    DetailInfoRow(
                        label: "Contributions",
                        value: AdminFormatting.usd(decimalString: year.contributions)
                    )
                    DetailInfoRow(
                        label: "Distributions",
                        value: AdminFormatting.usd(decimalString: year.distributions)
                    )
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Reportable transactions")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Text(year.reportableTransactions.displayString)
                            .font(.callout.monospaced())
                            .textSelection(.enabled)
                    }
                    if let note = year.otherTransactionsNote, !note.isEmpty {
                        DetailInfoRow(label: "Other transactions", value: note)
                    }
                }
            }
        }
    }

    private func messagesSection(_ messages: [FilingMessage]) -> some View {
        detailCard(title: "Messages", icon: "bubble.left.and.bubble.right") {
            if messages.isEmpty {
                Text("No messages")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(messages.enumerated()), id: \.element.id) { index, message in
                    if index > 0 { Divider() }
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text(message.fromAdmin ? "Admin" : "Customer")
                                .font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(formatted(message.createdAt))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Text(message.body)
                    }
                }
            }
        }
    }

    private func changeLogSection(_ changes: [FilingChange]) -> some View {
        detailCard(title: "Recent changes", icon: "clock.arrow.circlepath") {
            if changes.isEmpty {
                Text("No changes recorded")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(changes.enumerated()), id: \.element.id) { index, change in
                    if index > 0 { Divider() }
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(change.field.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(formatted(change.changedAt))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Text("Source: \(change.source)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        if let reason = change.reason, !reason.isEmpty {
                            Text(reason)
                        }
                        if let before = change.beforeJson {
                            Text("Before: \(before.displayString)")
                                .font(.caption.monospaced())
                                .foregroundStyle(.secondary)
                        }
                        if let after = change.afterJson {
                            Text("After: \(after.displayString)")
                                .font(.caption.monospaced())
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    private func detailCard<Content: View>(
        title: String,
        icon: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        AdminCard {
            VStack(alignment: .leading, spacing: 10) {
                Label(title, systemImage: icon)
                    .font(.title3.weight(.semibold))
                Divider()
                content()
            }
        }
    }

    private func entityAddress(_ filing: FilingRecord) -> String? {
        let locality = [filing.llcCity, filing.llcState, filing.llcZip]
            .compactMap { $0 }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        let parts = [filing.llcAddress, locality.isEmpty ? nil : locality, filing.llcCountry]
            .compactMap { $0 }
            .filter { !$0.isEmpty }
        return parts.isEmpty ? nil : parts.joined(separator: "\n")
    }

    private func formatted(_ date: Date, dateOnly: Bool = false) -> String {
        if dateOnly {
            return date.formatted(date: .abbreviated, time: .omitted)
        }
        return date.formatted(date: .abbreviated, time: .shortened)
    }
}

private struct DetailInfoRow: View {
    let label: String
    let value: String?

    init(label: String, value: String?) {
        self.label = label
        self.value = value
    }

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 16) {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer(minLength: 10)
            Text(value.flatMap { $0.isEmpty ? nil : $0 } ?? "—")
                .multilineTextAlignment(.trailing)
                .textSelection(.enabled)
                .adminTabularNumbers()
        }
        .font(.subheadline)
    }
}
