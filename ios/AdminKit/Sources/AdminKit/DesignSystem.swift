import SwiftUI

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

public extension Color {
    init(hex: String) {
        let value = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var parsed: UInt64 = 0
        Scanner(string: value).scanHexInt64(&parsed)

        let red: UInt64
        let green: UInt64
        let blue: UInt64
        let alpha: UInt64

        switch value.count {
        case 8:
            red = (parsed >> 24) & 0xFF
            green = (parsed >> 16) & 0xFF
            blue = (parsed >> 8) & 0xFF
            alpha = parsed & 0xFF
        default:
            red = (parsed >> 16) & 0xFF
            green = (parsed >> 8) & 0xFF
            blue = parsed & 0xFF
            alpha = 0xFF
        }

        self.init(
            .sRGB,
            red: Double(red) / 255,
            green: Double(green) / 255,
            blue: Double(blue) / 255,
            opacity: Double(alpha) / 255
        )
    }

    init(light: String, dark: String) {
#if canImport(UIKit)
        self.init(
            uiColor: UIColor { traits in
                UIColor(adminHex: traits.userInterfaceStyle == .dark ? dark : light)
            }
        )
#elseif canImport(AppKit)
        self.init(
            nsColor: NSColor(name: nil) { appearance in
                let match = appearance.bestMatch(from: [.darkAqua, .aqua])
                return NSColor(adminHex: match == .darkAqua ? dark : light)
            }
        )
#else
        self.init(hex: light)
#endif
    }
}

#if canImport(UIKit)
private extension UIColor {
    convenience init(adminHex: String) {
        let color = Color(hex: adminHex)
        self.init(color)
    }
}
#elseif canImport(AppKit)
private extension NSColor {
    convenience init(adminHex: String) {
        let color = Color(hex: adminHex)
        self.init(color)
    }
}
#endif

public enum AdminTheme {
    public static let accent = Color(light: "#1E3A8A", dark: "#8FAFF0")
    public static let accentFixed = Color(hex: "#1E3A8A")
    public static let accentDark = Color(hex: "#16295E")
    public static let accentTint = Color(light: "#EFF3FB", dark: "#24365C")

    public static let ink = Color(hex: "#0E1B33")
    public static let ink800 = Color(hex: "#132340")
    public static let paper = Color(hex: "#FBFAF7")
    public static let paperEdge = Color(hex: "#E9E4D8")
    public static let seal = Color(hex: "#B08D4F")

    public static let success = Color(hex: "#059669")
    public static let warning = Color(hex: "#D97706")
    public static let danger = Color(hex: "#DC2626")

    public static let screenBackground = Color(light: "#FBFAF7", dark: "#0E1B33")
    public static let cardSurface = Color(light: "#FFFFFF", dark: "#132340")
    public static let cardBorder = Color(light: "#E2E8F0", dark: "#FFFFFF1F")
    public static let primaryText = Color(light: "#0E1B33", dark: "#F8FAFC")
    public static let secondaryText = Color(light: "#64748B", dark: "#CBD5E1")
    public static let onAccent = Color(hex: "#FFFFFF")
    public static let onDark = Color(hex: "#FBFAF7")
    public static let successOnDark = Color(hex: "#6EE7B7")
    public static let dangerOnDark = Color(hex: "#FCA5A5")
}

public struct CardModifier: ViewModifier {
    private let padding: CGFloat

    public init(padding: CGFloat = 16) {
        self.padding = padding
    }

    public func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: 10, style: .continuous)

        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(padding)
            .background(shape.fill(AdminTheme.cardSurface))
            .overlay(shape.stroke(AdminTheme.cardBorder, lineWidth: 1))
    }
}

public extension View {
    func card(padding: CGFloat = 16) -> some View {
        modifier(CardModifier(padding: padding))
    }

    func adminDarkField() -> some View {
        modifier(AdminDarkFieldModifier())
    }

    @ViewBuilder
    func adminInlineNavigationTitle() -> some View {
#if os(iOS)
        navigationBarTitleDisplayMode(.inline)
#else
        self
#endif
    }

