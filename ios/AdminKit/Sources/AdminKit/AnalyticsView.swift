import Charts
import SwiftUI

@MainActor
public struct AnalyticsView: View {
    @StateObject private var viewModel: AnalyticsViewModel

    private let ranges = ["7d", "30d", "90d", "12m"]
    private let buckets = ["day", "week", "month"]

    public init(client: APIClient, authManager: AuthManager) {
        _viewModel = StateObject(
            wrappedValue: AnalyticsViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                AdminScreenHeader("Analytics", eyebrow: "REPORTING")
                controls
                content
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
        }
        .background(AdminTheme.screenBackground)
        .navigationTitle("")
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
        .refreshable { await viewModel.load() }
        .task {
            if viewModel.bundle == nil {
                await viewModel.load()
            }
        }
        .onChange(of: viewModel.range) { _ in
            Task { await viewModel.load() }
        }
        .onChange(of: viewModel.bucket) { _ in
            Task { await viewModel.load() }
        }
    }

    private var controls: some View {
        VStack(alignment: .leading, spacing: 12) {
            AdminEyebrow("Reporting period")
            Picker("Range", selection: $viewModel.range) {
                ForEach(ranges, id: \.self) { range in
                    Text(range.uppercased()).tag(range)
                }
            }
            .pickerStyle(.segmented)

            AdminEyebrow("Bucket", color: AdminTheme.secondaryText)
            Picker("Bucket", selection: $viewModel.bucket) {
                ForEach(buckets, id: \.self) { bucket in
                    Text(bucket.capitalized).tag(bucket)
                }
            }
            .pickerStyle(.segmented)
        }
        .card()
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading, viewModel.bundle == nil {
            LoadingStateView(title: "Loading analytics…")
                .frame(minHeight: 360)
        } else if let errorMessage = viewModel.errorMessage, viewModel.bundle == nil {
            ErrorStateView(message: errorMessage) {
                Task { await viewModel.load() }
            }
            .frame(minHeight: 360)
        } else if let bundle = viewModel.bundle {
            if bundle.revenueSeries.isEmpty
                && bundle.sourceAttribution.isEmpty
                && bundle.partnerPerformance.isEmpty {
                EmptyStateView(
                    title: "No Analytics",
                    message: "There is no reporting data for this period.",
                    systemImage: "chart.xyaxis.line"
                )
                .frame(minHeight: 360)
            } else {
                analyticsContent(bundle)
            }
        } else {
            EmptyStateView(
                title: "No Analytics Data",
                message: "Pull to refresh or try again.",
                systemImage: "chart.xyaxis.line"
            )
            .frame(minHeight: 360)
        }
    }

