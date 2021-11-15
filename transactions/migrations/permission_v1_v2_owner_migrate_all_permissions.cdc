import FanTopPermission from "../../contracts/FanTopPermission.cdc"
import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

pub fun toV2Role(_ v1: FanTopPermission.Role): String? {
    switch v1 {
    case FanTopPermission.Role.admin:
        return "admin"
    case FanTopPermission.Role.operator:
        return "operator"
    case FanTopPermission.Role.minter:
        return "minter"
    default:
        return nil
    }
}

transaction() {
    let ownerV1: &FanTopPermission.Owner
    let ownerV2: FanTopPermissionV2a.Owner

    prepare(owner: AuthAccount) {
        self.ownerV1 = owner.borrow<&FanTopPermission.Owner>(from: FanTopPermissionV2a.ownerStoragePath)
            ?? panic("No owner resource in storage")
        self.ownerV2 = FanTopPermissionV2a.Owner(owner)
    }

    execute {
        let permissionMap = FanTopPermission.getAllPermissions()
        for address in permissionMap.keys {
            let permissions = permissionMap[address]!
            for role in permissions.keys {
                if permissions[role] ?? false {
                    self.ownerV1.removePermission(address: address, as: role)

                    let roleV2 = toV2Role(role) ?? panic("Unexpected role")
                    self.ownerV2.addPermission(address, role: roleV2)
                }
            }
        }
    }
}
