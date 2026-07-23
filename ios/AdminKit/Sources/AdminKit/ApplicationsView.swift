import SwiftUI

@MainActor
public struct ApplicationsView: View {
    @StateObject private var viewModel: ApplicationsViewModel
    @ObservedObject private var authManager: AuthManager
    @State private var selectedApplication: ApplicationSummary?
    @State private var isConfirmingSignOut = false

    private let statuses = [
        "", "RECEIVED", "IN_REVIEW", "AWAITING_CUSTOMER", "SUBMITTED", "COMPLETED", "CANCELLED",
    ]

    public init(client: APIClient, authManager: AuthManager) {
        self.authManager = authManager
        _viewModel = StateObject(
            wrappedValue: ApplicationsViewModel(client: client, authManager: authManager)
        )
    }

    public var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 14) {
                AdminScreenHeader("Applications", eyebrow: "EIN & ITIN") {
                    AdminAccountMenu(
                        email: signedInEmail,
                        isConfirmingSignOut: $isConfirmingSignOut
                    )
                }
                controls
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 12)

            content
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
        .sheet(item: $selectedApplication) { application in
            ApplicationDetailSheet(application: application, type: viewModel.type)
        }
        .onChange(of: viewModel.type) { _, _ in
            Task { await viewModel.load() }
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
                    title: "No Applications",
                    message: "Try another application type or status filter.",
                    systemImage: "person.text.rectangle"
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

                List(viewModel.items) { application in
                    Button {
                        selectedApplication = application
                    } label: {
                        ApplicationRow(application: application, type: viewModel.type)
                            .card(padding: 14)
                    }
                    .buttonStyle(.plain)
                    .accessibilityHint("Shows application details")
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

private struct ApplicationDetailSheet: View {
    let application: ApplicationSummary
    let type: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    AdminScreenHeader(
                        application.fullName,
                        eyebrow: "\(type.uppercased()) APPLICATION"
                    )

                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            AdminEyebrow("Application details")
                            Spacer()
                            AdminDesignSystem.StatusBadge(status: application.status)
                        }

                        Divider()
                            .overlay(AdminTheme.cardBorder)

                        ApplicationDetailRow(label: "Application ID", value: application.id)
                        ApplicationDetailRow(label: "Full name", value: application.fullName)
                        ApplicationDetailRow(label: "Email", value: application.email)
                        ApplicationDetailRow(label: "Phone", value: application.phone)
                        ApplicationDetailRow(label: "Status", value: application.status)
                        ApplicationDetailRow(label: "LLC name", value: application.llcName)
                        ApplicationDetailRow(label: "LLC state", value: application.llcState)
                        ApplicationDetailRow(label: "EIN", value: application.ein)
                        ApplicationDetailRow(label: "ITIN reason", value: application.itinReason)
                        ApplicationDetailRow(label: "ITIN", value: application.itin)
                        ApplicationDetailRow(
                            label: "Created",
                            value: formatted(application.createdAt)
                        )
                        ApplicationDetailRow(
                            label: "Updated",
                            value: formatted(application.updatedAt)
                        )
                    }
                    .card()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 16)
            }
            .background(AdminTheme.screenBackground)
            .foregroundStyle(AdminTheme.primaryText)
            .navigationTitle("")
            .adminInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .tint(AdminTheme.accent)
        .presentationDetents([.medium, .large])
    }

    private func formatted(_ date: Date) -> String {
        date.formatted(date: .abbreviated, time: .shortened)
    }
}

private struct ApplicationDetailRow: View {
    let label: String
    let value: String?
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

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