    @ViewBuilder
    func adminHiddenNavigationBar() -> some View {
#if os(iOS)
        toolbar(.hidden, for: .navigationBar)
#else
        self
#endif
    }

    @ViewBuilder
    func adminVisibleNavigationBar() -> some View {
#if os(iOS)
        toolbar(.visible, for: .navigationBar)
#else
        self
#endif
    }
}

public struct AdminPrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(AdminTheme.onAccent)
            .frame(maxWidth: .infinity, minHeight: 44)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(
                        configuration.isPressed
                            ? AdminTheme.accentDark
                            : AdminTheme.accentFixed
                    )
            )
            .opacity(isEnabled ? 1 : 0.48)
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

public struct AdminSecondaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(AdminTheme.primaryText)
            .frame(minHeight: 44)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(AdminTheme.cardSurface)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(AdminTheme.cardBorder, lineWidth: 1)
            )
            .opacity(isEnabled ? 1 : 0.48)
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

public struct AdminDestructiveButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(AdminTheme.onAccent)
            .frame(minHeight: 44)
            .padding(.horizontal, 16)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(AdminTheme.danger.opacity(configuration.isPressed ? 0.78 : 1))
            )
            .opacity(isEnabled ? 1 : 0.48)
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
    }
}

public struct AdminEyebrow: View {
    private let text: String
    private let color: Color

    public init(_ text: String, color: Color = AdminTheme.accent) {
        self.text = text
        self.color = color
    }

    public var body: some View {
        Text(text.uppercased())
            .font(.caption2.weight(.semibold))
            .fontDesign(.monospaced)
            .tracking(1.5)
            .foregroundStyle(color)
            .accessibilityAddTraits(.isHeader)
    }
}

public struct AdminScreenHeader<Trailing: View>: View {
    private let eyebrow: String?
    private let title: String
    private let trailing: Trailing

    public init(
        _ title: String,
        eyebrow: String? = nil,
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.title = title
        self.eyebrow = eyebrow
        self.trailing = trailing()
    }

    public var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                if let eyebrow {
                    AdminEyebrow(eyebrow)
                }
                Text(title)
                    .font(.largeTitle.weight(.semibold))
                    .fontDesign(.serif)
                    .foregroundStyle(AdminTheme.primaryText)
                    .accessibilityAddTraits(.isHeader)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .layoutPriority(1)

            trailing
                .fixedSize()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

public extension AdminScreenHeader where Trailing == EmptyView {
    init(_ title: String, eyebrow: String? = nil) {
        self.init(title, eyebrow: eyebrow) {
            EmptyView()
        }
    }
}

@MainActor
struct AdminAccountMenu: View {
    let email: String?
    @Binding var isConfirmingSignOut: Bool

    var body: some View {
        Menu {
            if let email, !email.isEmpty {
                Label(email, systemImage: "person.crop.circle")
                    .disabled(true)
            }

            Divider()

            Button(role: .destructive) {
                isConfirmingSignOut = true
            } label: {
                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
            }
        } label: {
            Image(systemName: "person.circle")
                .font(.title2)
                .foregroundStyle(AdminTheme.accent)
                .frame(width: 44, height: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Account")
    }
}

@MainActor
struct AdminAccountToolbar: ToolbarContent {
    let email: String?
    @Binding var isConfirmingSignOut: Bool

    var body: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            AdminAccountMenu(
                email: email,
                isConfirmingSignOut: $isConfirmingSignOut
            )
        }
    }
}

struct AdminInlineErrorBanner: View {
    let message: String
    let onDismiss: () -> Void
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .accessibilityHidden(true)

            Text(message)
                .font(.footnote)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.caption.weight(.semibold))
                    .frame(width: 44, height: 44)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Dismiss error")
        }
        .foregroundStyle(
            colorScheme == .dark ? AdminTheme.dangerOnDark : AdminTheme.danger
        )
        .padding(.leading, 14)
        .padding(.trailing, 4)
        .padding(.vertical, 4)
        .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
        .background(
            AdminTheme.danger.opacity(0.10),
            in: RoundedRectangle(cornerRadius: 10, style: .continuous)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(AdminTheme.danger.opacity(0.30), lineWidth: 1)
        )
        .accessibilityElement(children: .contain)
    }
}

