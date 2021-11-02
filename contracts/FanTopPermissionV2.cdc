import FanTopToken from "./FanTopToken.cdc"
import FanTopMarket from "./FanTopMarket.cdc"
import Signature from "./Signature.cdc"

pub contract FanTopPermissionV2 {
    pub enum Role: UInt8 {
        pub case owner
        pub case admin
        pub case operator
        pub case minter
        pub case agent
        pub case user
    }

    pub event PermissionAdded(target: Address, role: String)
    pub event PermissionRemoved(target: Address, role: String)

    pub struct Owner {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
                && FanTopPermissionV2.hasPermission(self.account.address, role: Role.owner)
        }

        pub fun addPermission(_ address: Address, role: Role) {
            pre {
                self.check()
            }
            FanTopPermissionV2.addPermission(address, role: role)
        }

        pub fun removePermission(_ address: Address, role: Role) {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(address, role: role)
        }

        pub init(_ account: AuthAccount) {
            pre {
                FanTopPermissionV2.hasPermission(account.address, role: Role.owner)
            }
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    pub struct Admin {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
                && FanTopPermissionV2.hasPermission(self.account.address, role: Role.admin)
        }

        pub fun addOperator(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.addPermission(address, role: Role.operator)
        }

        pub fun removeOperator(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(address, role: Role.operator)
        }

        pub fun addMinter(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.addPermission(address, role: Role.minter)
        }

        pub fun removeMinter(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(address, role: Role.minter)
        }

        pub fun addAgent(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.addPermission(address, role: Role.agent)
        }

        pub fun removeAgent(_ address: Address) {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(address, role: Role.agent)
        }

        pub fun extendMarketCapacity(_ capacity: Int) {
            pre {
                self.check()
            }
            FanTopMarket.extendCapacity(by: self.account.address, capacity: capacity)
        }

        pub fun revoke() {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(self.account.address, role: Role.admin)
        }

        pub init(_ account: AuthAccount) {
            pre {
                FanTopPermissionV2.hasPermission(account.address, role: Role.admin)
            }
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    pub struct Operator {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
                && FanTopPermissionV2.hasPermission(self.account.address, role: Role.operator)
        }

        pub fun createItem(itemId: String, version: UInt32, limit: UInt32, metadata: { String: String }, active: Bool) {
            pre {
                self.check()
            }
            FanTopToken.createItem(itemId: itemId, version: version, limit: limit, metadata: metadata, active: active)
        }

        pub fun updateMetadata(itemId: String, version: UInt32, metadata: { String: String }) {
            pre {
                self.check()
            }
            FanTopToken.updateMetadata(itemId: itemId, version: version, metadata: metadata)
        }

        pub fun updateLimit(itemId: String, limit: UInt32) {
            pre {
                self.check()
            }
            FanTopToken.updateLimit(itemId: itemId, limit: limit)
        }

        pub fun updateActive(itemId: String, active: Bool) {
            pre {
                self.check()
            }
            FanTopToken.updateActive(itemId: itemId, active: active)
        }

        pub fun revoke() {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(self.account.address, role: Role.operator)
        }

        pub init(_ account: AuthAccount) {
            pre {
                FanTopPermissionV2.hasPermission(account.address, role: Role.operator)
            }
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    pub struct Minter {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
                && FanTopPermissionV2.hasPermission(self.account.address, role: Role.minter)
        }

        pub fun mintToken(refId: String, itemId: String, itemVersion: UInt32, metadata: { String: String }): @FanTopToken.NFT {
            pre {
                self.check()
            }
            return <- FanTopToken.mintToken(refId: refId, itemId: itemId, itemVersion: itemVersion, metadata: metadata)
        }

        pub fun revoke() {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(self.account.address, role: Role.minter)
        }

        pub init(_ account: AuthAccount) {
            pre {
                FanTopPermissionV2.hasPermission(account.address, role: Role.minter)
            }
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    pub struct Agent {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
                && FanTopPermissionV2.hasPermission(self.account.address, role: Role.agent)
        }

        pub fun update(orderId: String, version: UInt32, metadata: { String: String }) {
            pre {
                self.check()
            }
            FanTopMarket.update(agent: self.account.address, orderId: orderId, version: version, metadata: metadata)
        }

        pub fun fulfill(orderId: String, version: UInt32, recipient: &AnyResource{FanTopToken.CollectionPublic}) {
            pre {
                self.check()
            }
            FanTopMarket.fulfill(agent: self.account.address, orderId: orderId, version: version, recipient: recipient)
        }

        pub fun cancel(orderId: String) {
            pre {
                self.check()
            }
            FanTopMarket.cancel(agent: self.account.address, orderId: orderId)
        }

        pub fun revoke() {
            pre {
                self.check()
            }
            FanTopPermissionV2.removePermission(self.account.address, role: Role.agent)
        }

        pub init(_ account: AuthAccount) {
            pre {
                FanTopPermissionV2.hasPermission(account.address, role: Role.agent)
            }
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    pub struct User {
        pub let account: AuthAccount
        pub let block: Block
        pub fun check(): Bool {
            return getCurrentBlock().height == self.block.height
        }

        pub fun sell(
            agent: Address,
            capability: Capability<&FanTopToken.Collection>,
            orderId: String,
            refId: String,
            nftId: UInt64,
            version: UInt32,
            metadata: { String: String },
            signature: [UInt8],
            keyIndex: Int
        ) {
            pre {
                self.check()
                keyIndex >= 0
                FanTopPermissionV2.hasPermission(agent, role: Role.agent)
            }

            let account = getAccount(agent)
            var signedData = agent.toBytes()
                .concat(capability.address.toBytes())
                .concat(orderId.utf8)
                .concat(refId.utf8)
                .concat(nftId.toBigEndianBytes())
                .concat(version.toBigEndianBytes())

            for key in metadata.keys {
                let value = metadata[key]!
                signedData = signedData.concat(key.utf8).concat(value.utf8)
            }

            signedData = signedData.concat(keyIndex.toString().utf8)

            assert(
                Signature.verify(
                    signature: signature,
                    signedData: signedData,
                    account: account,
                    keyIndex: keyIndex
                ),
                message: "Unverified orders cannot be fulfilled"
            )

            FanTopMarket.sell(
                agent: agent,
                capability: capability,
                orderId: orderId,
                refId: refId,
                nftId: nftId,
                version: version,
                metadata: metadata
            )
        }

        pub init(_ account: AuthAccount) {
            self.account = account
            self.block = getCurrentBlock()
        }
    }

    priv let permissions: { Address: {Role: Bool} }

    priv fun addPermission(_ address: Address, role: Role) {
        pre {
            !self.hasPermission(address, role: role): "Permission that already exists cannot be added"
            role != Role.owner: "Owner cannot be changed"
            role != Role.user: "User permissions cannot be changed"
        }

        let permission = self.permissions[address] ?? {} as { Role: Bool}
        permission[role] = true
        self.permissions[address] = permission

        emit PermissionAdded(target: address, role: self.getRoleName(role)!)
    }

    priv fun removePermission(_ address: Address, role: Role) {
        pre {
            self.hasPermission(address, role: role): "Permissions that do not exist cannot be deleted"
            role != Role.owner: "Owner cannot be changed"
            role != Role.user: "User permissions cannot be changed"
        }

        let permission: {Role: Bool} = self.permissions[address]!
        permission[role] = false
        self.permissions[address] = permission

        emit PermissionRemoved(target: address, role: self.getRoleName(role)!)
    }

    pub fun getAllPermissions(): { Address: {Role: Bool} } {
        return self.permissions
    }

    pub fun hasPermission(_ address: Address, role: Role): Bool {
        if let permission = self.permissions[address] {
            return permission[role] ?? false
        }

        return false
    }

    pub fun getRoleName(_ role: Role): String? {
        switch role {
        case Role.owner:
            return "owner"
        case Role.admin:
            return "admin"
        case Role.operator:
            return "operator"
        case Role.minter:
            return "minter"
        case Role.agent:
            return "agent"
        case Role.user:
            return "user"
        default:
            return nil
        }
    }

    pub fun getRole(_ name: String): Role? {
        switch name {
        case "owner":
            return Role.owner
        case "admin":
            return Role.admin
        case "operator":
            return Role.operator
        case "minter":
            return Role.minter
        case "agent":
            return Role.agent
        case "user":
            return Role.user
        default:
            return nil
        }
    }

    init() {
        self.permissions = {
            self.account.address: {
                Role.owner: true
            }
        }
    }
}
