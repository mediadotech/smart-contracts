import FanTopPermissionV2 from "../contracts/FanTopPermissionV2.cdc"

pub fun main(): { Address: { FanTopPermissionV2.Role: Bool } } {
    return FanTopPermissionV2.getAllPermissions()
}
