import FanTopPermissionV2 from "../contracts/FanTopPermissionV2.cdc"

pub fun main(address: Address): { String: Bool }? {
    if let permissions = FanTopPermissionV2.getAllPermissions()[address] {
        let result: { String: Bool } = {}
        for role in permissions.keys {
            result[FanTopPermissionV2.getRoleName(role)!] = permissions[role]!
        }
        return result
    }
    return nil
}
