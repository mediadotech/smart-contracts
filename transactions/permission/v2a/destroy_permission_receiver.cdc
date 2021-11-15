import FanTopPermissionV2a from "../../../contracts/FanTopPermissionV2a.cdc"

transaction {
    prepare(account: AuthAccount) {
        let holder <- account.load<@FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath) ?? panic("The account does not have a permission holder.")
        destroy holder
        account.unlink(FanTopPermissionV2a.receiverPublicPath)
    }
}
