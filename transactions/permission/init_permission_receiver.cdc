import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        if account.borrow<&DCAPermission.Holder>(from: /storage/DCAPermission) != nil {
            panic("The account has already been initialized.")
        }

        let holder <- DCAPermission.createHolder(account: account)
        account.save(<-holder, to: /storage/DCAPermission)
        account.link<&AnyResource{DCAPermission.Receiver}>(/public/DCAPermission, target: /storage/DCAPermission)
    }
}
