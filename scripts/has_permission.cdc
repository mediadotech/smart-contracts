import FanTopPermissionV2 from "../contracts/FanTopPermissionV2.cdc"

pub fun main(address: Address, role: String): Bool {
    return FanTopPermissionV2.hasPermission(address, role: FanTopPermissionV2.getRole(role)!)
}
