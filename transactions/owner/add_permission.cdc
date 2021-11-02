import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(address: Address, role: String) {
    let owner: FanTopPermissionV2.Owner
    let role: FanTopPermissionV2.Role

    prepare(account: AuthAccount) {
        self.owner = FanTopPermissionV2.Owner(account)
        self.role = FanTopPermissionV2.getRole(role) ?? panic("Unknown roles cannot be added")
    }

    execute {
        self.owner.addPermission(address, role: self.role)
    }
}
