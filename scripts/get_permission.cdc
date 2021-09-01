import FanTopPermission from "../contracts/FanTopPermission.cdc"

pub fun main(address: Address): { FanTopPermission.Role: Bool }? {
    return FanTopPermission.getAllPermissions()[address]
}
