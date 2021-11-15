import FanTopPermissionV2a from "../../../contracts/FanTopPermissionV2a.cdc"

transaction {
    prepare(account: AuthAccount) {
        if account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath) != nil {
            panic("The account has already been initialized.")
        }

        let holder <- FanTopPermissionV2a.createHolder(account: account)
        account.save(<-holder, to: FanTopPermissionV2a.receiverStoragePath)
        account.link<&AnyResource{FanTopPermissionV2a.Receiver}>(FanTopPermissionV2a.receiverPublicPath, target: FanTopPermissionV2a.receiverStoragePath)
    }
}
