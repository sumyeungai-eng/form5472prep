import Foundation
import SwiftUI

public enum AdminFormatting {
    private static let usLocale = Locale(identifier: "en_US")
    private static let decimalLocale = Locale(identifier: "en_US_POSIX")

    public static func usd(cents: Int) -> String {
        let dollars = Decimal(cents) / Decimal(100)
        return usd(dollars: dollars)
    }

    public static func usd(decimalString: String) -> String {
        guard let dollars = Decimal(string: decimalString, locale: decimalLocale) else {
            return decimalString
        }
        return usd(dollars: dollars)
    }

    public static func usd(dollars: Decimal) -> String {
        dollars.formatted(
            .currency(code: "USD")
                .locale(usLocale)
                .precision(.fractionLength(2))
        )
    }

    public static func age(hours: Int) -> String {
        if hours < 24 {
            return "\(hours)h ago"
        }
        let days = hours / 24
        let remainingHours = hours % 24
        return remainingHours == 0
            ? "\(days)d ago"
            : "\(days)d \(remainingHours)h ago"
    }

    public static func errorMessage(for error: Error) -> String {
        if let localizedError = error as? LocalizedError,
           let description = localizedError.errorDescription {
            return description
        }
        if let apiError = error as? APIError {
            switch apiError {
            case .unauthorized:
                return "Your session has expired. Sign in again."
            case .notFound:
                return "The requested item could not be found."
            case let .server(_, message):
                return message
            case .transport:
                return "Could not reach the server. Check your connection and try again."
            case .decoding:
                return "The server returned an unexpected response."
            }
        }
        return "Something went wrong. Please try again."
    }
}

public struct CursorPagination<Item: Sendable>: Sendable {
    public private(set) var items: [Item]
    public private(set) var nextCursor: String?

    public init(items: [Item] = [], nextCursor: String? = nil) {
        self.items = items
        self.nextCursor = nextCursor
    }

    public var hasMorePages: Bool {
        nextCursor != nil
    }

    public func shouldRequestNextPage(isLoading: Bool) -> Bool {
        hasMorePages && !isLoading
    }

    public mutating func replace(with items: [Item], nextCursor: String?) {
        self.items = items
        self.nextCursor = nextCursor
    }

    public mutating func append(_ items: [Item], nextCursor: String?) {
        self.items.append(contentsOf: items)
        self.nextCursor = nextCursor
    }
}

enum AdminStatusStyle {
    static func color(for status: String, application: Bool = false) -> Color {
        switch status.uppercased() {
        case "CONFIRMED", "FAXED", "COMPLETED":
            return .green
        case "FAILED", "CANCELLED":
            return .red
        case "DRAFT", "RECEIVED":
            return .gray
        default:
            return .orange
        }
    }
}

struct StatusBadge: View {
    let status: String
    var application = false

    var body: some View {
        Text(status.replacingOccurrences(of: "_", with: " "))
            .font(.caption.weight(.semibold))
            .lineLimit(1)
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .foregroundStyle(AdminStatusStyle.color(for: status, application: application))
            .background(
                AdminStatusStyle.color(for: status, application: application).opacity(0.14),
                in: Capsule()
            )
            .accessibilityLabel("Status: \(status.replacingOccurrences(of: "_", with: " "))")
    }
}

struct AdminCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.background, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .shadow(color: .black.opacity(0.06), radius: 8, y: 2)
    }
}

struct ErrorStateView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text("Couldn’t Load Data")
                .font(.title2.weight(.semibold))
            Text(message)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Button("Retry", action: retry)
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct EmptyStateView: View {
    let title: String
    let message: String
    let systemImage: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text(title)
                .font(.title2.weight(.semibold))
            Text(message)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct LoadingStateView: View {
    let title: String

    var body: some View {
        ProgressView(title)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .accessibilityLabel(title)
    }
}

extension View {
    func adminTabularNumbers() -> some View {
        monospacedDigit()
    }
}
