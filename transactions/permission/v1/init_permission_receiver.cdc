import FanTopPermission from "../../../contracts/FanTopPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        if account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath) != nil {
            panic("The account has already been initialized.")
        }

        let holder <- FanTopPermission.createHolder(account: account)
        account.save(<-holder, to: FanTopPermission.receiverStoragePath)
        account.link<&AnyResource{FanTopPermission.Receiver}>(FanTopPermission.receiverPublicPath, target: FanTopPermission.receiverStoragePath)
    }
}
