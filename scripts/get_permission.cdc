import FanTopPermissionV2a from "../contracts/FanTopPermissionV2a.cdc"

pub fun main(address: Address): { String: Bool }? {
    return FanTopPermissionV2a.getAllPermissions()[address]
}
