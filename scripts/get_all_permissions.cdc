import FanTopPermission from "../contracts/FanTopPermission.cdc"

pub fun main(): { Address: { FanTopPermission.Role: Bool } } {
    return FanTopPermission.getAllPermissions()
}
