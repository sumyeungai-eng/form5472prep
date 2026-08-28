import SwiftUI

@MainActor
public struct FilingActionsView: View {
    private enum SideEffect: String {
        case resendOrderConfirmation
        case resendMagicLink
        case regeneratePdf
        case retryFax

        var label: String {
            switch self {
            case .resendOrderConfirmation: "Resend order confirmation"
            case .resendMagicLink: "Resend sign-in link"
            case .regeneratePdf: "Regenerate PDF"
            case .retryFax: "Retry fax"
            }
        }

        var systemImage: String {
            switch self {
            case .resendOrderConfirmation: "envelope"
            case .resendMagicLink: "link"
            case .regeneratePdf: "arrow.clockwise"
            case .retryFax: "faxmachine"
            }
        }

        var confirmationMessage: String {
            switch self {
            case .retryFax:
                "This sends a real fax to the IRS."
            case .regeneratePdf:
                "This discards the signed PDF and the customer must sign again."
            case .resendOrderConfirmation, .resendMagicLink:
                "This emails the customer."
            }
        }
    }

    private struct ActionIntent {
        let operation: SideEffect
        let idempotencyKey: String
    }

    private let filingID: String
    private let currentStatus: String
    private let hasSignedPdf: Bool
    private let client: APIClient
    private let onRefresh: @MainActor () async -> Void

    @State private var confirmationOperation: SideEffect?
    @State private var inFlightIntent: ActionIntent?
    @State private var failedIntent: ActionIntent?
    @State private var isChangingStatus = false
    @State private var selectedStatus: String
    @State private var illegalTransitionMessage: String?
    @State private var isShowingOverrideReason = false
    @State private var overrideReason = ""
    @State private var errorMessage: String?
    @State private var successMessage: String?

    private let statuses = [
        "DRAFT", "PAID", "PDF_GENERATED", "SIGNATURE_PENDING",
        "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED",
    ]

