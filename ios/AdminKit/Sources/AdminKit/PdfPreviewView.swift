import SwiftUI

#if canImport(PDFKit)
import PDFKit
#endif

@MainActor
public struct PdfPreviewView: View {
    private let filingID: String
    private let kind: String
    private let title: String
    private let client: APIClient

    @Environment(\.dismiss) private var dismiss
    @State private var data: Data?
    @State private var errorMessage: String?
    @State private var isLoading = false

    public init(filingID: String, kind: String, title: String, client: APIClient) {
        self.filingID = filingID
        self.kind = kind
        self.title = title
        self.client = client
    }

    public var body: some View {
        NavigationStack {
            Group {
                if isLoading, data == nil {
                    LoadingStateView(title: "Loading PDF…")
                } else if let data {
#if canImport(PDFKit) && canImport(UIKit)
                    AdminPDFView(data: data)
                        .ignoresSafeArea(edges: .bottom)
#else
                    EmptyStateView(
                        title: "Preview unavailable",
                        message: "PDF preview is available in the iOS app.",
                        systemImage: "doc.richtext"
                    )
#endif
                } else if let errorMessage {
                    ErrorStateView(message: errorMessage) {
                        Task { await load() }
                    }
                } else {
                    LoadingStateView(title: "Loading PDF…")
                }
            }
            .background(AdminTheme.screenBackground)
            .navigationTitle(title)
            .adminInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .tint(AdminTheme.accent)
        .task(id: "\(filingID)-\(kind)") { await load() }
    }

    private func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            data = try await client.filingPdf(id: filingID, kind: kind)
        } catch {
            data = nil
            errorMessage = AdminFormatting.errorMessage(for: error)
        }
    }
}

#if canImport(PDFKit) && canImport(UIKit)
private struct AdminPDFView: UIViewRepresentable {
    let data: Data

    func makeUIView(context: Context) -> PDFView {
        let view = PDFView()
        view.autoScales = true
        view.displayMode = .singlePageContinuous
        view.displayDirection = .vertical
        return view
    }

    func updateUIView(_ view: PDFView, context: Context) {
        if view.document?.dataRepresentation() != data {
            view.document = PDFDocument(data: data)
        }
    }
}
#endif
