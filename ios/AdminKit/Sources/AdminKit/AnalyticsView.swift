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
            VStack(spacing: 16) {
                controls
                content
            }
            .padding()
        }
        .background(Color.secondary.opacity(0.06))
        .navigationTitle("Analytics")
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
        AdminCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("Reporting period")
                    .font(.headline)
                Picker("Range", selection: $viewModel.range) {
                    ForEach(ranges, id: \.self) { range in
                        Text(range.uppercased()).tag(range)
                    }
                }
                .pickerStyle(.segmented)

                Text("Bucket")
                    .font(.headline)
                Picker("Bucket", selection: $viewModel.bucket) {
                    ForEach(buckets, id: \.self) { bucket in
                        Text(bucket.capitalized).tag(bucket)
                    }
                }
                .pickerStyle(.segmented)
            }
        }
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
        VStack(spacing: 16) {
            AdminCard {
                VStack(alignment: .leading, spacing: 14) {
                    Label("Revenue over time", systemImage: "chart.bar.xaxis")
                        .font(.title3.weight(.semibold))
                    if bundle.revenueSeries.isEmpty {
                        Text("No revenue data")
                            .foregroundStyle(.secondary)
                    } else {
                        Chart(bundle.revenueSeries) { point in
                            BarMark(
                                x: .value("Date", point.date),
                                y: .value("Revenue cents", point.revenueCents)
                            )
                            .foregroundStyle(.blue.gradient)
                            .cornerRadius(3)
                            .accessibilityLabel(point.date)
                            .accessibilityValue(
                                "\(AdminFormatting.usd(cents: point.revenueCents)), \(point.orders) orders"
                            )
                        }
                        .chartYAxis {
                            AxisMarks(position: .leading) { value in
                                AxisGridLine()
                                AxisTick()
                                AxisValueLabel {
                                    if let cents = value.as(Int.self) {
                                        Text(AdminFormatting.usd(cents: cents))
                                    }
                                }
                            }
                        }
                        .chartXAxis {
                            AxisMarks(values: .automatic(desiredCount: 5)) {
                                AxisValueLabel(collisionResolution: .greedy)
                            }
                        }
                        .frame(minHeight: 240)
                    }
                }
            }

            AdminCard {
                VStack(alignment: .leading, spacing: 12) {
                    Label("Source attribution", systemImage: "arrow.triangle.branch")
                        .font(.title3.weight(.semibold))
                    if bundle.sourceAttribution.isEmpty {
                        Text("No source attribution data")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(Array(bundle.sourceAttribution.enumerated()), id: \.element.id) { index, row in
                            if index > 0 { Divider() }
                            VStack(alignment: .leading, spacing: 6) {
                                HStack(alignment: .firstTextBaseline) {
                                    Text(sourceName(row.source))
                                        .font(.headline)
                                    Spacer()
                                    Text(AdminFormatting.usd(cents: row.revenueCents))
                                        .font(.subheadline.weight(.semibold))
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
                                .foregroundStyle(.secondary)
                                .adminTabularNumbers()
                                Text("\(row.confirmed) confirmed")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .adminTabularNumbers()
                            }
                            .padding(.vertical, 3)
                        }
                    }
                }
            }

            AdminCard {
                VStack(alignment: .leading, spacing: 12) {
                    Label("Partner performance", systemImage: "person.2")
                        .font(.title3.weight(.semibold))
                    if bundle.partnerPerformance.isEmpty {
                        Text("No partner performance data")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(Array(bundle.partnerPerformance.enumerated()), id: \.element.id) { index, partner in
                            if index > 0 { Divider() }
                            VStack(alignment: .leading, spacing: 6) {
                                HStack(alignment: .firstTextBaseline) {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(partner.name ?? partner.email)
                                            .font(.headline)
                                        if partner.name != nil {
                                            Text(partner.email)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                    }
                                    Spacer()
                                    Text(AdminFormatting.usd(cents: partner.revenueCents))
                                        .font(.subheadline.weight(.semibold))
                                        .adminTabularNumbers()
                                }
                                Text("\(partner.paidFilings) paid of \(partner.filings) filings")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .adminTabularNumbers()
                            }
                            .padding(.vertical, 3)
                        }
                    }
                }
            }
        }
    }

    private func sourceName(_ source: String) -> String {
        source.replacingOccurrences(of: "_", with: " ").capitalized
    }
}
