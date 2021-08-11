import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        if account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath) != nil {
            panic("The account has already been initialized.")
        }

        let holder <- DCAPermission.createHolder(account: account)
        account.save(<-holder, to: DCAPermission.receiverStoragePath)
        account.link<&AnyResource{DCAPermission.Receiver}>(DCAPermission.receiverPublicPath, target: DCAPermission.receiverStoragePath)
    }
}
