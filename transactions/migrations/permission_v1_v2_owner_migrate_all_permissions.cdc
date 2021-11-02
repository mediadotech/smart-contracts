import FanTopPermission from "../../contracts/FanTopPermission.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

pub fun toV2Role(_ v1: FanTopPermission.Role): FanTopPermissionV2.Role? {
    switch v1 {
    case FanTopPermission.Role.admin:
        return FanTopPermissionV2.Role.admin
    case FanTopPermission.Role.operator:
        return FanTopPermissionV2.Role.operator
    case FanTopPermission.Role.minter:
        return FanTopPermissionV2.Role.minter
    default:
        return nil
    }
}

transaction() {
    let ownerV1: &FanTopPermission.Owner
    let ownerV2: FanTopPermissionV2.Owner

    prepare(owner: AuthAccount) {
        self.ownerV1 = owner.borrow<&FanTopPermission.Owner>(from: /storage/FanTopOwner)
            ?? panic("No owner resource in storage")
        self.ownerV2 = FanTopPermissionV2.Owner(owner)
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
