import FanTopPermissionV2a from "../contracts/FanTopPermissionV2a.cdc"

pub fun main(): { Address: { String: Bool } } {
    return FanTopPermissionV2a.getAllPermissions()
}
