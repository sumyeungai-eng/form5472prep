import SwiftUI

@MainActor
public struct DashboardView: View {
    @ObservedObject private var authManager: AuthManager
    @StateObject private var viewModel: DashboardViewModel

    private let ranges = ["7d", "30d", "90d", "12m"]

    public init(client: APIClient, authManager: AuthManager) {
        self.authManager = authManager
        _viewModel = StateObject(
            wrappedValue: DashboardViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Picker("Period", selection: $viewModel.range) {
                    ForEach(ranges, id: \.self) { range in
                        Text(range.uppercased()).tag(range)
                    }
                }
                .pickerStyle(.segmented)
                .accessibilityLabel("Dashboard period")

                content
            }
            .padding()
        }
        .background(Color.secondary.opacity(0.06))
        .navigationTitle("Dashboard")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Sign Out", role: .destructive) {
                    Task { await authManager.signOut() }
                }
                .buttonStyle(.bordered)
                .accessibilityHint("Returns to the sign-in screen")
            }
        }
        .refreshable { await viewModel.load() }
        .task {
            if viewModel.summary == nil {
                await viewModel.load()
            }
        }
        .onChange(of: viewModel.range) { _ in
            Task { await viewModel.load() }
        }
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
        VStack(spacing: 16) {
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

            AdminCard {
                VStack(alignment: .leading, spacing: 12) {
                    sectionTitle("Filings by status", icon: "doc.text")
                    if summary.filingsByStatus.isEmpty {
                        Text("No filings in this period")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(summary.filingsByStatus, id: \.status) { item in
                            HStack {
                                StatusBadge(status: item.status)
                                Spacer()
                                Text(item.count.formatted())
                                    .fontWeight(.semibold)
                                    .adminTabularNumbers()
                            }
                        }
                    }
                }
            }

            AdminCard {
                VStack(alignment: .leading, spacing: 14) {
                    sectionTitle("Application queue", icon: "person.text.rectangle")
                    applicationQueue(title: "EIN", counts: summary.applicationQueue.ein)
                    Divider()
                    applicationQueue(title: "ITIN", counts: summary.applicationQueue.itin)
                }
            }

            AdminCard {
                VStack(alignment: .leading, spacing: 12) {
                    sectionTitle("Needs attention", icon: "exclamationmark.circle")
                    if summary.needsAttention.isEmpty {
                        Label("Nothing needs attention", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    } else {
                        ForEach(summary.needsAttention, id: \.filingId) { item in
                            VStack(alignment: .leading, spacing: 5) {
                                HStack(alignment: .firstTextBaseline) {
                                    Text(attentionLabel(item.kind))
                                        .font(.headline)
                                    Spacer()
                                    Text(AdminFormatting.age(hours: item.ageHours))
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .adminTabularNumbers()
                                }
                                Text(item.llcName ?? "Unknown LLC")
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
        }
    }

    private func metricCard(
        title: String,
        value: String,
        comparison: PeriodComparison
    ) -> some View {
        AdminCard {
            VStack(alignment: .leading, spacing: 7) {
                Text(title)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(value)
                    .font(.title2.weight(.bold))
                    .minimumScaleFactor(0.75)
                    .lineLimit(1)
                    .adminTabularNumbers()
                Label(
                    comparison.changePct.formatted(
                        .percent
                            .scale(1)
                            .precision(.fractionLength(1))
                    ),
                    systemImage: comparison.changePct >= 0
                        ? "arrow.up.right"
                        : "arrow.down.right"
                )
                .font(.caption.weight(.semibold))
                .foregroundStyle(comparison.changePct >= 0 ? .green : .red)
                .adminTabularNumbers()
                Text("Previous: \(title == "Revenue" ? AdminFormatting.usd(cents: comparison.previousPeriod) : comparison.previousPeriod.formatted())")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .adminTabularNumbers()
            }
        }
    }

    private func applicationQueue(title: String, counts: [String: Int]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
            if counts.isEmpty {
                Text("No queued applications")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(counts.keys.sorted(), id: \.self) { status in
                    HStack {
                        StatusBadge(status: status, application: true)
                        Spacer()
                        Text(counts[status, default: 0].formatted())
                            .fontWeight(.semibold)
                            .adminTabularNumbers()
                    }
                }
            }
        }
    }

    private func sectionTitle(_ title: String, icon: String) -> some View {
        Label(title, systemImage: icon)
            .font(.title3.weight(.semibold))
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

    private func isEmpty(_ summary: DashboardSummary) -> Bool {
        summary.revenueCents.period == 0
            && summary.orders.period == 0
            && summary.filingsByStatus.isEmpty
            && summary.applicationQueue.ein.values.reduce(0, +) == 0
            && summary.applicationQueue.itin.values.reduce(0, +) == 0
            && summary.needsAttention.isEmpty
    }
}
