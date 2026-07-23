import Foundation

#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public enum APIError: Error, Sendable {
    case unauthorized
    case notFound
    case server(code: String, message: String)
    case transport(Error)
    case decoding(Error)
}

public actor APIClient {
    private struct DataEnvelope<Value: Decodable>: Decodable {
        let data: Value
    }

    private struct ErrorEnvelope: Decodable {
        struct Details: Decodable {
            let code: String
            let message: String
        }

        let error: Details
    }

    private struct EmailRequest: Encodable {
        let email: String
    }

    private struct ExchangeRequest: Encodable {
        let token: String
        let deviceName: String
    }

    private struct ExchangeResponse: Decodable {
        struct Admin: Decodable {
            let id: String
            let email: String?
        }

        let deviceToken: String
        let admin: Admin
    }

    private struct FilingPage: Decodable {
        let items: [FilingSummary]
        let nextCursor: String?
    }

    private struct ApplicationPage: Decodable {
        let items: [ApplicationSummary]
        let nextCursor: String?
    }

    private struct PartnerList: Decodable {
        let items: [PartnerRow]
    }

    private let baseURL: URL
    private let tokenStore: any TokenStore
    private let session: URLSession

    public init(baseURL: URL, tokenStore: any TokenStore) {
        self.init(baseURL: baseURL, tokenStore: tokenStore, session: .shared)
    }

    public init(baseURL: URL, tokenStore: any TokenStore, session: URLSession) {
        self.baseURL = baseURL
        self.tokenStore = tokenStore
        self.session = session
    }

    public func requestLink(email: String) async throws {
        var request = try makeRequest(path: "/api/admin/v1/auth/request-link", method: "POST")
        request.httpBody = try encode(EmailRequest(email: email))
        _ = try await perform(request, authenticated: false, expectsBody: false)
    }

    public func exchange(token: String, deviceName: String) async throws -> AdminProfile {
        var request = try makeRequest(path: "/api/admin/v1/auth/exchange", method: "POST")
        request.httpBody = try encode(ExchangeRequest(token: token, deviceName: deviceName))
        let response: ExchangeResponse = try await decodeResponse(
            request,
            authenticated: false
        )
        try tokenStore.write(response.deviceToken)
        return AdminProfile(
            adminId: response.admin.id,
            email: response.admin.email,
            via: "bearer"
        )
    }

    public func me() async throws -> AdminProfile {
        let request = try makeRequest(path: "/api/admin/v1/me", method: "GET")
        return try await decodeResponse(request, authenticated: true)
    }

    public func dashboard(range: String) async throws -> DashboardSummary {
        let url = try makeURL(
            path: "/api/admin/v1/dashboard",
            queryItems: [URLQueryItem(name: "range", value: range)]
        )
        let request = makeRequest(url: url, method: "GET")
        return try await decodeResponse(request, authenticated: true)
    }

    public func filings(
        status: String?,
        query: String?,
        cursor: String?,
        limit: Int
    ) async throws -> (items: [FilingSummary], nextCursor: String?) {
        var queryItems = [URLQueryItem(name: "limit", value: String(limit))]
        if let status, !status.isEmpty {
            queryItems.append(URLQueryItem(name: "status", value: status))
        }
        if let query, !query.isEmpty {
            queryItems.append(URLQueryItem(name: "q", value: query))
        }
        if let cursor, !cursor.isEmpty {
            queryItems.append(URLQueryItem(name: "cursor", value: cursor))
        }

        let url = try makeURL(path: "/api/admin/v1/filings", queryItems: queryItems)
        let request = makeRequest(url: url, method: "GET")
        let page: FilingPage = try await decodeResponse(request, authenticated: true)
        return (page.items, page.nextCursor)
    }

    public func filingDetail(id: String) async throws -> FilingDetail {
        let url = try makeURL(
            path: "/api/admin/v1/filings",
            appendingPathSegment: id
        )
        let request = makeRequest(url: url, method: "GET")
        return try await decodeResponse(request, authenticated: true)
    }

    public func applications(
        type: String,
        status: String?,
        cursor: String?,
        limit: Int
    ) async throws -> (items: [ApplicationSummary], nextCursor: String?) {
        var queryItems = [
            URLQueryItem(name: "type", value: type),
            URLQueryItem(name: "limit", value: String(limit)),
        ]
        if let status, !status.isEmpty {
            queryItems.append(URLQueryItem(name: "status", value: status))
        }
        if let cursor, !cursor.isEmpty {
            queryItems.append(URLQueryItem(name: "cursor", value: cursor))
        }

        let url = try makeURL(path: "/api/admin/v1/applications", queryItems: queryItems)
        let request = makeRequest(url: url, method: "GET")
        let page: ApplicationPage = try await decodeResponse(request, authenticated: true)
        return (page.items, page.nextCursor)
    }

    public func partners() async throws -> [PartnerRow] {
        let request = try makeRequest(path: "/api/admin/v1/partners", method: "GET")
        let list: PartnerList = try await decodeResponse(request, authenticated: true)
        return list.items
    }

    public func analytics(range: String, bucket: String) async throws -> AnalyticsBundle {
        let url = try makeURL(
            path: "/api/admin/v1/analytics",
            queryItems: [
                URLQueryItem(name: "range", value: range),
                URLQueryItem(name: "bucket", value: bucket),
            ]
        )
        let request = makeRequest(url: url, method: "GET")
        return try await decodeResponse(request, authenticated: true)
    }

    private func decodeResponse<Value: Decodable>(
        _ request: URLRequest,
        authenticated: Bool
    ) async throws -> Value {
        let data = try await perform(request, authenticated: authenticated, expectsBody: true)
        do {
            return try Self.decoder.decode(DataEnvelope<Value>.self, from: data).data
        } catch {
            throw APIError.decoding(error)
        }
    }

    private func perform(
        _ originalRequest: URLRequest,
        authenticated: Bool,
        expectsBody: Bool
    ) async throws -> Data {
        var request = originalRequest
        if authenticated {
            guard let token = try tokenStore.read(), !token.isEmpty else {
                throw APIError.unauthorized
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.transport(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.transport(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 401 {
            try? tokenStore.clear()
            throw APIError.unauthorized
        }
        if httpResponse.statusCode == 404 {
            throw APIError.notFound
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            if let envelope = try? JSONDecoder().decode(ErrorEnvelope.self, from: data) {
                throw APIError.server(
                    code: envelope.error.code,
                    message: envelope.error.message
                )
            }
            throw APIError.server(
                code: "http_\(httpResponse.statusCode)",
                message: HTTPURLResponse.localizedString(forStatusCode: httpResponse.statusCode)
            )
        }

        if expectsBody && data.isEmpty {
            throw APIError.decoding(URLError(.zeroByteResource))
        }
        return data
    }

    private func makeRequest(path: String, method: String) throws -> URLRequest {
        let url = try makeURL(path: path, queryItems: [])
        return makeRequest(url: url, method: method)
    }

    private func makeRequest(url: URL, method: String) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if method != "GET" {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        return request
    }

    private func makeURL(path: String, queryItems: [URLQueryItem]) throws -> URL {
        let normalizedPath = path.hasPrefix("/") ? String(path.dropFirst()) : path
        let url = baseURL.appendingPathComponent(normalizedPath)
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            throw APIError.transport(URLError(.badURL))
        }
        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let finalURL = components.url else {
            throw APIError.transport(URLError(.badURL))
        }
        return finalURL
    }

    private func makeURL(path: String, appendingPathSegment segment: String) throws -> URL {
        let base = try makeURL(path: path, queryItems: [])
        guard var components = URLComponents(url: base, resolvingAgainstBaseURL: false) else {
            throw APIError.transport(URLError(.badURL))
        }
        let pathSegmentAllowed = CharacterSet.urlPathAllowed.subtracting(
            CharacterSet(charactersIn: "/?#%")
        )
        guard let encodedSegment = segment.addingPercentEncoding(
            withAllowedCharacters: pathSegmentAllowed
        ) else {
            throw APIError.transport(URLError(.badURL))
        }
        components.percentEncodedPath += "/\(encodedSegment)"
        guard let finalURL = components.url else {
            throw APIError.transport(URLError(.badURL))
        }
        return finalURL
    }

    private func encode<Value: Encodable>(_ value: Value) throws -> Data {
        do {
            return try JSONEncoder().encode(value)
        } catch {
            throw APIError.transport(error)
        }
    }

    private static var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)
            let withFractionalSeconds = ISO8601DateFormatter()
            withFractionalSeconds.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = withFractionalSeconds.date(from: value) {
                return date
            }
            let standard = ISO8601DateFormatter()
            standard.formatOptions = [.withInternetDateTime]
            if let date = standard.date(from: value) {
                return date
            }
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Invalid ISO-8601 date: \(value)"
            )
        }
        return decoder
    }
}
