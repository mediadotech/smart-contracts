import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        let holder <- account.load<@DCAPermission.Holder>(from: /storage/DCAPermission) ?? panic("The account does not have a permission holder.")
        destroy holder
        account.unlink(/public/DCAPermission)
    }
}
