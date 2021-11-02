import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

pub fun toRole(_ role: String): FanTopPermissionV2.Role? {
    switch role {
    case "owner":
        return FanTopPermissionV2.Role.owner
    case "admin":
        return FanTopPermissionV2.Role.admin
    case "operator":
        return FanTopPermissionV2.Role.operator
    case "minter":
        return FanTopPermissionV2.Role.minter
    default:
        return nil
    }
}

transaction(address: Address, role: String) {
    let owner: FanTopPermissionV2.Owner
    let role: FanTopPermissionV2.Role

    prepare(account: AuthAccount) {
        self.owner = FanTopPermissionV2.Owner(account)
        self.role = toRole(role) ?? panic("Unknown roles cannot be removed")
    }

    execute {
        self.owner.removePermission(address, role: self.role)
    }
}
