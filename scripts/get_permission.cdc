import DCAPermission from "../contracts/DCAPermission.cdc"

pub fun main(address: Address): { DCAPermission.Role: Bool }? {
    return DCAPermission.getAllPermissions()[address]
}
