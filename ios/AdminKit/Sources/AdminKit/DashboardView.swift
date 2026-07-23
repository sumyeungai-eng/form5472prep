import SwiftUI

@MainActor
public struct DashboardView: View {
    @ObservedObject private var authManager: AuthManager
    @StateObject private var viewModel: DashboardViewModel
    @State private var isConfirmingSignOut = false

    private let ranges = ["7d", "30d", "90d", "12m"]

    public init(client: APIClient, authManager: AuthManager) {
        self.authManager = authManager
        _viewModel = StateObject(
            wrappedValue: DashboardViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                AdminScreenHeader("Dashboard", eyebrow: "OPERATIONS") {
                    AdminAccountMenu(
                        email: signedInEmail,
                        isConfirmingSignOut: $isConfirmingSignOut
                    )
                }

                Picker("Period", selection: $viewModel.range) {
                    ForEach(ranges, id: \.self) { range in
                        Text(range.uppercased()).tag(range)
                    }
                }
                .pickerStyle(.segmented)
                .accessibilityLabel("Dashboard period")

                content
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
        }
        .background(AdminTheme.screenBackground)
        .adminHiddenNavigationBar()
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
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
        .refreshable { await viewModel.load() }
        .task {
            if viewModel.summary == nil {
                await viewModel.load()
            }
        }
        .onChange(of: viewModel.range) { _, _ in
            Task { await viewModel.load() }
        }
    }

    private var signedInEmail: String? {
        guard case let .signedIn(profile) = authManager.state else { return nil }
        return profile.email
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading, viewModel.summary == nil {
            LoadingStateView(title: "Loading dashboard…")
                .frame(minHeight: 360)
        } else if let errorMessage = viewModel.errorMessage, viewModel.summary == nil {
            ErrorStateView(message: errorMessage) {
                Task { await viewModel.load() }
            }
            .frame(minHeight: 360)
        } else if let summary = viewModel.summary {
            if isEmpty(summary) {
                EmptyStateView(
                    title: "No Activity",
                    message: "There is no dashboard activity in this period.",
                    systemImage: "chart.bar"
                )
                .frame(minHeight: 360)
            } else {
                summaryContent(summary)
            }
        } else {
            EmptyStateView(
                title: "No Dashboard Data",
                message: "Pull to refresh or try again.",
                systemImage: "chart.bar"
            )
            .frame(minHeight: 360)
        }
    }

    private func summaryContent(_ summary: DashboardSummary) -> some View {
        VStack(spacing: 18) {
            ViewThatFits(in: .horizontal) {
                HStack(alignment: .top, spacing: 12) {
                    metricCard(
                        title: "Revenue",
                        value: AdminFormatting.usd(cents: summary.revenueCents.period),
                        comparison: summary.revenueCents
                    )
                    metricCard(
                        title: "Orders",
                        value: summary.orders.period.formatted(),
                        comparison: summary.orders
                    )
                }

                VStack(spacing: 12) {
                    metricCard(
                        title: "Revenue",
                        value: AdminFormatting.usd(cents: summary.revenueCents.period),
                        comparison: summary.revenueCents
                    )
                    metricCard(
                        title: "Orders",
                        value: summary.orders.period.formatted(),
                        comparison: summary.orders
                    )
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                sectionTitle("Filings by status", icon: "doc.text")
                if summary.filingsByStatus.isEmpty {
                    Text("No filings in this period")
                        .foregroundStyle(AdminTheme.secondaryText)
                } else {
                    ForEach(Array(summary.filingsByStatus.enumerated()), id: \.element.status) { index, item in
                        if index > 0 {
                            Divider()
                                .overlay(AdminTheme.cardBorder)
                        }
                        HStack {
                            AdminDesignSystem.StatusBadge(status: item.status)
                            Spacer()
                            Text(item.count.formatted())
                                .font(.subheadline.weight(.semibold))
                                .fontDesign(.monospaced)
                                .adminTabularNumbers()
                        }
                    }
                }
            }
            .card()

            VStack(alignment: .leading, spacing: 14) {
                sectionTitle("Application queue", icon: "person.text.rectangle")
                applicationQueue(title: "EIN", counts: summary.applicationQueue.ein)
                Divider()
                    .overlay(AdminTheme.cardBorder)
                applicationQueue(title: "ITIN", counts: summary.applicationQueue.itin)
            }
            .card()

            VStack(alignment: .leading, spacing: 12) {
                sectionTitle("Needs attention", icon: "exclamationmark.circle")
                if summary.needsAttention.isEmpty {
                    Label("Nothing needs attention", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(AdminTheme.success)
                } else {
                    ForEach(Array(summary.needsAttention.enumerated()), id: \.element.filingId) { index, item in
                        if index > 0 {
                            Divider()
                                .overlay(AdminTheme.cardBorder)
                        }
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: attentionIcon(item.kind))
                                .font(.body.weight(.semibold))
                                .foregroundStyle(attentionColor(item.kind))
                                .frame(width: 32, height: 32)
                                .background(
                                    attentionColor(item.kind).opacity(0.12),
                                    in: RoundedRectangle(cornerRadius: 8, style: .continuous)
                                )
                                .accessibilityHidden(true)

                            VStack(alignment: .leading, spacing: 5) {
                                HStack(alignment: .firstTextBaseline, spacing: 10) {
                                    Text(attentionLabel(item.kind))
                                        .font(.headline)
                                    Spacer(minLength: 8)
                                    Text(AdminFormatting.age(hours: item.ageHours))
                                        .font(.caption)
                                        .fontDesign(.monospaced)
                                        .foregroundStyle(AdminTheme.secondaryText)
                                        .adminTabularNumbers()
                                }
                                Text(
                                    item.llcName.flatMap { $0.isEmpty ? nil : $0 }
                                        ?? "Untitled filing"
                                )
                                    .font(.subheadline)
                                    .foregroundStyle(AdminTheme.secondaryText)
                            }
                        }
                    }
                }
            }
            .card()
        }
    }

