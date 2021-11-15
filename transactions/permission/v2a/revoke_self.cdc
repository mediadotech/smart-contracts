import FanTopPermissionV2a from "../../../contracts/FanTopPermissionV2a.cdc"

transaction(role: String) {
    let holderRef: &FanTopPermissionV2a.Holder

    prepare(account: AuthAccount) {
        self.holderRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)
            ?? panic("No holder in storage")
    }

    execute {
        self.holderRef.revoke(role)
    }
}
