import FanTopPermissionV2a from "../contracts/FanTopPermissionV2a.cdc"

pub fun main(address: Address, role: String): Bool {
    return FanTopPermissionV2a.hasPermission(address, role: role)
}