    private func metricCard(
        title: String,
        value: String,
        comparison: PeriodComparison
    ) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            AdminEyebrow(title)
            Text(value)
                .font(title == "Revenue" ? .largeTitle.weight(.semibold) : .title.weight(.semibold))
                .fontDesign(.serif)
                .minimumScaleFactor(0.68)
                .lineLimit(1)
                .adminTabularNumbers()
                .accessibilityLabel("\(title): \(value)")
            Label(
                comparison.changePct.formatted(
                    .percent
                        .scale(1)
                        .precision(.fractionLength(1))
                )
                .replacingOccurrences(of: "-", with: ""),
                systemImage: comparison.changePct >= 0
                    ? "arrowtriangle.up.fill"
                    : "arrowtriangle.down.fill"
            )
            .font(.caption2.weight(.semibold))
            .fontDesign(.monospaced)
            .foregroundStyle(
                comparison.changePct >= 0 ? AdminTheme.success : AdminTheme.danger
            )
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(
                (comparison.changePct >= 0 ? AdminTheme.success : AdminTheme.danger)
                    .opacity(0.12),
                in: Capsule()
            )
            .adminTabularNumbers()
            Text(
                "Previous: \(title == "Revenue" ? AdminFormatting.usd(cents: comparison.previousPeriod) : comparison.previousPeriod.formatted())"
            )
            .font(.caption2)
            .fontDesign(.monospaced)
            .foregroundStyle(AdminTheme.secondaryText)
            .lineLimit(1)
            .adminTabularNumbers()
        }
        .card()
    }

    private func applicationQueue(title: String, counts: [String: Int]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .fontDesign(.monospaced)
            if counts.isEmpty {
                Text("No queued applications")
                    .foregroundStyle(AdminTheme.secondaryText)
            } else {
                ForEach(counts.keys.sorted(), id: \.self) { status in
                    HStack {
                        AdminDesignSystem.StatusBadge(status: status)
                        Spacer()
                        Text(counts[status, default: 0].formatted())
                            .font(.subheadline.weight(.semibold))
                            .fontDesign(.monospaced)
                            .adminTabularNumbers()
                    }
                }
            }
        }
    }

    private func sectionTitle(_ title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(AdminTheme.accent)
            AdminEyebrow(title)
        }
    }

    private func attentionLabel(_ kind: String) -> String {
        switch kind {
        case "fax_failed": "Fax failed"
        case "signature_pending": "Signature pending"
        case "validation_failed": "Validation failed"
        case "stale_paid": "Paid filing is stale"
        default: kind.replacingOccurrences(of: "_", with: " ").capitalized
        }
    }

    private func attentionIcon(_ kind: String) -> String {
        switch kind {
        case "fax_failed": "exclamationmark.triangle.fill"
        case "signature_pending": "signature"
        case "validation_failed": "checkmark.shield"
        case "stale_paid": "clock"
        default: "exclamationmark.circle"
        }
    }

    private func attentionColor(_ kind: String) -> Color {
        switch kind {
        case "fax_failed", "validation_failed": AdminTheme.danger
        case "signature_pending", "stale_paid": AdminTheme.warning
        default: AdminTheme.accent
        }
    }

    private func isEmpty(_ summary: DashboardSummary) -> Bool {
        summary.revenueCents.period == 0
            && summary.orders.period == 0
            && summary.filingsByStatus.isEmpty
            && summary.applicationQueue.ein.values.reduce(0, +) == 0
            && summary.applicationQueue.itin.values.reduce(0, +) == 0
            && summary.needsAttention.isEmpty
    }
}
