import Charts
import SwiftUI

@MainActor
public struct AnalyticsView: View {
    @StateObject private var viewModel: AnalyticsViewModel
    @ObservedObject private var authManager: AuthManager
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var isConfirmingSignOut = false
    @State private var appliedBucketNotice: String?
    @State private var isAutoCorrectingBucket = false

    private let ranges = ["7d", "30d", "90d", "12m"]
    private let buckets = ["day", "week", "month"]

    public init(client: APIClient, authManager: AuthManager) {
        self.authManager = authManager
        _viewModel = StateObject(
            wrappedValue: AnalyticsViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                AdminScreenHeader("Analytics", eyebrow: "REPORTING") {
                    AdminAccountMenu(
                        email: signedInEmail,
                        isConfirmingSignOut: $isConfirmingSignOut
                    )
                }
                controls
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
            if viewModel.bundle == nil {
                await viewModel.load()
            }
        }
        .onChange(of: viewModel.range) { _, newRange in
            let correctedBucket = validBucket(
                viewModel.bucket,
                for: newRange
            )
            if correctedBucket != viewModel.bucket {
                isAutoCorrectingBucket = true
                appliedBucketNotice =
                    "\(correctedBucket.capitalized) bucketing was applied for \(rangeLabel(newRange))."
                viewModel.bucket = correctedBucket
            } else {
                appliedBucketNotice = nil
                Task { await viewModel.load() }
            }
        }
        .onChange(of: viewModel.bucket) { _, _ in
            if isAutoCorrectingBucket {
                isAutoCorrectingBucket = false
            } else {
                appliedBucketNotice = nil
            }
            Task { await viewModel.load() }
        }
    }

    private var signedInEmail: String? {
        guard case let .signedIn(profile) = authManager.state else { return nil }
        return profile.email
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
                        .disabled(!isBucketAllowed(bucket, for: viewModel.range))
                }
            }
            .pickerStyle(.segmented)

            if let appliedBucketNotice {
                Label(appliedBucketNotice, systemImage: "calendar.badge.checkmark")
                    .font(.caption)
                    .foregroundStyle(AdminTheme.secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }
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
                            if dynamicTypeSize.isAccessibilitySize {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(sourceName(row.source))
                                        .font(.headline)
                                    moneyText(cents: row.revenueCents)
                                }
                            } else {
                                HStack(alignment: .firstTextBaseline) {
                                    Text(sourceName(row.source))
                                        .font(.headline)
                                    Spacer()
                                    moneyText(cents: row.revenueCents)
                                }
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
                            if dynamicTypeSize.isAccessibilitySize {
                                VStack(alignment: .leading, spacing: 4) {
                                    partnerIdentity(partner)
                                    moneyText(cents: partner.revenueCents)
                                }
                            } else {
                                HStack(alignment: .firstTextBaseline) {
                                    partnerIdentity(partner)
                                    Spacer()
                                    moneyText(cents: partner.revenueCents)
                                }
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

    private func partnerIdentity(_ partner: PartnerPerformance) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(partner.name)
                .font(.headline)
            Text(partner.email)
                .font(.caption)
                .foregroundStyle(AdminTheme.secondaryText)
        }
    }

    private func moneyText(cents: Int) -> some View {
        Text(AdminFormatting.usd(cents: cents))
            .font(.subheadline.weight(.semibold))
            .fontDesign(.monospaced)
            .layoutPriority(1)
            .fixedSize(horizontal: false, vertical: true)
            .adminTabularNumbers()
    }

    private func isBucketAllowed(_ bucket: String, for range: String) -> Bool {
        switch range {
        case "90d", "12m":
            bucket == "week" || bucket == "month"
        default:
            true
        }
    }

    private func validBucket(_ bucket: String, for range: String) -> String {
        isBucketAllowed(bucket, for: range) ? bucket : "week"
    }

    private func rangeLabel(_ range: String) -> String {
        switch range {
        case "90d": "the 90-day range"
        case "12m": "the 12-month range"
        default: "this range"
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
