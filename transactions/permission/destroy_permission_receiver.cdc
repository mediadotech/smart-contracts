import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction {
    prepare(account: AuthAccount) {
        let holder <- account.load<@FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath) ?? panic("The account does not have a permission holder.")
        destroy holder
        account.unlink(FanTopPermission.receiverPublicPath)
    }
}
