import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(capacity: Int) {
    let adminRef: &FanTopPermissionV2a.Admin

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
    }

    execute {
        self.adminRef.extendMarketCapacity(capacity)
    }
}