    public init(
        filingID: String,
        currentStatus: String,
        hasSignedPdf: Bool,
        client: APIClient,
        onRefresh: @escaping @MainActor () async -> Void
    ) {
        self.filingID = filingID
        self.currentStatus = currentStatus
        self.hasSignedPdf = hasSignedPdf
        self.client = client
        self.onRefresh = onRefresh
        _selectedStatus = State(initialValue: currentStatus)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            actionButton("Change status…", systemImage: "arrow.triangle.2.circlepath") {
                selectedStatus = currentStatus
                isChangingStatus = true
            }

            sideEffectButton(.resendOrderConfirmation)
            sideEffectButton(.resendMagicLink)
            sideEffectButton(.regeneratePdf)
            sideEffectButton(.retryFax)
                .disabled(isBusy || !hasSignedPdf)

            if isBusy {
                HStack(spacing: 8) {
                    ProgressView()
                    Text("Working…")
                        .foregroundStyle(AdminTheme.secondaryText)
                }
                .font(.subheadline)
                .frame(minHeight: 44)
                .accessibilityElement(children: .combine)
            }

            if let successMessage {
                Label(successMessage, systemImage: "checkmark.circle.fill")
                    .font(.subheadline)
                    .foregroundStyle(AdminTheme.success)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let errorMessage {
                Label(errorMessage, systemImage: "exclamationmark.triangle.fill")
                    .font(.subheadline)
                    .foregroundStyle(AdminTheme.danger)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let illegalTransitionMessage {
                VStack(alignment: .leading, spacing: 8) {
                    Text(illegalTransitionMessage)
                        .font(.subheadline)
                        .foregroundStyle(AdminTheme.danger)
                    Button("Override…") {
                        overrideReason = ""
                        isShowingOverrideReason = true
                    }
                    .buttonStyle(AdminSecondaryButtonStyle())
                    .disabled(isBusy)
                }
            }

            if let failedIntent, !isBusy {
                Button("Retry \(failedIntent.operation.label.lowercased())") {
                    Task { await perform(failedIntent) }
                }
                .buttonStyle(AdminSecondaryButtonStyle())
                .accessibilityHint("Retries the same request without creating a new operation")
            }
        }
        .disabled(isBusy)
        .confirmationDialog(
            confirmationOperation?.label ?? "Confirm action",
            isPresented: confirmationBinding,
            titleVisibility: .visible
        ) {
            if let operation = confirmationOperation {
                Button(operation.label, role: operation == .retryFax ? .destructive : nil) {
                    let intent = ActionIntent(
                        operation: operation,
                        idempotencyKey: UUID().uuidString
                    )
                    failedIntent = nil
                    Task { await perform(intent) }
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text(confirmationOperation?.confirmationMessage ?? "")
        }
        .sheet(isPresented: $isChangingStatus) {
            statusSheet
        }
        .alert("Override status transition", isPresented: $isShowingOverrideReason) {
            TextField("Required reason", text: $overrideReason)
            Button("Override") {
                let reason = overrideReason.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !reason.isEmpty else { return }
                Task { await setStatus(force: true, reason: reason) }
            }
            .disabled(overrideReason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            Button("Cancel", role: .cancel) {}
        } message: {
            Text(illegalTransitionMessage ?? "Explain why this transition must be forced.")
        }
    }

    private var isBusy: Bool {
        inFlightIntent != nil || isChangingStatusOperation
    }

    @State private var isChangingStatusOperation = false

    private var confirmationBinding: Binding<Bool> {
        Binding(
            get: { confirmationOperation != nil },
            set: { if !$0 { confirmationOperation = nil } }
        )
    }

    private var statusSheet: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                AdminEyebrow("Filing lifecycle")
                Picker("Status", selection: $selectedStatus) {
                    ForEach(statuses, id: \.self) { status in
                        Text(status.replacingOccurrences(of: "_", with: " "))
                            .tag(status)
                    }
                }
                .pickerStyle(.menu)
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)

                Button("Apply status") {
                    isChangingStatus = false
                    Task { await setStatus(force: false, reason: nil) }
                }
                .buttonStyle(AdminPrimaryButtonStyle())
                .disabled(selectedStatus == currentStatus)

                Spacer()
            }
            .padding(16)
            .background(AdminTheme.screenBackground)
            .foregroundStyle(AdminTheme.primaryText)
            .navigationTitle("Change status")
            .adminInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { isChangingStatus = false }
                }
            }
        }
        .tint(AdminTheme.accent)
        .presentationDetents([.medium])
    }

    private func sideEffectButton(_ operation: SideEffect) -> some View {
        actionButton(operation.label, systemImage: operation.systemImage) {
            successMessage = nil
            errorMessage = nil
            illegalTransitionMessage = nil
            confirmationOperation = operation
        }
        .disabled(isBusy || (operation == .retryFax && !hasSignedPdf))
    }

    private func actionButton(
        _ title: String,
        systemImage: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(AdminSecondaryButtonStyle())
        .disabled(isBusy)
    }

    private func perform(_ intent: ActionIntent) async {
        inFlightIntent = intent
        errorMessage = nil
        successMessage = nil
        illegalTransitionMessage = nil
        defer { inFlightIntent = nil }

        do {
            let result = try await client.filingAction(
                id: filingID,
                action: intent.operation.rawValue,
                idempotencyKey: intent.idempotencyKey
            )
            failedIntent = nil
            successMessage = result.replayed
                ? "Completed (already completed)"
                : "\(intent.operation.label) completed"
            await onRefresh()
        } catch {
            failedIntent = intent
            errorMessage = actionErrorMessage(error)
        }
    }

    private func setStatus(force: Bool, reason: String?) async {
        isChangingStatusOperation = true
        errorMessage = nil
        successMessage = nil
        if !force {
            illegalTransitionMessage = nil
        }
        defer { isChangingStatusOperation = false }

        do {
            let result = try await client.filingAction(
                id: filingID,
                action: "setStatus",
                payload: ["status": .string(selectedStatus)],
                force: force ? true : nil,
                reason: reason
            )
            illegalTransitionMessage = nil
            successMessage = result.replayed
                ? "Status changed (already completed)"
                : "Status changed"
            await onRefresh()
        } catch let APIError.server(code, message, _) where code == "illegal_transition" {
            illegalTransitionMessage = message
        } catch {
            errorMessage = actionErrorMessage(error)
        }
    }

    private func actionErrorMessage(_ error: Error) -> String {
        if case let APIError.server(code, message, _) = error {
            switch code {
            case "operation_in_progress":
                return "This operation is already running. Try again in a moment."
            case "identity_required":
                return "Sign in with your personal admin account to do this."
            default:
                return message
            }
        }
        return AdminFormatting.errorMessage(for: error)
    }
}
