import FanTopPermission from "../contracts/FanTopPermission.cdc"

pub fun getRoleName(_ role: FanTopPermission.Role): String? {
    switch role {
        case FanTopPermission.Role.owner:
            return "owner"
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

pub fun main(): { Address: [String] } {
    let resultMap: { Address: [String] } = {}
    let addressPermissionMap = FanTopPermission.getAllPermissions()
    for address in addressPermissionMap.keys {
        let permissionMap = addressPermissionMap[address]!
        resultMap[address] = []
        for role in permissionMap.keys {
            if permissionMap[role]! {
                resultMap[address]!.append(getRoleName(role)!)
            }
        }
    }
    return resultMap
}
