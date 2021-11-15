import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(address: Address, role: String) {
    let owner: &FanTopPermissionV2a.Owner

    prepare(account: AuthAccount) {
        self.owner = account.borrow<&FanTopPermissionV2a.Owner>(from: FanTopPermissionV2a.ownerStoragePath)
            ?? panic("No owner resource in storage")
    }

    execute {
        self.owner.removePermission(address, role: role)
    }
}
