import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(receiver: Address) {
    let adminRef: &FanTopPermissionV2a.Admin
    let receiverRef: &AnyResource{FanTopPermissionV2a.Receiver}

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
        self.receiverRef = getAccount(receiver).getCapability(FanTopPermissionV2a.receiverPublicPath).borrow<&AnyResource{FanTopPermissionV2a.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.adminRef.addOperator(receiver: self.receiverRef)
    }
}
