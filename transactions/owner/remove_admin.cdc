import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(address: Address) {
    let owner: FanTopPermissionV2.Owner

    prepare(account: AuthAccount) {
        self.owner = FanTopPermissionV2.Owner(account)
    }

    execute {
        self.owner.removePermission(address, role: FanTopPermissionV2.Role.admin)
    }
}
