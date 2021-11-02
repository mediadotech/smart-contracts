import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction() {
    let minter: FanTopPermissionV2.Minter

    prepare(account: AuthAccount) {
        self.minter = FanTopPermissionV2.Minter(account)
    }

    execute {
        self.minter.revoke()
    }
}
