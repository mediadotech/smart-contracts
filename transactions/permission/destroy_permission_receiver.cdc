import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        let holder <- account.load<@DCAPermission.Holder>(from: DCAPermission.receiverStoragePath) ?? panic("The account does not have a permission holder.")
        destroy holder
        account.unlink(DCAPermission.receiverPublicPath)
    }
}
