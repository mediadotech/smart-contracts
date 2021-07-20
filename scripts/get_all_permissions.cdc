import DCAPermission from "../contracts/DCAPermission.cdc"

pub fun main(): { Address: { DCAPermission.Role: Bool } } {
    return DCAPermission.getAllPermissions()
}
