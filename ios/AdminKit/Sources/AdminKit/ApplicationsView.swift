import SwiftUI

@MainActor
public struct ApplicationsView: View {
    @StateObject private var viewModel: ApplicationsViewModel

    private let statuses = [
        "", "RECEIVED", "IN_REVIEW", "AWAITING_CUSTOMER", "SUBMITTED", "COMPLETED", "CANCELLED",
    ]

    public init(client: APIClient, authManager: AuthManager) {
        _viewModel = StateObject(
            wrappedValue: ApplicationsViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 14) {
                AdminScreenHeader("Applications", eyebrow: "EIN & ITIN")
                controls
            }
            .padding(.horizontal, 16)
            .padding(.top, 20)
            .padding(.bottom, 12)

            content
        }
        .background(AdminTheme.screenBackground)
        .navigationTitle("")
        .foregroundStyle(AdminTheme.primaryText)
        .tint(AdminTheme.accent)
        .onChange(of: viewModel.type) { _ in
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

    private var controls: some View {
        VStack(spacing: 10) {
            Picker("Application type", selection: $viewModel.type) {
                Text("EIN").tag("ein")
                Text("ITIN").tag("itin")
            }
            .pickerStyle(.segmented)

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
        }
        .card(padding: 14)
    }

    @ViewBuilder
    private var content: some View {
        if viewModel.isLoading, viewModel.items.isEmpty {
            LoadingStateView(title: "Loading applications…")
        } else if let errorMessage = viewModel.errorMessage, viewModel.items.isEmpty {
            ErrorStateView(message: errorMessage) {
                Task { await viewModel.load() }
            }
        } else if viewModel.hasLoaded, viewModel.items.isEmpty {
            EmptyStateView(
                title: "No Applications",
                message: "Try another application type or status filter.",
                systemImage: "person.text.rectangle"
            )
        } else {
            List(viewModel.items) { application in
                ApplicationRow(application: application, type: viewModel.type)
                    .card(padding: 14)
                    .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .task {
                        await viewModel.loadMoreIfNeeded(currentID: application.id)
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

private struct ApplicationRow: View {
    let application: ApplicationSummary
    let type: String

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack(alignment: .firstTextBaseline) {
                Text(application.fullName)
                    .font(.headline)
                Spacer(minLength: 8)
                AdminDesignSystem.StatusBadge(status: application.status)
            }
            Text(application.email)
                .font(.subheadline)
                .foregroundStyle(AdminTheme.secondaryText)
                .textSelection(.enabled)
            if type == "ein", let llcName = application.llcName, !llcName.isEmpty {
                Label(llcName, systemImage: "building.2")
                    .font(.caption)
                    .foregroundStyle(AdminTheme.secondaryText)
            }
            if type == "itin", let reason = application.itinReason, !reason.isEmpty {
                Label(reason, systemImage: "text.document")
                    .font(.caption)
                    .foregroundStyle(AdminTheme.secondaryText)
            }
        }
    }
}