    private func analyticsContent(_ bundle: AnalyticsBundle) -> some View {
        VStack(spacing: 18) {
            VStack(alignment: .leading, spacing: 14) {
                chartTitle("Revenue over time", icon: "chart.bar.xaxis")
                if bundle.revenueSeries.isEmpty {
                    Text("No revenue data")
                        .foregroundStyle(AdminTheme.secondaryText)
                } else {
                    Chart(bundle.revenueSeries) { point in
                        BarMark(
                            x: .value("Date", point.date),
                            y: .value("Revenue cents", point.revenueCents)
                        )
                        .foregroundStyle(AdminTheme.accent.gradient)
                        .cornerRadius(3)
                        .accessibilityLabel(point.date)
                        .accessibilityValue(
                            "\(AdminFormatting.usd(cents: point.revenueCents)), \(point.orders) orders"
                        )
                    }
                    .chartYAxis {
                        AxisMarks(position: .leading) { value in
                            AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                                .foregroundStyle(AdminTheme.accentTint)
                            AxisTick()
                                .foregroundStyle(AdminTheme.cardBorder)
                            AxisValueLabel {
                                if let cents = value.as(Int.self) {
                                    Text(AdminFormatting.usd(cents: cents))
                                        .font(.caption2)
                                        .fontDesign(.monospaced)
                                        .foregroundStyle(AdminTheme.secondaryText)
                                }
                            }
                        }
                    }
                    .chartXAxis {
                        AxisMarks(values: .automatic(desiredCount: 5)) { value in
                            AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                                .foregroundStyle(AdminTheme.accentTint.opacity(0.58))
                            AxisTick()
                                .foregroundStyle(AdminTheme.cardBorder)
                            AxisValueLabel(collisionResolution: .greedy) {
                                if let label = value.as(String.self) {
                                    Text(label)
                                        .font(.caption2)
                                        .fontDesign(.monospaced)
                                        .foregroundStyle(AdminTheme.secondaryText)
                                }
                            }
                        }
                    }
                    .frame(minHeight: 240)
                }
            }
            .card()

            VStack(alignment: .leading, spacing: 12) {
                chartTitle("Source attribution", icon: "arrow.triangle.branch")
                if bundle.sourceAttribution.isEmpty {
                    Text("No source attribution data")
                        .foregroundStyle(AdminTheme.secondaryText)
                } else {
                    ForEach(Array(bundle.sourceAttribution.enumerated()), id: \.element.id) { index, row in
                        if index > 0 {
                            Divider()
                                .overlay(AdminTheme.cardBorder)
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(alignment: .firstTextBaseline) {
                                Text(sourceName(row.source))
                                    .font(.headline)
                                Spacer()
                                Text(AdminFormatting.usd(cents: row.revenueCents))
                                    .font(.subheadline.weight(.semibold))
                                    .fontDesign(.monospaced)
                                    .adminTabularNumbers()
                            }
                            HStack {
                                Text("\(row.paid) / \(row.started) paid")
                                Spacer()
                                Text(
                                    row.conversionRate.formatted(
                                        .percent.precision(.fractionLength(1))
                                    )
                                )
                            }
                            .font(.caption)
                            .fontDesign(.monospaced)
                            .foregroundStyle(AdminTheme.secondaryText)
                            .adminTabularNumbers()
                            Text("\(row.confirmed) confirmed")
                                .font(.caption)
                                .fontDesign(.monospaced)
                                .foregroundStyle(AdminTheme.secondaryText)
                                .adminTabularNumbers()
                        }
                        .padding(.vertical, 3)
                    }
                }
            }
            .card()

            VStack(alignment: .leading, spacing: 12) {
                chartTitle("Partner performance", icon: "person.2")
                if bundle.partnerPerformance.isEmpty {
                    Text("No partner performance data")
                        .foregroundStyle(AdminTheme.secondaryText)
                } else {
                    ForEach(Array(bundle.partnerPerformance.enumerated()), id: \.element.id) { index, partner in
                        if index > 0 {
                            Divider()
                                .overlay(AdminTheme.cardBorder)
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(alignment: .firstTextBaseline) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(partner.name ?? partner.email)
                                        .font(.headline)
                                    if partner.name != nil {
                                        Text(partner.email)
                                            .font(.caption)
                                            .foregroundStyle(AdminTheme.secondaryText)
                                    }
                                }
                                Spacer()
                                Text(AdminFormatting.usd(cents: partner.revenueCents))
                                    .font(.subheadline.weight(.semibold))
                                    .fontDesign(.monospaced)
                                    .adminTabularNumbers()
                            }
                            Text("\(partner.paidFilings) paid of \(partner.filings) filings")
                                .font(.caption)
                                .fontDesign(.monospaced)
                                .foregroundStyle(AdminTheme.secondaryText)
                                .adminTabularNumbers()
                        }
                        .padding(.vertical, 3)
                    }
                }
            }
            .card()
        }
    }

    private func chartTitle(_ title: String, icon: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(AdminTheme.accent)
            AdminEyebrow(title)
        }
    }

    private func sourceName(_ source: String) -> String {
        source.replacingOccurrences(of: "_", with: " ").capitalized
    }
}