public enum AdminDesignSystem {
    public struct StatusBadge: View {
        @Environment(\.colorScheme) private var colorScheme

        private let status: String

        public init(status: String) {
            self.status = status
        }

        public var body: some View {
            let palette = StatusPalette.palette(for: status, colorScheme: colorScheme)
            let label = status.replacingOccurrences(of: "_", with: " ")

            Text(label)
                .font(.caption2.weight(.medium))
                .fontDesign(.monospaced)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
                .padding(.horizontal, 9)
                .padding(.vertical, 5)
                .foregroundStyle(palette.foreground)
                .background(palette.background, in: Capsule())
                .accessibilityLabel("Status: \(label)")
        }
    }
}

private struct AdminDarkFieldModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .foregroundStyle(AdminTheme.onDark)
            .tint(AdminTheme.onDark)
            .padding(.horizontal, 14)
            .frame(minHeight: 48)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(AdminTheme.onDark.opacity(0.10))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(AdminTheme.onDark.opacity(0.15), lineWidth: 1)
            )
    }
}

private enum StatusPalette {
    struct Colors {
        let background: Color
        let foreground: Color
    }

    static func palette(for status: String, colorScheme: ColorScheme) -> Colors {
        let isDark = colorScheme == .dark

        switch status.uppercased() {
        case "PAID", "RECEIVED":
            return colors(
                lightBackground: "#DBEAFE", lightForeground: "#1D4ED8",
                darkBackground: "#1E3A8A", darkForeground: "#BFDBFE",
                isDark: isDark
            )
        case "PDF_GENERATED", "IN_REVIEW":
            return colors(
                lightBackground: "#E0E7FF", lightForeground: "#4338CA",
                darkBackground: "#3730A3", darkForeground: "#C7D2FE",
                isDark: isDark
            )
        case "SIGNATURE_PENDING", "DOCS_REQUESTED", "PAYMENT_PENDING", "AWAITING_CUSTOMER":
            return colors(
                lightBackground: "#FEF3C7", lightForeground: "#B45309",
                darkBackground: "#78350F", darkForeground: "#FDE68A",
                isDark: isDark
            )
        case "SIGNED_UPLOADED", "SUBMITTED":
            return colors(
                lightBackground: "#EDE9FE", lightForeground: "#7C3AED",
                darkBackground: "#5B21B6", darkForeground: "#DDD6FE",
                isDark: isDark
            )
        case "FAXED", "PROCESSING", "CAA_SCHEDULED", "W7_SUBMITTED":
            return colors(
                lightBackground: "#CFFAFE", lightForeground: "#0E7490",
                darkBackground: "#164E63", darkForeground: "#A5F3FC",
                isDark: isDark
            )
        case "CONFIRMED", "COMPLETED":
            return colors(
                lightBackground: "#D1FAE5", lightForeground: "#047857",
                darkBackground: "#064E3B", darkForeground: "#A7F3D0",
                isDark: isDark
            )
        case "FAILED":
            return colors(
                lightBackground: "#FEE2E2", lightForeground: "#B91C1C",
                darkBackground: "#7F1D1D", darkForeground: "#FECACA",
                isDark: isDark
            )
        default:
            return colors(
                lightBackground: "#F1F5F9", lightForeground: "#475569",
                darkBackground: "#334155", darkForeground: "#E2E8F0",
                isDark: isDark
            )
        }
    }

    private static func colors(
        lightBackground: String,
        lightForeground: String,
        darkBackground: String,
        darkForeground: String,
        isDark: Bool
    ) -> Colors {
        Colors(
            background: Color(hex: isDark ? darkBackground : lightBackground),
            foreground: Color(hex: isDark ? darkForeground : lightForeground)
        )
    }
}
