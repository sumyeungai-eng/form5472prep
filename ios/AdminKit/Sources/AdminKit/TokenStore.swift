import Foundation
import Security

public protocol TokenStore: Sendable {
    func read() throws -> String?
    func write(_ token: String) throws
    func clear() throws
}

public enum TokenStoreError: Error, Sendable {
    case unexpectedKeychainStatus(OSStatus)
    case invalidStoredData
}

public struct KeychainTokenStore: TokenStore, Sendable {
    private let service: String
    private let account = "admin-device-token"

    public init(service: String) {
        self.service = service
    }

    public func read() throws -> String? {
        var query = baseQuery
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        if status == errSecItemNotFound {
            return nil
        }
        guard status == errSecSuccess else {
            throw TokenStoreError.unexpectedKeychainStatus(status)
        }
        guard
            let data = result as? Data,
            let token = String(data: data, encoding: .utf8)
        else {
            throw TokenStoreError.invalidStoredData
        }
        return token
    }

    public func write(_ token: String) throws {
        guard let data = token.data(using: .utf8) else {
            throw TokenStoreError.invalidStoredData
        }

        var addQuery = baseQuery
        addQuery[kSecValueData as String] = data
        addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

        let addStatus = SecItemAdd(addQuery as CFDictionary, nil)
        if addStatus == errSecDuplicateItem {
            let attributes = [
                kSecValueData as String: data,
                kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
            ] as CFDictionary
            let updateStatus = SecItemUpdate(baseQuery as CFDictionary, attributes)
            guard updateStatus == errSecSuccess else {
                throw TokenStoreError.unexpectedKeychainStatus(updateStatus)
            }
            return
        }
        guard addStatus == errSecSuccess else {
            throw TokenStoreError.unexpectedKeychainStatus(addStatus)
        }
    }

    public func clear() throws {
        let status = SecItemDelete(baseQuery as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw TokenStoreError.unexpectedKeychainStatus(status)
        }
    }

    private var baseQuery: [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
    }
}

public struct InMemoryTokenStore: TokenStore, Sendable {
    private final class Storage: @unchecked Sendable {
        let lock = NSLock()
        var token: String?

        init(token: String?) {
            self.token = token
        }
    }

    private let storage: Storage

    public init(initial: String?) {
        storage = Storage(token: initial)
    }

    public func read() throws -> String? {
        storage.lock.withLock { storage.token }
    }

    public func write(_ token: String) throws {
        storage.lock.withLock {
            storage.token = token
        }
    }

    public func clear() throws {
        storage.lock.withLock {
            storage.token = nil
        }
    }
}
