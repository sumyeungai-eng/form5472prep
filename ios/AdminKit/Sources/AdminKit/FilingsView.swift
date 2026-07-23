import SwiftUI

@MainActor
public struct FilingsView: View {
    @StateObject private var viewModel: FilingsViewModel
    @ObservedObject private var authManager: AuthManager
    @State private var isConfirmingSignOut = false
    private let client: APIClient

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
            VStack(alignment: .leading, spacing: 14) {
                AdminScreenHeader("Filings", eyebrow: "WORK QUEUE")
                filterBar
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 12)

            content
        }
        .background(AdminTheme.screenBackground)
        .navigationTitle("")
        .adminInlineNavigationTitle()
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
        .searchable(
            text: $viewModel.searchQuery,
            placement: .toolbar,
            prompt: "LLC or customer"
        )
        .toolbar {
            AdminAccountToolbar(
                email: signedInEmail,
                isConfirmingSignOut: $isConfirmingSignOut
            )
        }
        .confirmationDialog(
            "Sign out of Form 5472 Prep?",
            isPresented: $isConfirmingSignOut,
            titleVisibility: .visible
        ) {
            Button("Sign Out", role: .destructive) {
                Task { await authManager.signOut() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("You will need to sign in again to access admin data.")
        }
        .onSubmit(of: .search) {
            Task { await viewModel.load() }
        }
        .onChange(of: viewModel.searchQuery) { oldQuery, newQuery in
            let oldValue = oldQuery.trimmingCharacters(in: .whitespacesAndNewlines)
            let newValue = newQuery.trimmingCharacters(in: .whitespacesAndNewlines)
            if !oldValue.isEmpty, newValue.isEmpty {
                Task { await viewModel.load() }
            }
        }
        .onChange(of: viewModel.status) { _, _ in
            Task { await viewModel.load() }
        }
        .task {
            if !viewModel.hasLoaded {
                await viewModel.load()
            }
        }
    }

    private var signedInEmail: String? {
        guard case let .signedIn(profile) = authManager.state else { return nil }
        return profile.email
    }

    private var filterBar: some View {
        HStack {
            Label("Status", systemImage: "line.3.horizontal.decrease.circle")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(AdminTheme.secondaryText)
            Spacer()
            Picker("Status", selection: $viewModel.status) {
                ForEach(statuses, id: \.self) { status in
                    Text(status.isEmpty ? "All statuses" : status.replacingOccurrences(of: "_", with: " "))
                        .tag(status)
                }
            }
            .pickerStyle(.menu)
        }
        .padding(.horizontal, 14)
        .frame(minHeight: 48)
        .background(AdminTheme.cardSurface)
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(AdminTheme.cardBorder, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading, viewModel.items.isEmpty {
            LoadingStateView(title: "Loading filings…")
        } else if let errorMessage = viewModel.errorMessage, viewModel.items.isEmpty {
            ScrollView {
                ErrorStateView(message: errorMessage) {
                    Task { await viewModel.load() }
                }
                .frame(maxWidth: .infinity, minHeight: 360)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .refreshable { await viewModel.load() }
        } else if viewModel.hasLoaded, viewModel.items.isEmpty {
            ScrollView {
                EmptyStateView(
                    title: "No Filings",
                    message: "Try another search or status filter.",
                    systemImage: "doc.text.magnifyingglass"
                )
                .frame(maxWidth: .infinity, minHeight: 360)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .refreshable { await viewModel.load() }
        } else {
            VStack(spacing: 0) {
                if let errorMessage = viewModel.errorMessage {
                    AdminInlineErrorBanner(
                        message: errorMessage,
                        onDismiss: viewModel.dismissError
                    )
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                }

                List(viewModel.items) { filing in
                    NavigationLink {
                        FilingDetailView(
                            filingID: filing.id,
                            client: client,
                            authManager: authManager
                        )
                    } label: {
                        FilingRow(filing: filing)
                            .card(padding: 14)
                    }
                    .buttonStyle(.plain)
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .task {
                        await viewModel.loadMoreIfNeeded(currentID: filing.id)
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
                .background(AdminTheme.screenBackground)
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
}

private struct FilingRow: View {
    let filing: FilingSummary
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 5) {
                    filingName
                    amount
                }
            } else {
                HStack(alignment: .firstTextBaseline) {
                    filingName
                    Spacer(minLength: 8)
                    amount
                }
            }

            if let customerEmail = filing.customerEmail, !customerEmail.isEmpty {
                Text(customerEmail)
                    .font(.subheadline)
                    .foregroundStyle(AdminTheme.secondaryText)
                    .lineLimit(1)
            }

            HStack(alignment: .center, spacing: 10) {
                if !filing.taxYears.isEmpty {
                    Label(
                        filing.taxYears.map(String.init).joined(separator: ", "),
                        systemImage: "calendar"
                    )
                    .font(.caption)
                    .fontDesign(.monospaced)
                    .foregroundStyle(AdminTheme.secondaryText)
                }
                Spacer(minLength: 8)
                AdminDesignSystem.StatusBadge(status: filing.status)
            }
        }
    }

    private var filingName: some View {
        Text(filing.llcName)
            .font(.headline)
            .lineLimit(2)
    }

    private var amount: some View {
        Text(AdminFormatting.usd(cents: filing.amountPaid))
            .font(.subheadline.weight(.semibold))
            .fontDesign(.monospaced)
            .layoutPriority(1)
            .fixedSize(horizontal: false, vertical: true)
            .adminTabularNumbers()
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
        .background(AdminTheme.screenBackground)
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
        .refreshable { await viewModel.load() }
    }

    private func filingHeader(_ filing: FilingRecord) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    AdminEyebrow(filing.tier)
                    Text(filing.llcName ?? "Unknown LLC")
                        .font(.title2.weight(.semibold))
                        .fontDesign(.serif)
                }
                Spacer()
                AdminDesignSystem.StatusBadge(status: filing.status)
            }
            Divider()
                .overlay(AdminTheme.cardBorder)
            DetailInfoRow(label: "Amount paid", value: AdminFormatting.usd(cents: filing.amountPaid))
            DetailInfoRow(label: "Tax years", value: filing.taxYears.map(String.init).joined(separator: ", "))
            DetailInfoRow(label: "DIIRSP", value: filing.isDiirsp ? "Yes" : "No")
            DetailInfoRow(label: "Fax service", value: filing.faxService ? "Yes" : "No")
            DetailInfoRow(label: "Fax status", value: filing.faxStatus)
            DetailInfoRow(label: "Validation", value: filing.validationStatus)
            DetailInfoRow(label: "Created", value: formatted(filing.createdAt))
            DetailInfoRow(label: "Updated", value: formatted(filing.updatedAt))
        }
        .card()
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
                    .overlay(AdminTheme.cardBorder)
                Text("Reasonable cause narrative")
                    .font(.subheadline.weight(.semibold))
                Text(narrative)
                    .foregroundStyle(AdminTheme.secondaryText)
            }
        }
    }

    private func yearDataSection(_ years: [FilingYearData]) -> some View {
        detailCard(title: "Year data", icon: "calendar.badge.clock") {
            if years.isEmpty {
                Text("No year data")
                    .foregroundStyle(AdminTheme.secondaryText)
            } else {
                ForEach(Array(years.enumerated()), id: \.element.id) { index, year in
                    if index > 0 {
                        Divider()
                            .overlay(AdminTheme.cardBorder)
                    }
                    Text(String(year.taxYear))
                        .font(.headline)
                        .fontDesign(.monospaced)
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
                            .foregroundStyle(AdminTheme.secondaryText)
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
                    .foregroundStyle(AdminTheme.secondaryText)
            } else {
                ForEach(Array(messages.enumerated()), id: \.element.id) { index, message in
                    if index > 0 {
                        Divider()
                            .overlay(AdminTheme.cardBorder)
                    }
                    VStack(alignment: .leading, spacing: 5) {
                        HStack {
                            Text(message.fromAdmin ? "Admin" : "Customer")
                                .font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(formatted(message.createdAt))
                                .font(.caption)
                                .fontDesign(.monospaced)
                                .foregroundStyle(AdminTheme.secondaryText)
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
                    .foregroundStyle(AdminTheme.secondaryText)
            } else {
                ForEach(Array(changes.enumerated()), id: \.element.id) { index, change in
                    if index > 0 {
                        Divider()
                            .overlay(AdminTheme.cardBorder)
                    }
                    VStack(alignment: .leading, spacing: 5) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(change.field.replacingOccurrences(of: "_", with: " ").capitalized)
                                .font(.subheadline.weight(.semibold))
                            Spacer()
                            Text(formatted(change.changedAt))
                                .font(.caption)
                                .fontDesign(.monospaced)
                                .foregroundStyle(AdminTheme.secondaryText)
                        }
                        Text("Source: \(change.source)")
                            .font(.caption)
                            .fontDesign(.monospaced)
                            .foregroundStyle(AdminTheme.secondaryText)
                        if let reason = change.reason, !reason.isEmpty {
                            Text(reason)
                        }
                        if let before = change.beforeJson {
                            Text("Before: \(before.displayString)")
                                .font(.caption.monospaced())
                                .foregroundStyle(AdminTheme.secondaryText)
                        }
                        if let after = change.afterJson {
                            Text("After: \(after.displayString)")
                                .font(.caption.monospaced())
                                .foregroundStyle(AdminTheme.secondaryText)
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
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundStyle(AdminTheme.accent)
                AdminEyebrow(title)
            }
            Divider()
                .overlay(AdminTheme.cardBorder)
            content()
        }
        .card()
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
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    init(label: String, value: String?) {
        self.label = label
        self.value = value
    }

    var body: some View {
        Group {
            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 4) {
                    labelText
                    valueText
                        .multilineTextAlignment(.leading)
                }
            } else {
                HStack(alignment: .firstTextBaseline, spacing: 16) {
                    labelText
                    Spacer(minLength: 10)
                    valueText
                        .multilineTextAlignment(.trailing)
                }
            }
        }
        .font(.subheadline)
    }

    private var labelText: some View {
        Text(label)
            .foregroundStyle(AdminTheme.secondaryText)
    }

    private var valueText: some View {
        Text(value.flatMap { $0.isEmpty ? nil : $0 } ?? "—")
            .fontDesign(.monospaced)
            .layoutPriority(1)
            .fixedSize(horizontal: false, vertical: true)
            .textSelection(.enabled)
            .adminTabularNumbers()
    }
}
